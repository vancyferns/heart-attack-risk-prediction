import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision import models
import segmentation_models_pytorch as smp
import numpy as np
import cv2
from PIL import Image
import io

# Define model paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
UNET_PATH = os.path.join(MODELS_DIR, 'unet', 'unet_best_advanced.pth')
EFFICIENTNET_PATH = os.path.join(MODELS_DIR, 'efficientnet', 'efficientnet_b3_best.pth')

# Global model instances
unet_model = None
efficientnet_model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


# ===========================
# UNet Model Definition
# ===========================
class UNet(nn.Module):
    """UNet architecture for image segmentation"""
    def __init__(self, in_channels=3, out_channels=1):
        super(UNet, self).__init__()
        
        # Encoder
        self.enc1 = self.conv_block(in_channels, 64)
        self.enc2 = self.conv_block(64, 128)
        self.enc3 = self.conv_block(128, 256)
        self.enc4 = self.conv_block(256, 512)
        
        # Bottleneck
        self.bottleneck = self.conv_block(512, 1024)
        
        # Decoder
        self.upconv4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.dec4 = self.conv_block(1024, 512)
        
        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = self.conv_block(512, 256)
        
        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = self.conv_block(256, 128)
        
        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec1 = self.conv_block(128, 64)
        
        # Final output
        self.out = nn.Conv2d(64, out_channels, kernel_size=1)
        
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
    def conv_block(self, in_ch, out_ch):
        return nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )
    
    def forward(self, x):
        # Encoder
        enc1 = self.enc1(x)
        enc2 = self.enc2(self.pool(enc1))
        enc3 = self.enc3(self.pool(enc2))
        enc4 = self.enc4(self.pool(enc3))
        
        # Bottleneck
        bottleneck = self.bottleneck(self.pool(enc4))
        
        # Decoder
        dec4 = self.upconv4(bottleneck)
        dec4 = torch.cat([dec4, enc4], dim=1)
        dec4 = self.dec4(dec4)
        
        dec3 = self.upconv3(dec4)
        dec3 = torch.cat([dec3, enc3], dim=1)
        dec3 = self.dec3(dec3)
        
        dec2 = self.upconv2(dec3)
        dec2 = torch.cat([dec2, enc2], dim=1)
        dec2 = self.dec2(dec2)
        
        dec1 = self.upconv1(dec2)
        dec1 = torch.cat([dec1, enc1], dim=1)
        dec1 = self.dec1(dec1)
        
        return torch.sigmoid(self.out(dec1))


class DoubleConv(nn.Module):
    """(conv => BN => ReLU) * 2"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.net(x)


class Down(nn.Module):
    """Downscaling with maxpool then double conv"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.pool_conv = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x):
        return self.pool_conv(x)


class Up(nn.Module):
    """Upscaling then double conv"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
        self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1, x2):
        x1 = self.up(x1)

        diff_y = x2.size()[2] - x1.size()[2]
        diff_x = x2.size()[3] - x1.size()[3]

        x1 = F.pad(
            x1,
            [
                diff_x // 2,
                diff_x - diff_x // 2,
                diff_y // 2,
                diff_y - diff_y // 2,
            ],
        )

        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)


class UNetLegacy(nn.Module):
    """UNet variant matching the precise dimensions of the trained UNetSmall checkpoint."""
    def __init__(self, n_channels=3, n_classes=1):
        super().__init__()
        # EXACT SHAPES FOR 64-CHANNEL BASE
        self.inc = DoubleConv(n_channels, 64)
        self.down1 = Down(64, 128)
        self.down2 = Down(128, 256)
        self.down3 = Down(256, 512)
        self.down4 = Down(512, 512)  # Custom flat bottleneck
        
        # Up blocks
        self.up1 = Up(1024, 256)  
        self.up2 = Up(512, 128)   
        self.up3 = Up(256, 64)    
        self.up4 = Up(128, 64)    
        
        self.outc = nn.Conv2d(64, n_classes, kernel_size=1)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)
        x = self.up1(x5, x4)
        x = self.up2(x, x3)
        x = self.up3(x, x2)
        x = self.up4(x, x1)
        logits = self.outc(x)
        return torch.sigmoid(logits)


def _extract_state_dict(checkpoint):
    """Extract model state_dict from various checkpoint formats."""
    if isinstance(checkpoint, dict):
        for key in ('state_dict', 'model_state', 'model_state_dict', 'net', 'model'):
            if key in checkpoint and isinstance(checkpoint[key], dict):
                return checkpoint[key]
    return checkpoint


def _looks_like_legacy_unet(state_dict):
    """Detect legacy UNet checkpoints by key namespace."""
    if not isinstance(state_dict, dict):
        return False
    keys = list(state_dict.keys())
    return any(k.startswith('inc.') for k in keys) and any(k.startswith('up1.') for k in keys)


def _looks_like_smp_unet(state_dict):
    """Detect segmentation_models_pytorch-style UNet checkpoints."""
    if not isinstance(state_dict, dict):
        return False
    keys = list(state_dict.keys())
    return any(k.startswith('encoder._conv_stem') for k in keys) and any(k.startswith('decoder.blocks.') for k in keys)


# ===========================
# EfficientNet Model Setup
# ===========================
def create_efficientnet_model(num_classes=1, nested_classifier=False):
    """Create EfficientNet-B3 model for classification (binary output)"""
    model = models.efficientnet_b3(weights=None)
    num_features = model.classifier[1].in_features
    if nested_classifier:
        # Matches checkpoint keys like classifier.1.1.weight
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Sequential(
                nn.Dropout(p=0.3, inplace=True),
                nn.Linear(num_features, num_classes)
            )
        )
    else:
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(num_features, num_classes)
        )
    return model


class SMPUNet(smp.Unet):
    """SMP UNet variant that returns probability maps for inference."""
    def forward(self, x):
        logits = super().forward(x)
        return torch.sigmoid(logits)


def create_smp_unet_model():
    """Create SMP UNet matching the new advanced UNet checkpoint."""
    return SMPUNet(
        encoder_name='efficientnet-b0',
        encoder_weights=None,
        in_channels=3,
        classes=1,
        activation=None
    )


# ===========================
# Model Loading Functions
# ===========================
def load_models():
    """Load UNet and EfficientNet models into memory."""
    global unet_model, efficientnet_model
    
    print("🔄 Loading ML models...")
    
    # Load UNet
    try:
        if os.path.exists(UNET_PATH):
            checkpoint = torch.load(UNET_PATH, map_location=device)
            unet_state = _extract_state_dict(checkpoint)
            loaded_unet_model = None

            if _looks_like_smp_unet(unet_state):
                loaded_unet_model = create_smp_unet_model()
            elif _looks_like_legacy_unet(unet_state):
                loaded_unet_model = UNetLegacy(n_channels=3, n_classes=1)
            else:
                loaded_unet_model = UNet(in_channels=3, out_channels=1)

            loaded_unet_model.load_state_dict(unet_state)
            loaded_unet_model.to(device)
            loaded_unet_model.eval()
            unet_model = loaded_unet_model
            print(f"✅ UNet model loaded from {UNET_PATH}")
        else:
            print(f"⚠️  UNet model not found at {UNET_PATH}")
    except Exception as e:
        print(f"❌ Failed to load UNet: {e}")
    
    # Load EfficientNet
    try:
        if os.path.exists(EFFICIENTNET_PATH):
            checkpoint = torch.load(EFFICIENTNET_PATH, map_location=device)
            eff_state = _extract_state_dict(checkpoint)
            nested_classifier = isinstance(eff_state, dict) and 'classifier.1.1.weight' in eff_state
            loaded_efficientnet_model = create_efficientnet_model(num_classes=1, nested_classifier=nested_classifier)
            # Handle different checkpoint formats
            loaded_efficientnet_model.load_state_dict(eff_state)
            loaded_efficientnet_model.to(device)
            loaded_efficientnet_model.eval()
            efficientnet_model = loaded_efficientnet_model
            print(f"✅ EfficientNet model loaded from {EFFICIENTNET_PATH}")
        else:
            print(f"⚠️  EfficientNet model not found at {EFFICIENTNET_PATH}")
    except Exception as e:
        print(f"❌ Failed to load EfficientNet: {e}")

    if unet_model is None or efficientnet_model is None:
        raise RuntimeError("Required models failed to load (UNet and/or EfficientNet).")
    
    print("🎉 Model loading complete!")


# ===========================
# Image Preprocessing & Fusion
# ===========================
def apply_mask_overlay(img_rgb, mask_gray, alpha=0.35):
    """Highlights the U-Net vessels in red over the original image."""
    mask_resized = cv2.resize(mask_gray, (img_rgb.shape[1], img_rgb.shape[0]), interpolation=cv2.INTER_NEAREST)
    red_mask = np.zeros_like(img_rgb)
    red_mask[..., 0] = mask_resized  # Add to Red channel
    blended = (img_rgb.astype(np.float32) * (1.0 - alpha) + red_mask.astype(np.float32) * alpha)
    return np.clip(blended, 0, 255).astype(np.uint8)

def get_efficientnet_transforms():
    """Exact transforms used during EfficientNet training"""
    return transforms.Compose([
        transforms.Resize((300, 300)), # EfficientNet-B3 requires 300x300
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

def get_unet_transforms():
    """Exact transforms used during UNet training"""
    return transforms.Compose([
        transforms.Resize((384, 384)), # UNet trained on 384x384
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])


# ===========================
# Prediction Functions
# ===========================
def predict_from_image(image_bytes):
    """
    1. Pass raw image through UNet to get vessels
    2. Overlay vessels in red onto the original image
    3. Pass the fused image to EfficientNet for risk prediction
    """
    if efficientnet_model is None or unet_model is None:
        raise ValueError("Models not fully loaded")
    
    try:
        # 1. Load the raw image
        raw_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        raw_cv2 = np.array(raw_pil) # Convert to CV2 format for overlay later
        
        # 2. Get UNet Segmentation Mask
        unet_t = get_unet_transforms()
        unet_input = unet_t(raw_pil).unsqueeze(0).to(device)
        
        with torch.no_grad():
            unet_output = unet_model(unet_input)
            # Binarize the mask at 0.5 threshold
            mask = (unet_output.squeeze().cpu().numpy() > 0.5).astype(np.uint8) * 255
            
        # 3. Fuse the Mask with the Original Image
        fused_cv2 = apply_mask_overlay(raw_cv2, mask)
        fused_pil = Image.fromarray(fused_cv2)
        
        # 4. Prepare Fused Image for EfficientNet
        eff_t = get_efficientnet_transforms()
        eff_input = eff_t(fused_pil).unsqueeze(0).to(device)
        
        # 5. Make Final Prediction
        with torch.no_grad():
            outputs = efficientnet_model(eff_input)
            prob = torch.sigmoid(outputs)[0][0].item() * 100
            
            # --- PIECEWISE CONFIDENCE MATH ---
            if prob >= 40:
                confidence = ((prob - 40.0) / 60.0) * 100
            else:
                confidence = ((40.0 - prob) / 40.0) * 100
            
            # Using your optimized clinical thresholds
            if prob >= 70:
                risk_level = "High"
            elif prob >= 40:
                risk_level = "Medium"
            else:
                risk_level = "Low"
                
            return {
                'risk_score': round(prob, 2),
                'risk_level': risk_level,
                'confidence': round(confidence, 2),
                'prediction': int(prob >= 40)
            }
    
    except Exception as e:
        raise Exception(f"Image prediction failed: {str(e)}")


def segment_image_with_unet(image_bytes):
    """
    Apply UNet segmentation to identify regions of interest
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        numpy array: Segmentation mask
    """
    if unet_model is None:
        raise ValueError("UNet model not loaded")
    
    try:
        raw_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        unet_t = get_unet_transforms()
        image_tensor = unet_t(raw_pil).unsqueeze(0).to(device)
        
        with torch.no_grad():
            segmentation = unet_model(image_tensor)
            mask = segmentation.squeeze().cpu().numpy()
            
        return mask
    
    except Exception as e:
        raise Exception(f"Image segmentation failed: {str(e)}")


# ===========================
# Initialization
# ===========================
def initialize_models():
    """Initialize all models on startup"""
    try:
        load_models()
        return True
    except Exception as e:
        print(f"❌ Model initialization failed: {e}")
        return False
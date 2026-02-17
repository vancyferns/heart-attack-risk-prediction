import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models
import xgboost as xgb
import numpy as np
from PIL import Image
import io

# Define model paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
UNET_PATH = os.path.join(MODELS_DIR, 'best.pth')
EFFICIENTNET_PATH = os.path.join(MODELS_DIR, 'efficientnet_best.pth')
XGBOOST_PATH = os.path.join(MODELS_DIR, 'xgb_model.json')

# Global model instances
unet_model = None
efficientnet_model = None
xgboost_model = None
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


# ===========================
# EfficientNet Model Setup
# ===========================
def create_efficientnet_model(num_classes=2):
    """Create EfficientNet-B0 model for classification"""
    model = models.efficientnet_b0(weights=None)
    # Modify the classifier for binary/multi-class classification
    num_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2, inplace=True),
        nn.Linear(num_features, num_classes)
    )
    return model


# ===========================
# Model Loading Functions
# ===========================
def load_models():
    """Load all three models into memory"""
    global unet_model, efficientnet_model, xgboost_model
    
    print("🔄 Loading ML models...")
    
    # Load UNet
    try:
        if os.path.exists(UNET_PATH):
            unet_model = UNet(in_channels=3, out_channels=1)
            checkpoint = torch.load(UNET_PATH, map_location=device)
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                unet_model.load_state_dict(checkpoint['model_state_dict'])
            else:
                unet_model.load_state_dict(checkpoint)
            
            unet_model.to(device)
            unet_model.eval()
            print(f"✅ UNet model loaded from {UNET_PATH}")
        else:
            print(f"⚠️  UNet model not found at {UNET_PATH}")
    except Exception as e:
        print(f"❌ Failed to load UNet: {e}")
    
    # Load EfficientNet
    try:
        if os.path.exists(EFFICIENTNET_PATH):
            efficientnet_model = create_efficientnet_model(num_classes=2)
            checkpoint = torch.load(EFFICIENTNET_PATH, map_location=device)
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                efficientnet_model.load_state_dict(checkpoint['model_state_dict'])
            else:
                efficientnet_model.load_state_dict(checkpoint)
            
            efficientnet_model.to(device)
            efficientnet_model.eval()
            print(f"✅ EfficientNet model loaded from {EFFICIENTNET_PATH}")
        else:
            print(f"⚠️  EfficientNet model not found at {EFFICIENTNET_PATH}")
    except Exception as e:
        print(f"❌ Failed to load EfficientNet: {e}")
    
    # Load XGBoost
    try:
        if os.path.exists(XGBOOST_PATH):
            xgboost_model = xgb.Booster()
            xgboost_model.load_model(XGBOOST_PATH)
            print(f"✅ XGBoost model loaded from {XGBOOST_PATH}")
        else:
            print(f"⚠️  XGBoost model not found at {XGBOOST_PATH}")
    except Exception as e:
        print(f"❌ Failed to load XGBoost: {e}")
    
    print("🎉 Model loading complete!")


# ===========================
# Image Preprocessing
# ===========================
def get_image_transforms():
    """Get image preprocessing transforms"""
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])


def preprocess_image(image_bytes):
    """Preprocess image for model input"""
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    transform = get_image_transforms()
    image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    return image_tensor.to(device)


# ===========================
# Prediction Functions
# ===========================
def predict_from_image(image_bytes):
    """
    Predict heart disease risk from eye scan image using EfficientNet
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        dict: Prediction results with risk_score, risk_level, and confidence
    """
    if efficientnet_model is None:
        raise ValueError("EfficientNet model not loaded")
    
    try:
        # Preprocess image
        image_tensor = preprocess_image(image_bytes)
        
        # Make prediction
        with torch.no_grad():
            outputs = efficientnet_model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            
            # Extract probabilities for high risk (assuming class 1 is high risk)
            high_risk_prob = probabilities[0][1].item() * 100
            
            # Determine risk level
            if high_risk_prob >= 70:
                risk_level = "High"
            elif high_risk_prob >= 40:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            return {
                'risk_score': round(high_risk_prob, 2),
                'risk_level': risk_level,
                'confidence': round(confidence.item() * 100, 2),
                'prediction': int(predicted.item())
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
        image_tensor = preprocess_image(image_bytes)
        
        with torch.no_grad():
            segmentation = unet_model(image_tensor)
            mask = segmentation.squeeze().cpu().numpy()
            
        return mask
    
    except Exception as e:
        raise Exception(f"Image segmentation failed: {str(e)}")


def predict_from_tabular(features):
    """
    Predict heart disease risk from tabular data using XGBoost
    
    Args:
        features: dict with keys: age, sex, cp, trestbps, chol, fbs, thalach, exang, oldpeak
        
    Returns:
        dict: Prediction results with risk_score and risk_level
    """
    if xgboost_model is None:
        raise ValueError("XGBoost model not loaded")
    
    try:
        # Expected feature order (adjust based on your training)
        feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'thalach', 'exang', 'oldpeak']
        
        # Extract features in correct order
        feature_values = []
        for fname in feature_names:
            value = features.get(fname)
            if value is None:
                raise ValueError(f"Missing required feature: {fname}")
            feature_values.append(float(value))
        
        # Create DMatrix for XGBoost
        dmatrix = xgb.DMatrix(np.array([feature_values]), feature_names=feature_names)
        
        # Make prediction
        prediction = xgboost_model.predict(dmatrix)[0]
        
        # Convert to risk score (0-100)
        risk_score = float(prediction * 100)
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'features_used': feature_names
        }
    
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise Exception(f"Tabular prediction failed: {str(e)}")


def predict_combined(image_bytes, features=None):
    """
    Combined prediction using both image and tabular data
    
    Args:
        image_bytes: Raw image bytes
        features: Optional dict with tabular features
        
    Returns:
        dict: Combined prediction results
    """
    results = {}
    
    # Image-based prediction
    if image_bytes:
        image_pred = predict_from_image(image_bytes)
        results['image_prediction'] = image_pred
        results['image_risk_score'] = image_pred['risk_score']
    
    # Tabular-based prediction
    if features and all(features.get(f) is not None for f in ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'thalach', 'exang', 'oldpeak']):
        tabular_pred = predict_from_tabular(features)
        results['tabular_prediction'] = tabular_pred
        results['tabular_risk_score'] = tabular_pred['risk_score']
    
    # Combined risk score (weighted average if both available)
    if 'image_risk_score' in results and 'tabular_risk_score' in results:
        # 60% weight to image, 40% to tabular (adjust as needed)
        combined_score = (results['image_risk_score'] * 0.6 + results['tabular_risk_score'] * 0.4)
        results['combined_risk_score'] = round(combined_score, 2)
        
        if combined_score >= 70:
            results['final_risk_level'] = "High"
        elif combined_score >= 40:
            results['final_risk_level'] = "Medium"
        else:
            results['final_risk_level'] = "Low"
    elif 'image_risk_score' in results:
        results['combined_risk_score'] = results['image_risk_score']
        results['final_risk_level'] = results['image_prediction']['risk_level']
    elif 'tabular_risk_score' in results:
        results['combined_risk_score'] = results['tabular_risk_score']
        results['final_risk_level'] = results['tabular_prediction']['risk_level']
    else:
        raise ValueError("No valid prediction inputs provided")
    
    return results


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

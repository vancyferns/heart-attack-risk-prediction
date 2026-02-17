# ML Model Integration Guide

## Overview

Your application now integrates three trained machine learning models for heart disease risk prediction:

1. **UNet** - Image segmentation model (best.pth)
2. **EfficientNet-B0** - Image classification model (efficientnet_best.pth)  
3. **XGBoost** - Tabular data prediction model (xgb_model.json)

## ✅ What Has Been Integrated

### Backend Changes

#### 1. **New File: `backend/model_loader.py`**
   - Loads all three models on application startup
   - Contains model architectures (UNet, EfficientNet)
   - Provides prediction functions:
     - `predict_from_image(image_bytes)` - Uses EfficientNet for eye scan predictions
     - `predict_from_tabular(features)` - Uses XGBoost for health data predictions
     - `predict_combined(image_bytes, features)` - Combines both predictions
     - `segment_image_with_unet(image_bytes)` - UNet segmentation (available for future use)

#### 2. **Updated: `backend/app.py`**
   - Imports ML model functions
   - Initializes models on startup
   - Added three new prediction endpoints:
     - `POST /api/predict/image` - Eye scan image prediction
     - `POST /api/predict/tabular` - Health data prediction
     - `POST /api/predict/combined` - Combined prediction

#### 3. **Updated: `backend/requirements.txt`**
   - Added ML libraries:
     - `torch` - PyTorch for neural networks
     - `torchvision` - Image transformations
     - `xgboost` - XGBoost model
     - `pillow` - Image processing
     - `numpy` - Numerical operations
     - `scikit-learn` - ML utilities

### Frontend Changes

#### 1. **Updated: `frontend/src/components/EyeScanUpload.jsx`**
   - Now calls `/api/predict/image` endpoint with real uploaded image
   - Sends multipart/form-data with the image file
   - Displays real predictions from EfficientNet model
   - Shows risk score, risk level, and confidence
   - Generates recommendations based on predicted risk level

## 📊 Model Details

### 1. EfficientNet (Image Classifier)
- **Input**: Eye scan image (224x224, RGB)
- **Output**: Binary classification (Low Risk = 0, High Risk = 1)
- **Returns**:
  - `risk_score` (0-100): Probability of high risk
  - `risk_level` (Low/Medium/High): Based on risk_score thresholds
  - `confidence` (0-100): Model confidence in prediction

### 2. XGBoost (Tabular Predictor)
- **Input**: 9 health features:
  - `age` - Patient age
  - `sex` - Sex (1 = male, 0 = female)
  - `cp` - Chest pain type (0-3)
  - `trestbps` - Resting blood pressure (mm Hg)
  - `chol` - Serum cholesterol (mg/dl)
  - `fbs` - Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)
  - `thalach` - Maximum heart rate achieved
  - `exang` - Exercise induced angina (1 = yes, 0 = no)
  - `oldpeak` - ST depression induced by exercise
- **Output**: Risk score (0-100) and risk level

### 3. UNet (Image Segmentation)
- **Purpose**: Segment regions of interest in eye scans
- **Status**: Loaded but not currently used in prediction flow
- **Future Use**: Can enhance image analysis by identifying specific eye features

## 🚀 API Endpoints

### 1. Image Prediction
```http
POST /api/predict/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: <file>

Response:
{
  "success": true,
  "prediction": {
    "risk_score": 78.45,
    "risk_level": "High",
    "confidence": 92.3,
    "prediction": 1
  },
  "record_id": "507f1f77bcf86cd799439011"
}
```

### 2. Tabular Prediction
```http
POST /api/predict/tabular
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "age": 55,
  "sex": 1,
  "cp": 2,
  "trestbps": 140,
  "chol": 250,
  "fbs": 1,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 2.5
}

Response:
{
  "success": true,
  "prediction": {
    "risk_score": 65.82,
    "risk_level": "Medium",
    "features_used": ["age", "sex", "cp", ...]
  },
  "record_id": "507f1f77bcf86cd799439011"
}
```

### 3. Combined Prediction
```http
POST /api/predict/combined
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: <file> (optional)
- age: 55
- sex: 1
- cp: 2
- trestbps: 140
- chol: 250
- fbs: 1
- thalach: 150
- exang: 0
- oldpeak: 2.5

Response:
{
  "success": true,
  "prediction": {
    "image_prediction": {...},
    "tabular_prediction": {...},
    "image_risk_score": 78.45,
    "tabular_risk_score": 65.82,
    "combined_risk_score": 73.52,  // 60% image + 40% tabular
    "final_risk_level": "High"
  },
  "record_id": "507f1f77bcf86cd799439011"
}
```

## 📝 Risk Level Thresholds

| Risk Score | Risk Level |
|-----------|-----------|
| 70-100 | High |
| 40-69 | Medium |
| 0-39 | Low |

## 🔧 Installation & Setup

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

**Note**: PyTorch installation may require specific commands based on your system:
- **CPU Only**: `pip install torch torchvision`
- **CUDA 11.8**: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118`
- **CUDA 12.1**: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121`

### 2. Verify Model Files
Ensure these files exist in the `models/` directory:
```
models/
├── best.pth              # UNet model
├── efficientnet_best.pth # EfficientNet model
└── xgb_model.json       # XGBoost model
```

### 3. Start Backend
```bash
cd backend
python app.py
```

You should see:
```
🤖 Initializing ML models...
🔄 Loading ML models...
✅ UNet model loaded from ...
✅ EfficientNet model loaded from ...
✅ XGBoost model loaded from ...
🎉 Model loading complete!
✅ ML models ready for predictions
```

### 4. Test Prediction
Upload an eye scan through the frontend, and watch the backend console for prediction logs.

## 🎯 Current Application Flow

1. **User Login** → Dashboard
2. **New Patient Scan** → Patient Registration (name, age, email, etc.)
3. **Eye Scan Upload** → Upload image
4. **Backend Processing**:
   - Receives image via `/api/predict/image`
   - Preprocesses image (resize to 224x224, normalize)
   - Runs through EfficientNet model
   - Calculates risk score and level
   - Saves record to database
5. **Results Display** → Shows risk level, score, recommendations

## 🔮 Future Enhancements

### Option 1: Add Health Data Form (for XGBoost)
Create a new component to collect the 9 health features and use `/api/predict/tabular` endpoint.

### Option 2: Enhanced Prediction Flow
Modify EyeScanUpload to also collect health data and use `/api/predict/combined` for more accurate predictions.

### Option 3: UNet Integration
Use UNet segmentation to highlight regions of interest in eye scans before classification.

## 🐛 Troubleshooting

### Models Not Loading
**Problem**: Model files not found
**Solution**: Verify model files are in `models/` directory relative to project root

### Prediction Errors
**Problem**: "EfficientNet model not loaded"
**Solution**: Check backend startup logs for model loading errors

### Image Upload Fails
**Problem**: 400/500 errors on prediction
**Solution**: 
- Verify JWT token is included in request
- Check image format (JPG, PNG, GIF)
- Check backend console for detailed error messages

### Low Accuracy
**Problem**: Predictions don't seem accurate
**Solution**: 
- Verify model files are the correct trained models
- Check if image preprocessing matches training preprocessing
- Ensure feature order for XGBoost matches training order

## 📚 Code Examples

### Using Image Prediction in React
```jsx
const handleImagePrediction = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    'http://localhost:5000/api/predict/image',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  console.log(response.data.prediction);
};
```

### Using Tabular Prediction
```jsx
const handleTabularPrediction = async (healthData) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    'http://localhost:5000/api/predict/tabular',
    healthData,  // {age: 55, sex: 1, cp: 2, ...}
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log(response.data.prediction);
};
```

## ✅ Testing Checklist

- [ ] Backend starts without model loading errors
- [ ] All three models show "loaded successfully" messages
- [ ] Eye scan upload works and returns predictions
- [ ] Risk scores are between 0-100
- [ ] Risk levels match threshold rules
- [ ] Predictions are saved to database
- [ ] Frontend displays predictions correctly
- [ ] Recommendations are generated appropriately

## 📞 Support

If you encounter issues:
1. Check backend console logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Ensure model files match expected architectures
4. Test with known good images

---

**Integration Status**: ✅ Complete
**Models Active**: EfficientNet (image), XGBoost (tabular - API ready), UNet (loaded, not used)
**Endpoints**: `/api/predict/image`, `/api/predict/tabular`, `/api/predict/combined`

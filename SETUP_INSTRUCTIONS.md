# 🚀 Quick Setup Instructions

## ⚠️ Important: Install Dependencies First!

The import errors you're seeing are expected - the ML libraries need to be installed.

## Step-by-Step Setup

### 1. Install Backend Dependencies

```powershell
# Navigate to backend directory
cd backend

# Install all Python dependencies
pip install -r requirements.txt
```

**Note**: If you have CUDA-capable GPU, install PyTorch with CUDA support:

```powershell
# For CUDA 11.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# For CUDA 12.1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# For CPU only (slower but works everywhere)
pip install torch torchvision
```

### 2. Verify Model Files

Make sure these files exist in the `models/` folder:
```
models/
├── best.pth              ← UNet model
├── efficientnet_best.pth ← EfficientNet model  
└── xgb_model.json       ← XGBoost model
```

### 3. Start the Backend

```powershell
cd backend
python app.py
```

**Expected Output:**
```
🤖 Initializing ML models...
🔄 Loading ML models...
✅ UNet model loaded from ...
✅ EfficientNet model loaded from ...
✅ XGBoost model loaded from ...
🎉 Model loading complete!
✅ ML models ready for predictions
✅ MongoDB connection successful
 * Running on http://127.0.0.1:5000
```

### 4. Start the Frontend

Open a new terminal:

```powershell
cd frontend
npm run dev
```

### 5. Test the Integration

1. Open browser to `http://localhost:5173`
2. Login/Register
3. Go to Dashboard
4. Click "New Patient Scan"
5. Fill patient details
6. Upload an eye scan image
7. Watch the backend console for prediction logs
8. See real ML predictions in results!

## 📦 What's in requirements.txt

```
flask
flask-cors
python-dotenv
mongoengine
pymongo
pandas
joblib
PyJWT
werkzeug
flask-bcrypt
torch              ← PyTorch for neural networks
torchvision        ← Image processing
xgboost            ← XGBoost model
pillow             ← Image handling
numpy              ← Numerical operations
scikit-learn       ← ML utilities
```

## 🔍 Verify Installation

After installing, check if imports work:

```powershell
python -c "import torch; import xgboost; print('✅ All ML libraries installed!')"
```

## ⚡ Quick Command Summary

```powershell
# Install everything
cd backend
pip install -r requirements.txt

# Start backend
python app.py

# In another terminal - Start frontend  
cd frontend
npm run dev
```

## 🎯 Expected Behavior

### Before Installation:
- ❌ Import errors in model_loader.py
- ❌ Backend won't start

### After Installation:
- ✅ No import errors
- ✅ Backend starts successfully
- ✅ Models load on startup
- ✅ Eye scan predictions work
- ✅ Real ML results displayed

## 🐛 Common Issues

### Issue: "torch not found"
**Solution**: `pip install torch torchvision`

### Issue: "xgboost not found"  
**Solution**: `pip install xgboost`

### Issue: "ModuleNotFoundError: No module named 'PIL'"
**Solution**: `pip install pillow`

### Issue: Models fail to load
**Solution**: 
- Check model files are in `models/` folder
- Verify file paths in backend console output
- Check file permissions

### Issue: CUDA out of memory
**Solution**: Install CPU version of PyTorch:
```powershell
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

## 📚 Documentation

- **Full Integration Guide**: See `MODEL_INTEGRATION_GUIDE.md`
- **Completion Summary**: See `INTEGRATION_COMPLETE.md`
- **API Details**: Check `MODEL_INTEGRATION_GUIDE.md` section "API Endpoints"

## ✨ You're All Set!

Once dependencies are installed, your application will use real trained ML models for predictions! 🎉

**Active Models:**
- 🖼️ EfficientNet - Eye scan image classification
- 📊 XGBoost - Health data prediction (API ready)
- 🧬 UNet - Image segmentation (loaded, available)

Happy predicting! 🚀

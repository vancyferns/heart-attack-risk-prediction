---
title: Heart Attack Risk Prediction Backend
emoji: 🏥
colorFrom: purple
colorTo: indigo
sdk: docker
app_file: app.py
pinned: false
---

# Heart Attack Risk Prediction Backend

A Flask-based REST API for predicting heart attack risk using retinal eye scan images with EfficientNet and UNet deep learning models.

## Features

- **Eye Scan Analysis**: Upload retinal images for disease detection
- **Risk Prediction**: ML-powered risk assessment using state-of-the-art models
- **Patient Data Integration**: Combine demographic and medical history with image analysis
- **RESTful API**: Production-ready endpoints for integration
- **Authentication**: JWT-based authentication for secure access
- **File Management**: Cloudinary integration for image storage

## Models

- **EfficientNet B3**: Image classification for disease detection
- **UNet Advanced**: Medical image segmentation

## Running Locally

```bash
pip install -r requirements.txt
python app.py
```

The API runs on `http://localhost:5000`

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/scan/analyze` - Analyze retinal scan
- `POST /api/patient` - Save patient data
- `GET /api/patient/<id>` - Retrieve patient data

## Environment Variables

Required:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET_KEY` - JWT secret for authentication
- `CLOUDINARY_URL` - Cloudinary credentials

## Documentation

See [README.md](../README.md) in the project root for more details.

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

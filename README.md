# Heart Attack Risk Prediction (Eye Scan Pro)

This repository implements a prototype system that predicts heart-attack risk using retinal (eye) scans and optional clinical/tabular data. It includes:

- A React + Vite frontend dashboard for uploading eye scans and entering health data
- A Flask backend that loads ML models (UNet, EfficientNet, XGBoost) and exposes prediction APIs
- Pretrained model files under `backend/models/`
- Documentation, setup guides, and component-level notes

This README provides a concise developer guide, architecture overview, and instructions to run the system locally.

## Contents

- **Project**: user-facing dashboard + ML-backed API
- **Frontend**: `frontend/` (React + Vite)
- **Backend**: `backend/` (Flask, PyTorch, XGBoost)
- **Models**: `backend/models/` (UNet, EfficientNet, XGBoost artifacts)

## Quick demo (development)

1. Start the backend API (see Backend Setup)
2. Start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and use the dashboard to register/login and upload an eye scan.

## Architecture (summary)

- Frontend (React + Vite) provides the Dashboard, Navigation, PatientDetails, EyeScanUpload and Results components.
- Backend (Flask) exposes endpoints for authentication, record storage, and predictions:
	- `POST /api/auth/register` — register user
	- `POST /api/auth/login` — login and receive JWT
	- `POST /api/predict/image` — upload an eye image (multipart/form-data) for prediction
	- `POST /api/predict/tabular` — send health features for XGBoost prediction
	- `POST /api/predict/combined` — ensemble of image + tabular inputs
- Model orchestration lives in `backend/model_loader.py`. On startup `initialize_models()` loads UNet (segmentation), EfficientNet (image classifier) and the XGBoost model.

See the detailed architecture in `ARCHITECTURE.md`.

## Technology stack


## Backend setup

## Platforms & Services

- **Model hosting / artifacts:** Hugging Face Spaces (optional remote storage and downloads via `HF_SPACE_REPO_ID`) — used as a fallback for large model files when local checkpoints are absent.
- **State / persistent storage:** MongoDB Atlas (recommended) for user accounts and prediction records.
- **Image hosting (optional):** Cloudinary or similar services can be used for storing uploaded retinal images and serving them via CDN; current backend stores uploads locally under `backend/uploads` by default.
- **Frontend build & dev:** Vite + React (development served via `npm run dev`, production via `npm run build`).


1. Create a Python environment (recommended):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Create `backend/.env` with the following required variables:

```
MONGO_URI=<your-mongo-uri>
JWT_SECRET_KEY=<secret>
FRONTEND_BASE_URL=http://localhost:5173
```

3. Ensure model checkpoint files exist under `backend/models/`:

- `backend/models/unet/unet_best_advanced.pth`
- `backend/models/efficientnet/efficientnet_b3_best.pth`
- `backend/models/xgb_model.json` (if used)

The code will attempt to download missing model files from a configured Hugging Face Space if `HF_SPACE_REPO_ID` is set.

4. Run the API:

```bash
cd backend
python app.py
```

The backend runs on port `5000` by default.

## Frontend setup

1. Install dependencies and start dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Configure environment variables in `frontend/.env` (or via Vite):

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Eye Scan Pro
```

## API examples

- Login (get JWT):

```bash
curl -X POST http://localhost:5000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"you@example.com","password":"yourpass"}'
```

- Image prediction (multipart upload):

```bash
curl -X POST http://localhost:5000/api/predict/image \
	-H "Authorization: Bearer <JWT_TOKEN>" \
	-F "image=@/path/to/retina.jpg" \
	-F "patient_name=John Doe"
```

Response contains a JSON payload with `prediction` including `risk_score`, `risk_level`, and `confidence`.

## Key implementation notes

- `backend/model_loader.py` loads models at startup using `initialize_models()` and exposes `predict_from_image(image_bytes)`.
- UNet produces a vessel segmentation mask which is overlaid on the original image; the fused image is passed to EfficientNet for classification.
- Risk score is produced as a percentage and mapped to `Low/Medium/High` thresholds in `model_loader.py`.
- The backend stores predictions and metadata in MongoDB using `models.HealthRecord`.

## File locations of interest

- Backend app: `backend/app.py`
- Model orchestrator: `backend/model_loader.py`
- Database models: `backend/models.py`
- Frontend entry: `frontend/src/main.jsx` and `frontend/src/App.jsx`
- Frontend components: `frontend/src/components/` (Dashboard, EyeScanUpload, Results...)

## Development tips

- Use a local MongoDB URI or MongoDB Atlas with your IP whitelisted.
- If model files are large, keep them outside Git LFS or configure LFS correctly; `model_loader.py` can download missing files from a configured HF Space repo.
- For faster image predictions, run the backend on a GPU environment with CUDA-enabled PyTorch.

## Troubleshooting

- MongoDB connection errors: ensure `MONGO_URI` is set and network access is allowed.
- Model loading errors: verify model checkpoint files exist or set `HF_SPACE_REPO_ID` to allow downloads.
- CORS issues: frontend origin must be in the allowed list in `backend/app.py` or update `frontend_base_url`.

## Contributing

1. Open an issue describing the change
2. Create a feature branch
3. Make changes and include tests if applicable
4. Open a pull request against the `main` branch

## License

This project does not include an explicit license file. Add a license (e.g., MIT) if you intend to open-source it.

---

If you want, I can:

- commit this README update and open a PR on branch `deployment`
- create a smaller `README_BACKEND.md` and `README_FRONTEND.md` split
- run the backend locally and verify model loading (requires credentials/models)

Which of these should I do next?


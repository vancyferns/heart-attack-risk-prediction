# Retinal Vessel Segmentation — Paper Summary & Repo Mapping

Source: "Retinal Vessel Segmentation under Annotation Scarcity: A Progressive Framework with Pseudo-Labeling, Transfer Learning, and Patch-Based Refinement" — Vancy Fernandes1
, Daniel Pinto2
, Kajal Kallekar3
, Vedangi Shetkar4
, and Anthony
Rodrigues5
 1, 2,3,4,5 Department of Information Technology, Shree Rayeshwar Institute of Engineering and
Information Technology, Shiroda-Goa, India
vanferns2004@gmail.com, daniel031722@gmail.com,
kajalkallekar@gmail.com, vedangishetkar@gmail.com,
anthony.rodrigues@ritgoa.ac.in
Abstract. Retinal vessel segmentation is a key component in ophthalm

## Short summary
- Problem: Retinal vessel segmentation with very limited pixel-level annotations (e.g., RFMiD).
- Solution: Progressive pipeline combining (1) Frangi-based pseudo-label generation, (2) U-Net refinement of pseudo-labels, (3) Attention U-Net and Residual Attention U-Net (RA-UNet) transfer learning from annotated datasets (CHASE DB1), and (4) patch-based training and refinement on the target dataset. Final stage uses segmentation-guided features to improve classification (EfficientNet-B3).

## Key methods / components
- Frangi filter + CLAHE preprocessing → initial pseudo-masks (multi-scale, Otsu/stat thresholding).
- U-Net trained on Frangi pseudo-labels to denoise and improve continuity.
- Attention U-Net trained on multi-dataset annotated sources to generalize to RFMiD.
- RA-UNet (Residual Attention U-Net) trained on CHASE DB1, inference on RFMiD in patches, reconstruction by averaging overlaps.
- Patch-based sampling: 256×256 patches (stride=128 or 256), sample balancing (85% vessel patches / 15% background), filtering low-information patches, augmentations, Adam optimizer, BCE/Focal-Tversky hybrid loss.
- Segmentation-guided classification: overlay/fusion of vessel masks with fundus image; train EfficientNet-B3 classifier with TTA and optimized threshold.

## Quantitative highlights (from paper)
- U-Net refinement on Frangi pseudo-labels: best validation Dice ≈ 0.9186 (on pseudo-label target)
- Attention U-Net (multi-dataset): validation Dice ≈ 0.6698 (annotated datasets); binary accuracy ≈ 95.4%
- RA-UNet on CHASE DB1: best validation Dice ≈ 0.86
- Patch-based RFMiD training with RA-UNet pseudo-labels: test Dice ≈ 0.6596; pixel accuracy ≈ 97.45%
- EfficientNet-B3 classification (segmentation-guided): test accuracy up to 92.66%; optimal threshold ≈ 0.36

## Practical implications for this repo
This paper's pipeline maps well to the existing project structure and suggests concrete additions/enhancements we can implement to reproduce or adapt the approach:

- `backend/model_loader.py`
  - Current: loads UNet (segmentation) and EfficientNet classifier and fuses masks for classification.
  - Suggestion: add a RA-UNet variant or loading logic for RA-UNet checkpoints (optionally using segmentation_models_pytorch or a custom RA-UNet class). Make loading modular (named model registry).

- Data preprocessing utilities
  - Add `backend/data/preprocess.py`: CLAHE on green channel, resize/standardize, multi-scale Frangi calls (scikit-image), and patch extraction utilities (256×256 stride=128/256) with selection/filtering logic.

- Pseudo-label pipeline script
  - Add `backend/scripts/generate_pseudo_labels.py`:
    - Inputs: raw fundus images folder
    - Steps: preprocess (CLAHE), Frangi multi-scale → binary mask via Otsu/stat threshold → optional U-Net refinement (inference using a trained U-Net model) → save masks.

- Training scripts
  - `backend/training/train_unet.py` — train U-Net on pseudo-labels
  - `backend/training/train_attention_unet.py` — attention U-Net multi-dataset training
  - `backend/training/train_ra_unet_patch.py` — RA-UNet patch-based training on RFMiD with pseudo-label supervision and sampling strategy (85/15 vessel/background)

- Patch utilities
  - `backend/data/patches.py` — patch extraction, selection (mean-value filter), augmentation hooks (albumentations), and reconstruction helpers that average overlapping predictions.

- Evaluation & metrics
  - Add `backend/eval/metrics.py` for Dice, IoU, pixel accuracy, and patch-level reporting.

- Experiment configs
  - Add a `configs/` YAML directory describing hyperparameters used in the paper: learning rates, loss composition (BCE + Dice, Focal-Tversky with α=0.3, β=0.7, γ=1.5), batch sizes, augmentation ranges.

## Dependencies to add (if not already present)
- scikit-image (Frangi filter)
- albumentations (augmentation)
- segmentation_models_pytorch (SMP) or a custom RA-UNet implementation
- timm (if using more EfficientNet variants)

## Suggested minimal next tasks (can implement incrementally)
1. Add `DOCUMENTATION/PAPER_RETINAL_SEGMENTATION_SUMMARY.md` (this file) — done.
2. Add `backend/data/preprocess.py` + `backend/data/patches.py` utilities.
3. Implement `backend/scripts/generate_pseudo_labels.py` (Frangi + CLAHE + thresholding). Validate outputs visually on sample images.
4. Train/refine a U-Net with generated pseudo-labels (`train_unet.py`).
5. Add RA-UNet training script and integrate model load/save into `model_loader.py`.
6. Add evaluation scripts and CI checks (small test dataset) to verify metrics.

## Quick example commands (once scripts exist)

```bash
# generate pseudo-labels
python backend/scripts/generate_pseudo_labels.py --input data/raw --output data/pseudo_masks

# train RA-UNet with patch-based pipeline
python backend/training/train_ra_unet_patch.py --images data/raw --masks data/pseudo_masks --config configs/ra_unet_patch.yaml
```

## Mapping to current code files (where to integrate)
- `backend/model_loader.py` — extend to register/load RA-UNet and provide `segment_image_with_raunet()` and `predict_from_image()` fusion hooks.
- `backend/app.py` — add endpoints for: `/api/segment` (return mask), `/api/pseudo/generate` (admin use), and `/api/train` (admin trigger for training jobs — long-running, optional).
- `frontend/src/components/EyeScanUpload.jsx` and `Results.jsx` — add an option to request segmentation overlays, download masks, and show segmentation-guided classification results.

## Notes & caveats
- Pseudo-label quality is dataset and preprocessing dependent — visually inspect masks and tune Frangi + threshold parameters.
- Metric values from the paper are largely computed against pseudo-ground-truth in later stages — treat reported Dice scores as relative to their generated labels.
- Training RA-UNet and patch-based pipelines require substantial GPU resources and careful logging (TensorBoard/Weights & Biases recommended).

---

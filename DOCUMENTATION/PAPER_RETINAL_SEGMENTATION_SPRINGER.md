# Retinal Vessel Segmentation under Annotation Scarcity

Vancy Fernandes 1, Daniel Pinto 2, Kajal Kallekar 3, Vedangi Shetkar 4, Prof. Anthony. Rodrigues 5

1–5 Department of Information Technology, Shree Rayeshwar Institute of Engineering and Information Technology, Shiroda‑Goa, India
Emails: vanferns2004@gmail.com, daniel031722@gmail.com, kajalkallekar@gmail.com, vedangishetkar@gmail.com, anthony.rodrigues@ritgoa.ac.in

Abstract—Retinal vessel segmentation is a foundational task in ophthalmic image analysis and an important biomarker source for systemic diseases. Many large clinical datasets (for example RFMiD) lack pixel‑level vessel annotations, limiting supervised learning. We propose a progressive framework combining Frangi‑based pseudo‑label generation, U‑Net refinement, multi‑dataset Attention U‑Net training, cross‑dataset transfer learning via a Residual Attention U‑Net (RA‑UNet), and patch‑based refinement. The approach improves vessel continuity, structural consistency and enables segmentation‑guided classification using EfficientNet‑B3.

Keywords—Retinal vessel segmentation, pseudo‑labeling, transfer learning, Residual Attention U‑Net, patch‑based training, medical image segmentation.

1 Introduction

Retinal vessel segmentation enables extraction of vascular morphology for disease screening and monitoring. Annotation scarcity (missing pixel labels) is a common barrier. We address this by progressively generating and refining pseudo‑labels, transferring learned representations from annotated datasets, and applying patch‑based training to adapt to the target domain.

2 Methods

2.1 Pseudo‑label generation

Input images are preprocessed by extracting the green channel and applying CLAHE (Contrast Limited Adaptive Histogram Equalization) to improve vessel contrast. A multi‑scale Frangi vesselness filter detects tubular structures; responses are normalized and binarized using Otsu and statistical thresholding to create initial pseudo‑masks.

2.2 U‑Net refinement and Attention U‑Net

Frangi pseudo‑masks are noisy—thus we train a U‑Net on the generated masks to denoise and improve vessel continuity. An Attention U‑Net trained on multiple annotated datasets helps learn attention‑based skip connections that reduce false positives and focus on vessel structures.

2.3 Cross‑dataset transfer learning (RA‑UNet)

A Residual Attention U‑Net (RA‑UNet) is trained on an annotated dataset (e.g., CHASE DB1). RA‑UNet includes residual connections and attention gates to improve gradient flow and region focus. During inference on the target dataset (RFMiD), we perform patch‑wise inference (256×256 patches, stride 128 or 256) and reconstruct full‑size predictions by averaging overlapping patches.

2.4 Patch‑based refinement and sampling

Patch extraction filters low‑information patches (mean intensity threshold), limits patches per image, and balances sampling (≈85% vessel patches, 15% background). Data augmentation (rotation, flips, brightness scaling, Gaussian noise) improves generalization. Training uses Adam optimizer with hybrid loss functions (BCE + Dice; Focal‑Tversky with α=0.3, β=0.7, γ=1.5 for fine vessel recovery).

2.5 Segmentation‑guided classification

Segmentation masks are fused with fundus images (mask overlay) and passed to an EfficientNet‑B3 classifier. Test‑time augmentation (TTA) and an optimized decision threshold (≈0.36 reported) improve classification performance between healthy and at‑risk classes.

3 Experimental Results (summary)

- U‑Net trained on Frangi pseudo‑labels: best validation Dice ≈ 0.9186 (measured against pseudo targets).
- Attention U‑Net (multi‑dataset): validation Dice ≈ 0.6698; binary accuracy ≈ 95.4% on annotated validation splits.
- RA‑UNet on CHASE DB1: validation Dice ≈ 0.86 (best reported).
- Patch‑based RFMiD training using RA‑UNet pseudo‑labels: test Dice ≈ 0.6596; pixel accuracy ≈ 97.45%.
- EfficientNet‑B3 (segmentation‑guided) classification: test accuracy up to 92.66% (optimal threshold ≈ 0.36); macro/weighted F1 scores reported in paper.

4 Discussion

The pipeline demonstrates that progressive pseudo‑labeling combined with transfer learning and patch strategies can turn an unannotated dataset into a usable training set, improving vessel structure continuity even where classical methods struggle. Caution: many reported metrics reflect agreement with generated pseudo‑labels rather than independent expert ground truth.

5 Conclusion

Progressive pseudo‑labeling, RA‑UNet transfer, and patch‑based refinement provide a viable approach for retinal vessel segmentation under annotation scarcity. Segmentation outputs also benefit downstream classification tasks.

Acknowledgements—Dataset providers (RFMiD, CHASE DB1) and contributors.

Selected references

[1] A. D. Hoover, V. Kouznetsova, M. Goldbaum, "Locating blood vessels in retinal images by piecewise threshold probing of a matched filter response," IEEE Trans. Med. Imaging, 2000.
[2] J. Staal et al., "Ridge‑based vessel segmentation in color images of the retina," IEEE Trans. Med. Imaging, 2004.
[3] O. Ronneberger et al., "U‑Net: Convolutional networks for biomedical image segmentation."
[4] Z. Zhou et al., "UNet++: A nested U‑Net architecture for medical image segmentation," DLMIA, 2018.

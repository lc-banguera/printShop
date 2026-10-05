# Image Processing Audit

## Summary

- Images processed: 10
- Images passed: 10
- Images failed: 0
- Execution time: 1.26s

## Source Asset Classification

- Transparent: 10
- Solid color: 0
- Mixed: 0
- Unknown: 0

## Determinism

- Pass

## Visual Mass vs Geometric Bounding Box

| Image | BBox Area (px) | Opaque Pixels | Opaque Pixel % in BBox | BBox Occupancy % | Visual Occupancy % | Difference % |
|---|---|---|---|---|---|---|
| `Virtualthreads (1).png` | 46864 | 31434 | 67.1% | 45.5% | 30.5% | 15.0% |
| `Virtualthreads (2).png` | 46920 | 31459 | 67.0% | 46.3% | 31.0% | 15.3% |
| `Virtualthreads (6).png` | 57534 | 37190 | 64.6% | 45.2% | 29.3% | 16.0% |
| `Virtualthreads (10).png` | 44919 | 30437 | 67.8% | 49.8% | 33.7% | 16.1% |
| `Virtualthreads (18).png` | 166760 | 109626 | 65.7% | 44.9% | 29.5% | 15.4% |
| `Virtualthreads (30).png` | 74016 | 48874 | 66.0% | 46.6% | 30.7% | 15.9% |
| `Virtualthreads (45).png` | 50336 | 33689 | 66.9% | 44.9% | 30.1% | 14.8% |
| `Virtualthreads (54).png` | 35464 | 26353 | 74.3% | 30.1% | 22.3% | 7.8% |
| `Virtualthreads (11).png` | 45396 | 30179 | 66.5% | 43.3% | 28.8% | 14.5% |
| `Virtualthreads (12).png` | 47096 | 31606 | 67.1% | 45.8% | 30.7% | 15.0% |


## Findings

- None detected during automated checks. (To be expanded after manual output inspection)


## Rejected Hypotheses

- (None yet. To be populated after complete evidence/report review)

## Recommended Next Steps

1. Run the audit and inspect the generated debug, cropped, and normalized images in the `audit-out/images/` folder.
2. Examine the `visual_mass_*.png` files to visually compare the bounding box size with the highlighted opaque pixels.
3. Compare the visual occupancy percentages to verify if images with low opaque pixel percentage appear smaller.

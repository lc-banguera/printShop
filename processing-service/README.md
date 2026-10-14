# PrintShop Image Processing Service

The service is a local, offline-by-default FastAPI process for Designer 3 image operations. It listens on `127.0.0.1:8765` and never requires user images to leave the workstation.

## Windows setup

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
.\install-sesr-model.ps1
py main.py
```

If Windows does not have a system Python yet, PrintShop can use the bundled
Codex Python runtime for local validation. Application deployment should still
create its own `.venv` with Python 3.12/3.13 and pin the dependencies above;
do not depend on a developer machine's global packages.

The frontend treats an unavailable service as a real capability failure or uses the deterministic TypeScript worker fallback. It does not report an AI inference when the model is absent.

## Engines and licensing

| Operation | Engine | Version / license status |
| --- | --- | --- |
| Color vectorization | VTracer Python package | `0.6.11`, Apache-2.0 / MIT project licensing; SVG output contains paths, never an embedded raster |
| Precision resize | Pillow | `11.0.0`, HPND-style permissive license; deterministic Lanczos, bicubic or bilinear resampling |
| Adjust, inpainting, halftone | OpenCV + NumPy | OpenCV Apache-2.0; deterministic local processing |
| Background removal | ONNX Runtime + U2NetP | Runtime MIT; bundled model provenance and redistribution terms must remain verified before commercial redistribution |
| Neural super-resolution | AMD SESR INT8 through ONNX Runtime | `SESR_int8.onnx`, x2, Apache-2.0 model card; download is pinned by URL and SHA-256 in `install-sesr-model.ps1` |
| PDF export | ReportLab + svglib | Keep their notices and licenses with any distributed service package |

Real-ESRGAN remains retired and is never used as a fallback. Selecting `Mejora IA (Neuronal)` executes SESR only when its verified model artifact is installed; if it is absent, the endpoint fails explicitly. For a requested 4x result, SESR performs the first 2x and the declared precision resampler performs the remaining 2x.

Large model files belong outside normal source history when they are distributed separately. Do not download model weights automatically from an unknown URL at runtime.

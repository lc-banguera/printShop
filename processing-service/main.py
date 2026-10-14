"""
PrintShop Professional Image Processing Microservice
FastAPI Application serving Designer 3 Easy Mode operations.

Port: 8765
Host: 127.0.0.1
"""

import os
import base64
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services import (
    vectorize_image_vtracer,
    enhance_image,
    remove_background_u2net,
    inpaint_image,
    apply_adjustments,
    apply_halftone_screening,
    generate_pdf_document,
    to_base64,
    MODELS_DIR,
    TOOLS_DIR,
    SESR_MODEL_FILENAME,
)

app = FastAPI(
    title="PrintShop Image Processing Engine",
    description="Professional image processing for PrintShop Designer 3 Easy Mode",
    version="1.0.0",
)

# Enable CORS for local frontend ports (Vite 5173, Next 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health & Status
# ---------------------------------------------------------------------------

@app.get("/health")
def health_check():
    realesrgan_ready = os.path.exists(os.path.join(TOOLS_DIR, "realesrgan-ncnn-vulkan.exe"))
    u2netp_ready = os.path.exists(os.path.join(MODELS_DIR, "u2netp.onnx"))
    sesr_ready = os.path.exists(os.path.join(MODELS_DIR, SESR_MODEL_FILENAME))

    return {
        "status": "online",
        "service": "PrintShop Image Processing Microservice",
        "engines": {
            "vtracer": {
                "available": True,
                "version": "0.6.11",
                "license": "VisionCortex / MIT / Apache-2.0",
                "capabilities": ["color_spline", "polygon", "bezier_paths"],
            },
            "realesrgan": {
                "available": False,
                "installed": realesrgan_ready,
                "commercial_ready": False,
                "model": "realesrgan-x4plus",
                "license": "BSD-3-Clause (Code) / CC BY-NC-SA 4.0 (Model weights — Non-commercial)",
                "reason": "Disabled until commercial-compatible weights are verified.",
                "hardware": "Vulkan GPU / CPU",
            },
            "sesr": {
                "available": sesr_ready,
                "installed": sesr_ready,
                "commercial_ready": True,
                "model": "SESR_int8.onnx",
                "scale": 2,
                "license": "Apache-2.0 (AMD SESR weights) / MIT (ONNX Runtime)",
                "reason": None if sesr_ready else "Install the pinned model with install-sesr-model.ps1.",
                "hardware": "ONNX Runtime CPU / CUDA / DirectML when available",
            },
            "precision_resample": {
                "available": True,
                "methods": ["lanczos", "bicubic"],
                "unsharp_mask": True,
                "license": "Commercial-ready / Public Domain",
            },
            "u2net": {
                "available": u2netp_ready,
                "runtime": "ONNX Runtime",
                "license": "Apache-2.0 / MIT",
                "capabilities": ["salient_object_segmentation", "alpha_matting"],
            },
            "inpainting": {
                "available": True,
                "engine": "OpenCV",
                "algorithms": ["telea", "ns"],
                "license": "Apache-2.0",
            },
            "photo_adjustments": {
                "available": True,
                "engine": "OpenCV / NumPy",
                "parameters": ["brightness", "contrast", "saturation", "temperature", "hue", "sharpen"],
            },
            "halftone": {
                "available": True,
                "engine": "Mathematical Screen Raster",
                "modes": ["cmyk", "grayscale"],
            },
        },
    }


# ---------------------------------------------------------------------------
# Pydantic Schemas for Base64 / JSON Payloads
# ---------------------------------------------------------------------------

class Base64Payload(BaseModel):
    image: str # data URL or raw base64
    options: Optional[Dict[str, Any]] = None


class VectorizePayload(BaseModel):
    image: str
    colormode: Optional[str] = "color"
    mode: Optional[str] = "spline"
    filter_speckle: Optional[int] = 4
    color_precision: Optional[int] = 6
    corner_threshold: Optional[int] = 60
    length_threshold: Optional[float] = 4.0


class EnhancePayload(BaseModel):
    image: str
    mode: Optional[str] = "precision" # "precision" | "ai" (SESR)
    factor: Optional[float] = 2.0     # 2, 3, 4
    method: Optional[str] = "lanczos" # "lanczos" | "bicubic"


class RemoveBgPayload(BaseModel):
    image: str
    model: Optional[str] = "u2netp"
    feather: Optional[int] = 1


class InpaintPayload(BaseModel):
    image: str
    mask: str
    radius: Optional[int] = 5
    method: Optional[str] = "telea"


class AdjustPayload(BaseModel):
    image: str
    brightness: Optional[float] = 0.0
    contrast: Optional[float] = 0.0
    saturation: Optional[float] = 0.0
    temperature: Optional[float] = 0.0
    hue: Optional[float] = 0.0
    sharpen: Optional[float] = 0.0


class HalftonePayload(BaseModel):
    image: str
    cell_size: Optional[int] = 8
    angle: Optional[float] = 45.0
    shape: Optional[str] = "circle"
    color_mode: Optional[str] = "cmyk"
    dpi: Optional[int] = 300
    intensity: Optional[float] = 100.0
    contrast: Optional[float] = 100.0
    invert: Optional[bool] = False


def extract_bytes_from_base64(data_uri: str) -> bytes:
    """Decodes data URI or raw base64 string to bytes."""
    if "," in data_uri:
        data_uri = data_uri.split(",", 1)[1]
    return base64.b64decode(data_uri)


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/process/vectorize")
def vectorize_endpoint(payload: VectorizePayload):
    """
    Vectorizes image using VTracer to authentic SVG paths.
    """
    try:
        raw_bytes = extract_bytes_from_base64(payload.image)
        result = vectorize_image_vtracer(
            raw_bytes,
            colormode=payload.colormode or "color",
            mode=payload.mode or "spline",
            filter_speckle=payload.filter_speckle or 4,
            color_precision=payload.color_precision or 6,
            corner_threshold=payload.corner_threshold or 60,
            length_threshold=payload.length_threshold or 4.0,
        )
        return {
            "ok": True,
            "svg": result["svg"],
            "width": result["width"],
            "height": result["height"],
            "format": result["format"],
            "engine": result["engine"],
            "license": result["license"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {str(exc)}")


@app.post("/api/process/enhance")
def enhance_endpoint(payload: EnhancePayload):
    """
    Enhances / Upscales image using precision resampling or real SESR inference.
    """
    try:
        raw_bytes = extract_bytes_from_base64(payload.image)
        result = enhance_image(
            raw_bytes,
            mode=payload.mode or "precision",
            factor=float(payload.factor or 2.0),
            method=payload.method or "lanczos",
        )
        return {
            "ok": True,
            "image": to_base64(result["image_bytes"], mime="image/png"),
            "width": result["width"],
            "height": result["height"],
            "original_width": result["original_width"],
            "original_height": result["original_height"],
            "factor": result["factor"],
            "mode": result["mode"],
            "engine": result["engine"],
            "license": result["license"],
            "inference": result["inference"],
            "neural_scale": result["neural_scale"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image enhancement failed: {str(exc)}")


@app.post("/api/process/remove-bg")
def remove_bg_endpoint(payload: RemoveBgPayload):
    """
    Removes background using U2Net salient segmentation via ONNX Runtime.
    """
    try:
        raw_bytes = extract_bytes_from_base64(payload.image)
        result = remove_background_u2net(
            raw_bytes,
            model_name=payload.model or "u2netp",
            feather_radius=payload.feather or 1,
        )
        return {
            "ok": True,
            "image": to_base64(result["image_bytes"], mime="image/png"),
            "mask": to_base64(result["mask_bytes"], mime="image/png"),
            "width": result["width"],
            "height": result["height"],
            "engine": result["engine"],
            "license": result["license"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(exc)}")


@app.post("/api/process/inpaint")
def inpaint_endpoint(payload: InpaintPayload):
    """
    Removes objects or regions using contextual inpainting (OpenCV Telea / NS).
    """
    try:
        image_bytes = extract_bytes_from_base64(payload.image)
        mask_bytes = extract_bytes_from_base64(payload.mask)
        result = inpaint_image(
            image_bytes,
            mask_bytes,
            inpaint_radius=payload.radius or 5,
            method=payload.method or "telea",
        )
        return {
            "ok": True,
            "image": to_base64(result["image_bytes"], mime="image/png"),
            "width": result["width"],
            "height": result["height"],
            "engine": result["engine"],
            "license": result["license"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inpainting failed: {str(exc)}")


@app.post("/api/process/adjust")
def adjust_endpoint(payload: AdjustPayload):
    """
    Applies photographic pixel adjustments.
    """
    try:
        image_bytes = extract_bytes_from_base64(payload.image)
        result = apply_adjustments(
            image_bytes,
            brightness=payload.brightness or 0.0,
            contrast=payload.contrast or 0.0,
            saturation=payload.saturation or 0.0,
            temperature=payload.temperature or 0.0,
            hue=payload.hue or 0.0,
            sharpen=payload.sharpen or 0.0,
        )
        return {
            "ok": True,
            "image": to_base64(result["image_bytes"], mime="image/png"),
            "width": result["width"],
            "height": result["height"],
            "engine": result["engine"],
            "license": result["license"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Adjustment failed: {str(exc)}")


@app.post("/api/process/halftone")
def halftone_endpoint(payload: HalftonePayload):
    """
    Applies physical halftone screening.
    """
    try:
        image_bytes = extract_bytes_from_base64(payload.image)
        result = apply_halftone_screening(
            image_bytes,
            cell_size=payload.cell_size or 8,
            angle=payload.angle if payload.angle is not None else 45.0,
            shape=payload.shape or "circle",
            color_mode=payload.color_mode or "cmyk",
            dpi=payload.dpi or 300,
            intensity=payload.intensity if payload.intensity is not None else 100.0,
            contrast=payload.contrast if payload.contrast is not None else 100.0,
            invert=bool(payload.invert),
        )
        return {
            "ok": True,
            "image": to_base64(result["image_bytes"], mime="image/png"),
            "width": result["width"],
            "height": result["height"],
            "engine": result["engine"],
            "license": result["license"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Halftone processing failed: {str(exc)}")


class PdfElement(BaseModel):
    type: str  # 'image' | 'svg'
    x_cm: Optional[float] = 0.0
    y_cm: Optional[float] = 0.0
    width_cm: Optional[float] = 10.0
    height_cm: Optional[float] = 10.0
    image: Optional[str] = None  # base64 data uri
    svg_string: Optional[str] = None


class ExportPdfPayload(BaseModel):
    width_cm: float
    height_cm: float
    dpi: Optional[int] = 300
    background_color: Optional[str] = "#ffffff"
    elements: Optional[List[PdfElement]] = None


@app.post("/api/process/export-pdf")
def export_pdf_endpoint(payload: ExportPdfPayload):
    """
    Generates a print-ready PDF preserving authentic vector geometries (SVG)
    and high-DPI raster layers with transparency.
    """
    try:
        elements_data = []
        for el in (payload.elements or []):
            item = {
                "type": el.type,
                "x_cm": el.x_cm or 0.0,
                "y_cm": el.y_cm or 0.0,
                "width_cm": el.width_cm,
                "height_cm": el.height_cm,
            }
            if el.type == "svg" and el.svg_string:
                item["svg_string"] = el.svg_string
            elif el.image:
                item["image_bytes"] = extract_bytes_from_base64(el.image)
            elements_data.append(item)

        pdf_bytes = generate_pdf_document(
            width_cm=payload.width_cm,
            height_cm=payload.height_cm,
            dpi=payload.dpi or 300,
            background_color=payload.background_color,
            elements=elements_data,
        )
        return {
            "ok": True,
            "pdf": to_base64(pdf_bytes, mime="application/pdf"),
            "size_bytes": len(pdf_bytes),
            "format": "application/pdf",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(exc)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8765, reload=False)

"""
PrintShop Image Processing Engines
Specialized algorithms and neural models for Designer 3 Easy Mode.

Engines:
1. Lanczos / Bicubic / Bilinear (Deterministic Precision Resampling)
2. VTracer (Vectorization to genuine SVG paths)
3. U2Net / ONNX (Neural Background Removal)
4. OpenCV Inpainting (Magic Eraser / Contextual Inpainting)
5. Photographic Adjustments (OpenCV/NumPy deterministic pixel math)
6. Halftone (Mathematical screening at physical print scale)
"""

import os
import io
import math
import subprocess
import tempfile
import base64
from typing import Optional, Tuple, Dict, Any, Union

import numpy as np
import cv2
from PIL import Image, ImageFilter
import onnxruntime as ort
import vtracer


SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SERVICE_DIR, "models")
TOOLS_DIR = os.path.join(SERVICE_DIR, "tools")
TEMP_DIR = os.path.join(SERVICE_DIR, "temp")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(TOOLS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Model Cache & Initialization
# ---------------------------------------------------------------------------

_u2net_session: Optional[ort.InferenceSession] = None
_u2net_model_name: Optional[str] = None
_sesr_session: Optional[ort.InferenceSession] = None

SESR_MODEL_FILENAME = "SESR_int8.onnx"
SESR_MODEL_LICENSE = "Apache-2.0 (AMD SESR weights) / MIT (ONNX Runtime)"


def get_u2net_session(model_name: str = "u2netp") -> ort.InferenceSession:
    global _u2net_session, _u2net_model_name
    if _u2net_session is not None and _u2net_model_name == model_name:
        return _u2net_session

    model_filename = f"{model_name}.onnx"
    model_path = os.path.join(MODELS_DIR, model_filename)

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Verified U2Net model is not installed: {model_path}. "
            "Install the approved model artifact before enabling background removal."
        )

    # Use available execution providers (CPU/DirectML/CUDA)
    providers = ort.get_available_providers()
    chosen_providers = [p for p in providers if p in ("CUDAExecutionProvider", "DmlExecutionProvider", "CPUExecutionProvider")]
    if not chosen_providers:
        chosen_providers = ["CPUExecutionProvider"]

    session = ort.InferenceSession(model_path, providers=chosen_providers)
    _u2net_session = session
    _u2net_model_name = model_name
    return session


def get_sesr_session() -> ort.InferenceSession:
    """Load the pinned, commercially usable SESR ONNX artifact once."""
    global _sesr_session
    if _sesr_session is not None:
        return _sesr_session

    model_path = os.path.join(MODELS_DIR, SESR_MODEL_FILENAME)
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"SESR model is not installed: {model_path}. "
            "Run install-sesr-model.ps1 and verify its SHA-256 before enabling AI enhancement."
        )

    providers = ort.get_available_providers()
    chosen_providers = [
        p for p in providers
        if p in ("CUDAExecutionProvider", "DmlExecutionProvider", "CPUExecutionProvider")
    ] or ["CPUExecutionProvider"]
    _sesr_session = ort.InferenceSession(model_path, providers=chosen_providers)
    return _sesr_session


# ---------------------------------------------------------------------------
# Utility Helpers
# ---------------------------------------------------------------------------

def decode_image_bytes(data: bytes) -> np.ndarray:
    """Decodes raw image bytes to BGR or BGRA numpy array."""
    nparr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError("Could not decode image from provided data.")
    return img


def encode_image_bytes(img: np.ndarray, format: str = "png") -> bytes:
    """Encodes numpy array to PNG/JPEG bytes."""
    ext = f".{format.lower().lstrip('.')}"
    success, buffer = cv2.imencode(ext, img)
    if not success:
        raise RuntimeError(f"Could not encode image to {format}.")
    return buffer.tobytes()


def to_base64(data: bytes, mime: str = "image/png") -> str:
    """Encodes bytes as data URL."""
    b64 = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{b64}"


# ---------------------------------------------------------------------------
# 1. VECTORIZE (VTracer)
# ---------------------------------------------------------------------------

def vectorize_image_vtracer(
    image_bytes: bytes,
    colormode: str = "color",
    hierarchical: str = "stacked",
    mode: str = "spline",
    filter_speckle: int = 4,
    color_precision: int = 6,
    layer_difference: int = 16,
    corner_threshold: int = 60,
    length_threshold: float = 4.0,
    max_iterations: int = 10,
    splice_threshold: int = 45,
    path_precision: int = 2,
) -> Dict[str, Any]:
    """
    Vectorizes image using VTracer to authentic SVG paths with cubic bezier curves.
    Guarantees no embedded raster image inside output SVG.
    """
    img = decode_image_bytes(image_bytes)
    h, w = img.shape[:2]

    # Convert to PNG buffer for vtracer
    png_bytes = encode_image_bytes(img, format="png")

    svg_str = vtracer.convert_raw_image_to_svg(
        png_bytes,
        img_format="png",
        colormode=colormode,
        hierarchical=hierarchical,
        mode=mode,
        filter_speckle=filter_speckle,
        color_precision=color_precision,
        layer_difference=layer_difference,
        corner_threshold=corner_threshold,
        length_threshold=length_threshold,
        max_iterations=max_iterations,
        splice_threshold=splice_threshold,
        path_precision=path_precision,
    )

    if "<path" not in svg_str and "<polygon" not in svg_str:
        raise RuntimeError("VTracer failed to generate vector paths.")

    return {
        "svg": svg_str,
        "width": w,
        "height": h,
        "format": "image/svg+xml",
        "engine": "vtracer-0.6.11",
        "license": "Apache-2.0 / VisionCortex",
    }


# ---------------------------------------------------------------------------
# 2. ESCALAR / MEJORAR (SESR & Precision Resample)
# ---------------------------------------------------------------------------

def precision_resample(
    img: np.ndarray,
    factor: float,
    method: str = "lanczos",
    unsharp_strength: float = 0.5,
) -> np.ndarray:
    """
    Deterministic mathematical resampling.
    Uses high-order Lanczos-4 or Bicubic interpolation with unsharp masking.
    Preserves exact original image characteristics without neural hallucination.
    """
    h, w = img.shape[:2]
    new_w = max(1, int(round(w * factor)))
    new_h = max(1, int(round(h * factor)))

    has_alpha = img.shape[2] == 4 if len(img.shape) == 3 else False
    pil_mode = "RGBA" if has_alpha else "RGB"

    if has_alpha:
        rgb_part = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(np.dstack([rgb_part, img[:, :, 3]]))
    elif len(img.shape) == 3:
        pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    else:
        pil_img = Image.fromarray(img)

    resample_filter = {
        "bilinear": Image.Resampling.BILINEAR,
        "bicubic": Image.Resampling.BICUBIC,
        "lanczos": Image.Resampling.LANCZOS,
    }.get(method.lower(), Image.Resampling.LANCZOS)
    resized_pil = pil_img.resize((new_w, new_h), resample=resample_filter)

    # Optional gentle unsharp mask for sharpness recovery
    if unsharp_strength > 0:
        resized_pil = resized_pil.filter(
            ImageFilter.UnsharpMask(radius=1.5, percent=int(unsharp_strength * 100), threshold=3)
        )

    res_arr = np.array(resized_pil)
    if has_alpha:
        return cv2.cvtColor(res_arr, cv2.COLOR_RGBA2BGRA)
    elif len(img.shape) == 3:
        return cv2.cvtColor(res_arr, cv2.COLOR_RGB2BGR)
    return res_arr


def upscale_ai_realesrgan(*_args: Any, **_kwargs: Any) -> Tuple[np.ndarray, str]:
    """Keep the retired non-commercial engine impossible to call accidentally."""
    raise RuntimeError(
        "Real-ESRGAN está retirado de PrintShop: sus pesos anteriores no tienen licencia comercial aceptada."
    )


def _sesr_input_layout(session: ort.InferenceSession) -> str:
    shape = session.get_inputs()[0].shape
    if len(shape) != 4:
        raise RuntimeError(f"Unsupported SESR input rank: {shape}")
    if shape[-1] == 3:
        return "NHWC"
    if shape[1] == 3:
        return "NCHW"
    raise RuntimeError(f"Unable to determine SESR input layout: {shape}")


def _sesr_output_to_hwc(output: np.ndarray) -> np.ndarray:
    if output.ndim != 4:
        raise RuntimeError(f"Unsupported SESR output rank: {output.shape}")
    if output.shape[-1] == 3:
        return output
    if output.shape[1] == 3:
        return np.transpose(output, (0, 2, 3, 1))
    raise RuntimeError(f"Unable to determine SESR output layout: {output.shape}")


def upscale_ai_sesr(img: np.ndarray, tile_size: int = 256, overlap: int = 16) -> Tuple[np.ndarray, int]:
    """Run real SESR x2 inference with overlap tiling and alpha preservation."""
    session = get_sesr_session()
    input_meta = session.get_inputs()[0]
    input_shape = input_meta.shape
    input_layout = _sesr_input_layout(session)
    input_type = input_meta.type
    h, w = img.shape[:2]
    has_alpha = len(img.shape) == 3 and img.shape[2] == 4
    bgr = img[:, :, :3] if has_alpha else (img if len(img.shape) == 3 else cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))

    static_h = input_shape[1] if input_layout == "NHWC" else input_shape[2]
    static_w = input_shape[2] if input_layout == "NHWC" else input_shape[3]
    tile_h = int(static_h) if isinstance(static_h, int) else tile_size
    tile_w = int(static_w) if isinstance(static_w, int) else tile_size
    tile_h = max(32, tile_h)
    tile_w = max(32, tile_w)
    overlap = max(0, min(overlap, tile_h // 4, tile_w // 4))

    output_accum: Optional[np.ndarray] = None
    weight_accum: Optional[np.ndarray] = None
    scale: Optional[int] = None

    tile_specs = []
    for y in range(0, h, tile_h - overlap * 2 or tile_h):
        for x in range(0, w, tile_w - overlap * 2 or tile_w):
            source_y0 = max(0, y - overlap)
            source_x0 = max(0, x - overlap)
            source_y1 = min(h, y + tile_h - overlap)
            source_x1 = min(w, x + tile_w - overlap)
            tile = bgr[source_y0:source_y1, source_x0:source_x1]
            pad_h = tile_h - tile.shape[0] if isinstance(static_h, int) else 0
            pad_w = tile_w - tile.shape[1] if isinstance(static_w, int) else 0
            if pad_h > 0 or pad_w > 0:
                tile = np.pad(tile, ((0, pad_h), (0, pad_w), (0, 0)), mode="edge")
            tensor = tile.astype(np.float32 if input_type == "tensor(float)" else np.uint8)
            tensor = tensor[None, ...] if input_layout == "NHWC" else np.transpose(tensor, (2, 0, 1))[None, ...]
            tile_specs.append((
                tensor[0],
                source_x0,
                source_y0,
                x,
                y,
                min(tile_w - overlap, w - x),
                min(tile_h - overlap, h - y),
            ))

    batch_size = 64
    for batch_start in range(0, len(tile_specs), batch_size):
        batch_specs = tile_specs[batch_start:batch_start + batch_size]
        batch_tensor = np.stack([item[0] for item in batch_specs], axis=0)
        if input_layout == "NCHW":
            batch_tensor = np.transpose(batch_tensor, (0, 3, 1, 2))
        batch_output = _sesr_output_to_hwc(session.run(None, {input_meta.name: batch_tensor})[0])
        for item, output in zip(batch_specs, batch_output):
            _, source_x0, source_y0, x, y, visible_w, visible_h = item
            tile_scale_y = output.shape[0] // tile_h
            tile_scale_x = output.shape[1] // tile_w
            if tile_scale_y != tile_scale_x or tile_scale_y < 2:
                raise RuntimeError(f"Unexpected SESR scale: input={tile_h}x{tile_w} output={output.shape}")
            if scale is None:
                scale = tile_scale_y
                output_accum = np.zeros((h * scale, w * scale, 3), dtype=np.float32)
                weight_accum = np.zeros((h * scale, w * scale, 1), dtype=np.float32)
            elif scale != tile_scale_y:
                raise RuntimeError("SESR returned inconsistent tile scales")

            crop_x0 = (x - source_x0) * scale
            crop_y0 = (y - source_y0) * scale
            crop_x1 = crop_x0 + visible_w * scale
            crop_y1 = crop_y0 + visible_h * scale
            destination_x0 = x * scale
            destination_y0 = y * scale
            output_crop = output[crop_y0:crop_y1, crop_x0:crop_x1]
            output_accum[destination_y0:destination_y0 + output_crop.shape[0], destination_x0:destination_x0 + output_crop.shape[1]] += output_crop
            weight_accum[destination_y0:destination_y0 + output_crop.shape[0], destination_x0:destination_x0 + output_crop.shape[1]] += 1.0

    if output_accum is None or weight_accum is None or scale is None:
        raise RuntimeError("SESR did not produce an output")
    rgb = np.clip(output_accum / np.maximum(weight_accum, 1.0), 0, 255).astype(np.uint8)
    if not has_alpha:
        return rgb, scale

    alpha = Image.fromarray(img[:, :, 3], mode="L").resize((w * scale, h * scale), Image.Resampling.LANCZOS)
    return np.dstack([rgb, np.asarray(alpha, dtype=np.uint8)]), scale


def enhance_image(
    image_bytes: bytes,
    mode: str = "precision",
    factor: float = 2.0,
    method: str = "lanczos",
) -> Dict[str, Any]:
    """
    Enhances / Upscales an image.
    Distinguishes clearly between precision resampling and real SESR neural
    super-resolution. No neural path falls back silently to Lanczos.
    """
    orig_img = decode_image_bytes(image_bytes)
    orig_h, orig_w = orig_img.shape[:2]

    if mode == "ai":
        neural_img, neural_scale = upscale_ai_sesr(orig_img)
        if abs(float(factor) - neural_scale) < 0.001:
            out_img = neural_img
            engine_name = f"SESR INT8 x{neural_scale} (ONNX Runtime)"
        else:
            out_img = precision_resample(
                neural_img,
                factor=float(factor) / neural_scale,
                method=method,
                unsharp_strength=0.35,
            )
            engine_name = (
                f"SESR INT8 x{neural_scale} + Precision Resample "
                f"to x{factor:g} ({method.capitalize()})"
            )
        license_info = SESR_MODEL_LICENSE
    else:
        out_img = precision_resample(orig_img, factor=factor, method=method, unsharp_strength=0.5)
        engine_name = f"Precision Resample ({method.capitalize()} + Unsharp Mask)"
        license_info = "Public Domain / Deterministic"

    new_h, new_w = out_img.shape[:2]
    out_bytes = encode_image_bytes(out_img, format="png")

    return {
        "image_bytes": out_bytes,
        "width": new_w,
        "height": new_h,
        "original_width": orig_w,
        "original_height": orig_h,
        "factor": factor,
        "mode": mode,
        "engine": engine_name,
        "license": license_info,
        "inference": mode == "ai",
        "neural_scale": neural_scale if mode == "ai" else None,
    }


# ---------------------------------------------------------------------------
# 3. ELIMINAR FONDO (U2Net / rembg via ONNX Runtime)
# ---------------------------------------------------------------------------

def remove_background_u2net(
    image_bytes: bytes,
    model_name: str = "u2netp",
    feather_radius: int = 1,
) -> Dict[str, Any]:
    """
    Removes background using U2Net salient object detection model via ONNX Runtime.
    Produces authentic alpha channel transparency.
    """
    orig_img = decode_image_bytes(image_bytes)
    h, w = orig_img.shape[:2]

    session = get_u2net_session(model_name)
    input_name = session.get_inputs()[0].name

    # Preprocessing: resize to 320x320 and normalize
    resized = cv2.resize(orig_img[:, :, :3] if len(orig_img.shape) == 3 else orig_img, (320, 320))
    if len(resized.shape) == 3:
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    else:
        rgb = cv2.cvtColor(resized, cv2.COLOR_GRAY2RGB).astype(np.float32) / 255.0

    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    normalized = (rgb - mean) / std
    tensor = np.transpose(normalized, (2, 0, 1))[np.newaxis, ...].astype(np.float32)

    # ONNX Inference
    outputs = session.run(None, {input_name: tensor})
    raw_mask = outputs[0][0, 0]

    # Sigmoid and normalization
    mask = 1.0 / (1.0 + np.exp(-raw_mask))
    mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)

    # Scale mask back to original resolution
    mask_full = cv2.resize(mask, (w, h), interpolation=cv2.INTER_LINEAR)
    alpha = (mask_full * 255.0).clip(0, 255).astype(np.uint8)

    # Feather edges if requested
    if feather_radius > 0:
        alpha = cv2.GaussianBlur(alpha, (feather_radius * 2 + 1, feather_radius * 2 + 1), 0)

    # Compose RGBA
    bgr = orig_img[:, :, :3] if len(orig_img.shape) == 3 else cv2.cvtColor(orig_img, cv2.COLOR_GRAY2BGR)
    rgba = cv2.cvtColor(bgr, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = alpha

    out_bytes = encode_image_bytes(rgba, format="png")
    mask_bytes = encode_image_bytes(alpha, format="png")

    return {
        "image_bytes": out_bytes,
        "mask_bytes": mask_bytes,
        "width": w,
        "height": h,
        "engine": f"U2Net ONNX ({model_name})",
        "license": "Apache-2.0 / MIT",
    }


# ---------------------------------------------------------------------------
# 4. ELIMINADOR MÁGICO / INPAINTING (OpenCV)
# ---------------------------------------------------------------------------

def inpaint_image(
    image_bytes: bytes,
    mask_bytes: bytes,
    inpaint_radius: int = 5,
    method: str = "telea",
) -> Dict[str, Any]:
    """
    Performs contextual inpainting using Navier-Stokes or Telea algorithms.
    Reconstructs missing or erased regions seamlessly from surrounding image textures.
    """
    img = decode_image_bytes(image_bytes)
    mask = decode_image_bytes(mask_bytes)
    h, w = img.shape[:2]

    # Ensure mask is single channel uint8
    if len(mask.shape) == 3:
        if mask.shape[2] == 4:
            # If mask has alpha, use alpha channel
            mask_gray = mask[:, :, 3]
        else:
            mask_gray = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
    else:
        mask_gray = mask

    # Resize mask if dimensions mismatch
    if mask_gray.shape[:2] != (h, w):
        mask_gray = cv2.resize(mask_gray, (w, h), interpolation=cv2.INTER_NEAREST)

    # Threshold mask
    _, mask_bin = cv2.threshold(mask_gray, 10, 255, cv2.THRESH_BINARY)

    # Slight dilation to cover edge bleeding
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask_dilated = cv2.dilate(mask_bin, kernel, iterations=1)

    has_alpha = len(img.shape) == 3 and img.shape[2] == 4
    bgr = img[:, :, :3] if has_alpha else (cv2.cvtColor(img, cv2.COLOR_GRAY2BGR) if len(img.shape) == 2 else img)

    flag = cv2.INPAINT_TELEA if method.lower() == "telea" else cv2.INPAINT_NS
    inpainted = cv2.inpaint(bgr, mask_dilated, inpaintRadius=max(1, inpaint_radius), flags=flag)

    if has_alpha:
        # Preserve original alpha where not erased
        out_rgba = cv2.cvtColor(inpainted, cv2.COLOR_BGR2BGRA)
        out_rgba[:, :, 3] = img[:, :, 3]
        result_img = out_rgba
    else:
        result_img = inpainted

    out_bytes = encode_image_bytes(result_img, format="png")
    return {
        "image_bytes": out_bytes,
        "width": w,
        "height": h,
        "engine": f"OpenCV inpaint ({method.upper()})",
        "license": "Apache-2.0",
    }


# ---------------------------------------------------------------------------
# 5. AJUSTES FOTOGRÁFICOS
# ---------------------------------------------------------------------------

def apply_adjustments(
    image_bytes: bytes,
    brightness: float = 0.0,   # -100 to 100
    contrast: float = 0.0,     # -100 to 100
    saturation: float = 0.0,   # -100 to 100
    temperature: float = 0.0,  # -100 to 100
    hue: float = 0.0,          # -180 to 180
    sharpen: float = 0.0,      # 0 to 100
) -> Dict[str, Any]:
    """
    Applies photographic pixel adjustments deterministically using OpenCV & NumPy:
    - Brightness: linear offset in float space
    - Contrast: midpoint centered scaling
    - Saturation: HSV S-channel multiplier
    - Temperature: White point / Kelvin temperature matrix (warm = +R/+G, cool = +B)
    - Hue: HSV H-channel rotation with wrap-around
    - Sharpen: Unsharp mask high-pass convolution
    """
    img = decode_image_bytes(image_bytes)
    h, w = img.shape[:2]
    has_alpha = len(img.shape) == 3 and img.shape[2] == 4
    alpha = img[:, :, 3] if has_alpha else None

    bgr = img[:, :, :3] if has_alpha else (cv2.cvtColor(img, cv2.COLOR_GRAY2BGR) if len(img.shape) == 2 else img)
    float_bgr = bgr.astype(np.float32)

    # 1. Brightness (-100 to 100) -> scale to [-255, 255]
    if brightness != 0.0:
        offset = (brightness / 100.0) * 255.0
        float_bgr += offset

    # 2. Contrast (-100 to 100)
    if contrast != 0.0:
        # factor: 0 -> 1.0, 100 -> 3.0, -100 -> 0.1
        factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast)) if contrast < 255 else 1.0
        float_bgr = (float_bgr - 128.0) * factor + 128.0

    float_bgr = np.clip(float_bgr, 0.0, 255.0)

    # 3. Temperature (-100 to 100)
    # Warm shifts toward yellow/red (boost R, slightly G, reduce B)
    # Cool shifts toward cyan/blue (boost B, reduce R)
    if temperature != 0.0:
        temp_val = temperature / 100.0
        if temp_val > 0: # Warmer
            float_bgr[:, :, 2] = np.clip(float_bgr[:, :, 2] * (1.0 + temp_val * 0.25), 0, 255) # R
            float_bgr[:, :, 1] = np.clip(float_bgr[:, :, 1] * (1.0 + temp_val * 0.10), 0, 255) # G
            float_bgr[:, :, 0] = np.clip(float_bgr[:, :, 0] * (1.0 - temp_val * 0.15), 0, 255) # B
        else: # Cooler
            cool_val = abs(temp_val)
            float_bgr[:, :, 0] = np.clip(float_bgr[:, :, 0] * (1.0 + cool_val * 0.25), 0, 255) # B
            float_bgr[:, :, 1] = np.clip(float_bgr[:, :, 1] * (1.0 + cool_val * 0.05), 0, 255) # G
            float_bgr[:, :, 2] = np.clip(float_bgr[:, :, 2] * (1.0 - cool_val * 0.20), 0, 255) # R

    uint8_bgr = float_bgr.astype(np.uint8)

    # 4. Saturation & Hue via HSV
    if saturation != 0.0 or hue != 0.0:
        hsv = cv2.cvtColor(uint8_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)

        # Hue rotation: in OpenCV H is [0, 179]
        if hue != 0.0:
            h_shift = (hue / 360.0) * 180.0
            hsv[:, :, 0] = np.mod(hsv[:, :, 0] + h_shift, 180.0)

        # Saturation scaling
        if saturation != 0.0:
            sat_factor = 1.0 + (saturation / 100.0)
            hsv[:, :, 1] = np.clip(hsv[:, :, 1] * sat_factor, 0, 255)

        uint8_bgr = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    # 5. Sharpen (0 to 100)
    if sharpen > 0.0:
        strength = sharpen / 100.0
        blurred = cv2.GaussianBlur(uint8_bgr, (0, 0), 2.0)
        unsharp = cv2.addWeighted(uint8_bgr, 1.0 + strength, blurred, -strength, 0)
        uint8_bgr = np.clip(unsharp, 0, 255).astype(np.uint8)

    if has_alpha:
        res = cv2.cvtColor(uint8_bgr, cv2.COLOR_BGR2BGRA)
        res[:, :, 3] = alpha
    else:
        res = uint8_bgr

    out_bytes = encode_image_bytes(res, format="png")
    return {
        "image_bytes": out_bytes,
        "width": w,
        "height": h,
        "engine": "OpenCV / NumPy Photo Pipeline",
        "license": "Apache-2.0",
    }


# ---------------------------------------------------------------------------
# 6. SEMITONOS (Halftone Dot Matrix)
# ---------------------------------------------------------------------------

def apply_halftone_screening(
    image_bytes: bytes,
    cell_size: int = 8,
    angle: float = 45.0,
    shape: str = "circle",
    color_mode: str = "cmyk",
    dpi: int = 300,
    intensity: float = 100.0,
    contrast: float = 100.0,
    invert: bool = False,
) -> Dict[str, Any]:
    """
    Applies genuine mathematical halftone screening respecting physical print scale.
    Simulates printing raster screens (AM halftone) with round or diamond dots.
    """
    img = decode_image_bytes(image_bytes)
    h, w = img.shape[:2]
    has_alpha = len(img.shape) == 3 and img.shape[2] == 4
    alpha = img[:, :, 3] if has_alpha else None

    # Rotate coordinates by screen angle
    rad = math.radians(angle)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)

    cell = max(2, cell_size)
    intensity_value = max(0.0, min(2.0, intensity / 100.0))
    contrast_value = max(0.0, min(2.0, contrast / 100.0))

    def adjust_coverage(value: np.ndarray) -> np.ndarray:
        adjusted = np.clip((value - 0.5) * contrast_value + 0.5, 0.0, 1.0)
        adjusted = np.clip(adjusted * intensity_value, 0.0, 1.0)
        return 1.0 - adjusted if invert else adjusted
    radius_max = cell * 0.7071

    # If grayscale mode
    if color_mode == "grayscale" or len(img.shape) == 2 or img.shape[2] == 1:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        output = np.full((h, w), 255, dtype=np.uint8)

        # Screen grid evaluation
        y_coords, x_coords = np.mgrid[0:h, 0:w]
        # Rotated coordinates
        u = x_coords * cos_a + y_coords * sin_a
        v = -x_coords * sin_a + y_coords * cos_a

        # Grid cell center offsets
        u_mod = np.mod(u, cell) - cell / 2.0
        v_mod = np.mod(v, cell) - cell / 2.0

        if shape == "diamond":
            dist = np.abs(u_mod) + np.abs(v_mod)
        elif shape == "square":
            dist = np.maximum(np.abs(u_mod), np.abs(v_mod))
        else: # Circle
            dist = np.sqrt(u_mod**2 + v_mod**2)

        # Darkness: 0 (black) -> full dot, 255 (white) -> no dot
        darkness = adjust_coverage(1.0 - (gray.astype(np.float32) / 255.0))
        target_radius = darkness * radius_max

        dot_mask = dist <= target_radius
        output[dot_mask] = 0

        res = cv2.cvtColor(output, cv2.COLOR_GRAY2BGR)
    else:
        # CMYK color simulation: Cyan, Magenta, Yellow, blacK channels
        bgr = img[:, :, :3]
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

        # RGB to CMYK
        k = 1.0 - np.max(rgb, axis=2)
        c = (1.0 - rgb[:, :, 0] - k) / (1.0 - k + 1e-8)
        m = (1.0 - rgb[:, :, 1] - k) / (1.0 - k + 1e-8)
        y = (1.0 - rgb[:, :, 2] - k) / (1.0 - k + 1e-8)
        c = np.clip(c, 0, 1)
        m = np.clip(m, 0, 1)
        y = np.clip(y, 0, 1)
        k = np.clip(k, 0, 1)

        # Standard CMYK screen angles: C=15, M=75, Y=0, K=45 (or offset by base angle)
        angles = {
            "c": angle - 30.0,
            "m": angle + 30.0,
            "y": angle - 45.0,
            "k": angle,
        }

        y_coords, x_coords = np.mgrid[0:h, 0:w]
        c_screen = np.zeros((h, w), dtype=bool)
        m_screen = np.zeros((h, w), dtype=bool)
        y_screen = np.zeros((h, w), dtype=bool)
        k_screen = np.zeros((h, w), dtype=bool)

        for ch_name, ch_data, screen_arr in [
            ("c", c, c_screen),
            ("m", m, m_screen),
            ("y", y, y_screen),
            ("k", k, k_screen),
        ]:
            ang_rad = math.radians(angles[ch_name])
            c_a = math.cos(ang_rad)
            s_a = math.sin(ang_rad)
            u = x_coords * c_a + y_coords * s_a
            v = -x_coords * s_a + y_coords * c_a
            u_mod = np.mod(u, cell) - cell / 2.0
            v_mod = np.mod(v, cell) - cell / 2.0
            dist = np.sqrt(u_mod**2 + v_mod**2)
            rad_target = adjust_coverage(ch_data) * radius_max
            screen_arr |= (dist <= rad_target)

        # Synthesize CMYK screen back to RGB
        c_ink = np.where(c_screen, 1.0, 0.0)
        m_ink = np.where(m_screen, 1.0, 0.0)
        y_ink = np.where(y_screen, 1.0, 0.0)
        k_ink = np.where(k_screen, 1.0, 0.0)

        out_r = (1.0 - c_ink) * (1.0 - k_ink)
        out_g = (1.0 - m_ink) * (1.0 - k_ink)
        out_b = (1.0 - y_ink) * (1.0 - k_ink)

        out_rgb = np.dstack([out_r, out_g, out_b]) * 255.0
        res = cv2.cvtColor(np.clip(out_rgb, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)

    if has_alpha:
        out_rgba = cv2.cvtColor(res, cv2.COLOR_BGR2BGRA)
        out_rgba[:, :, 3] = alpha
        final_img = out_rgba
    else:
        final_img = res

    out_bytes = encode_image_bytes(final_img, format="png")
    return {
        "image_bytes": out_bytes,
        "width": w,
        "height": h,
        "engine": f"Physical Halftone Engine ({color_mode.upper()} / {shape.capitalize()})",
        "license": "Mathematical / PrintShop",
    }


# ---------------------------------------------------------------------------
# 7. EXPORTACIÓN PROFESIONAL PDF (ReportLab & SVGlib)
# ---------------------------------------------------------------------------

def generate_pdf_document(
    width_cm: float,
    height_cm: float,
    dpi: int = 300,
    background_color: Optional[str] = None,
    elements: Optional[list] = None,
) -> bytes:
    """
    Generates print-ready PDF document with exact physical dimensions in points/cm.
    Preserves real vector geometry for SVG elements (via svglib Drawing)
    and high-DPI raster images with transparency.
    """
    from reportlab.pdfgen import canvas
    from reportlab.graphics import renderPDF
    from svglib.svglib import svg2rlg
    from reportlab.lib.utils import ImageReader
    import io
    import tempfile

    # Convert cm to points (72 pt = 1 inch = 2.54 cm)
    cm_to_pt = 72.0 / 2.54
    pt_w = width_cm * cm_to_pt
    pt_h = height_cm * cm_to_pt

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(pt_w, pt_h))

    # Background
    if background_color and background_color != "transparent":
        if background_color.startswith("#") and len(background_color) >= 7:
            hex_c = background_color.lstrip("#")
            r = int(hex_c[0:2], 16) / 255.0
            g = int(hex_c[2:4], 16) / 255.0
            b = int(hex_c[4:6], 16) / 255.0
            c.setFillColorRGB(r, g, b)
            c.rect(0, 0, pt_w, pt_h, fill=1, stroke=0)

    for el in (elements or []):
        el_type = el.get("type", "image")
        x_pt = float(el.get("x_cm", 0.0)) * cm_to_pt
        w_pt = float(el.get("width_cm", width_cm)) * cm_to_pt
        h_pt = float(el.get("height_cm", height_cm)) * cm_to_pt
        # PDF coordinate origin is bottom-left
        y_pt = pt_h - (float(el.get("y_cm", 0.0)) * cm_to_pt) - h_pt

        if el_type == "svg" and "svg_string" in el:
            with tempfile.NamedTemporaryFile(suffix=".svg", mode="w", encoding="utf-8", delete=False) as f:
                f.write(el["svg_string"])
                tmp_svg = f.name
            try:
                drawing = svg2rlg(tmp_svg)
                if drawing:
                    scale_x = w_pt / drawing.width if drawing.width else 1.0
                    scale_y = h_pt / drawing.height if drawing.height else 1.0
                    drawing.scale(scale_x, scale_y)
                    renderPDF.draw(drawing, c, x_pt, y_pt)
            finally:
                if os.path.exists(tmp_svg):
                    try:
                        os.remove(tmp_svg)
                    except OSError:
                        pass

        elif el_type in ("image", "raster") and "image_bytes" in el:
            img_io = io.BytesIO(el["image_bytes"])
            c.drawImage(ImageReader(img_io), x_pt, y_pt, width=w_pt, height=h_pt, mask="auto")

    c.showPage()
    c.save()
    return buf.getvalue()

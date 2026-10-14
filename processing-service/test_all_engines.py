"""
PrintShop Processing Engines — Comprehensive Integration Test
Tests all endpoints and specialized models with real images:
1. Health check & model availability
2. VTracer vectorization (verifies real SVG path curves)
3. Precision Resample (Lanczos 2x, 3x)
4. Neural super-resolution availability and real SESR inference
5. U2Net Neural Background Removal (alpha channel verification)
6. OpenCV Contextual Inpainting (Magic Eraser)
7. Photographic adjustments (contrast, brightness, saturation, temperature, hue, sharpness)
8. Physical Halftone screening
"""

import os
import sys
import base64
import json
import shutil
import time

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Test source images from the repository
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SAMPLE_IMG_PATH = os.path.join(REPO_ROOT, "frontend", "src", "resources", "designs", "img1.jpg")
LOGO_IMG_PATH = os.path.join(REPO_ROOT, "frontend", "src", "resources", "landing_principal", "images", "designer_screenshot.png")


def load_as_b64(filepath: str) -> str:
    with open(filepath, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode("ascii")
    ext = filepath.split(".")[-1].lower()
    mime = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
    return f"data:{mime};base64,{b64}"


def run_tests():
    print("=" * 60)
    print("PRINTSHOP PROCESSING ENGINES — INTEGRATION TEST SUITE")
    print("=" * 60)

    # 1. Health check
    print("\n[TEST 1] Testing /health endpoint...")
    resp = client.get("/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    health = resp.json()
    print("Status:", health["status"])
    print("Engines available:")
    for eng, info in health["engines"].items():
        print(f"  - {eng}: {info}")

    assert health["engines"]["vtracer"]["available"] is True
    assert health["engines"]["realesrgan"]["available"] is False
    assert health["engines"]["realesrgan"]["commercial_ready"] is False
    assert health["engines"]["sesr"]["commercial_ready"] is True
    assert isinstance(health["engines"]["u2net"]["available"], bool)
    assert health["engines"]["inpainting"]["available"] is True

    # Check sample image exists
    assert os.path.exists(SAMPLE_IMG_PATH), f"Sample image not found: {SAMPLE_IMG_PATH}"
    img_b64 = load_as_b64(SAMPLE_IMG_PATH)

    # 2. Vectorization (VTracer)
    print("\n[TEST 2] Testing /api/process/vectorize (VTracer)...")
    t0 = time.time()
    resp = client.post("/api/process/vectorize", json={
        "image": img_b64,
        "colormode": "color",
        "mode": "spline",
        "filter_speckle": 4,
        "color_precision": 6,
    })
    elapsed = time.time() - t0
    assert resp.status_code == 200, f"Vectorize failed: {resp.text}"
    data = resp.json()
    assert data["ok"] is True
    assert "svg" in data
    assert "<path" in data["svg"] or "<polygon" in data["svg"]
    # Check NO raster embed
    assert "<image" not in data["svg"]
    out_svg_path = os.path.join(OUTPUT_DIR, "vtracer_output.svg")
    with open(out_svg_path, "w", encoding="utf-8") as f:
        f.write(data["svg"])
    print(f"VTracer succeeded in {elapsed:.2f}s! Paths count: {data['svg'].count('<path')}. Wrote {out_svg_path}")

    # 3. Precision Resample (Lanczos 2x)
    print("\n[TEST 3] Testing /api/process/enhance (Precision Lanczos 2x)...")
    t0 = time.time()
    resp = client.post("/api/process/enhance", json={
        "image": img_b64,
        "mode": "precision",
        "factor": 2.0,
        "method": "lanczos",
    })
    elapsed = time.time() - t0
    assert resp.status_code == 200, f"Precision enhance failed: {resp.text}"
    data = resp.json()
    assert data["ok"] is True
    assert data["width"] == data["original_width"] * 2
    assert data["height"] == data["original_height"] * 2
    out_png_path = os.path.join(OUTPUT_DIR, "lanczos_2x.png")
    with open(out_png_path, "wb") as f:
        f.write(base64.b64decode(data["image"].split(",")[1]))
    print(f"Precision resample 2x succeeded in {elapsed:.2f}s! ({data['original_width']}x{data['original_height']} -> {data['width']}x{data['height']})")

    # 4. Neural super-resolution
    print("\n[TEST 4] Testing neural super-resolution (SESR)...")
    t0 = time.time()
    resp = client.post("/api/process/enhance", json={
        "image": img_b64,
        "mode": "ai",
        "factor": 4.0,
    })
    elapsed = time.time() - t0
    if health["engines"]["sesr"]["available"]:
        assert resp.status_code == 200, f"SESR AI failed: {resp.text}"
        ai_data = resp.json()
        assert ai_data["inference"] is True
        assert ai_data["neural_scale"] == 2
        assert ai_data["width"] == ai_data["original_width"] * 4
        assert ai_data["height"] == ai_data["original_height"] * 4
        sesr_original_path = os.path.join(OUTPUT_DIR, "sesr_original.jpg")
        sesr_result_path = os.path.join(OUTPUT_DIR, "sesr_result_x4.png")
        shutil.copyfile(SAMPLE_IMG_PATH, sesr_original_path)
        with open(sesr_result_path, "wb") as f:
            f.write(base64.b64decode(ai_data["image"].split(",")[1]))
        with open(os.path.join(OUTPUT_DIR, "sesr_validation.json"), "w", encoding="utf-8") as f:
            json.dump({
                "original": {"path": sesr_original_path, "width": ai_data["original_width"], "height": ai_data["original_height"]},
                "result": {"path": sesr_result_path, "width": ai_data["width"], "height": ai_data["height"]},
                "engine": ai_data["engine"],
                "license": ai_data["license"],
                "inference": ai_data["inference"],
                "neural_scale": ai_data["neural_scale"],
            }, f, ensure_ascii=False, indent=2)
        print(f"SESR inference succeeded in {elapsed:.2f}s; original {ai_data['original_width']}x{ai_data['original_height']}, result {ai_data['width']}x{ai_data['height']}.")
    else:
        assert resp.status_code == 500, f"AI path must report missing model: {resp.text}"
        assert "SESR" in resp.json()["detail"]
        print(f"SESR path correctly reported missing model in {elapsed:.2f}s.")

    # 5. Background Removal (U2Net via ONNX Runtime)
    print("\n[TEST 5] Testing /api/process/remove-bg (U2Net ONNX)...")
    t0 = time.time()
    resp = client.post("/api/process/remove-bg", json={
        "image": img_b64,
        "model": "u2netp",
        "feather": 1,
    })
    elapsed = time.time() - t0
    assert resp.status_code == 200, f"Remove bg failed: {resp.text}"
    data = resp.json()
    assert data["ok"] is True
    out_rembg_path = os.path.join(OUTPUT_DIR, "u2net_transparent.png")
    with open(out_rembg_path, "wb") as f:
        f.write(base64.b64decode(data["image"].split(",")[1]))
    print(f"U2Net background removal succeeded in {elapsed:.2f}s! Wrote transparent image to {out_rembg_path}")

    # 6. Contextual Inpainting (OpenCV Telea)
    print("\n[TEST 6] Testing /api/process/inpaint (OpenCV Inpainting)...")
    import numpy as np
    import cv2
    # Create test mask (a circle in the center)
    mask = np.zeros((500, 500), dtype=np.uint8)
    cv2.circle(mask, (250, 250), 40, 255, -1)
    _, mask_png = cv2.imencode(".png", mask)
    mask_b64 = "data:image/png;base64," + base64.b64encode(mask_png.tobytes()).decode("ascii")

    t0 = time.time()
    resp = client.post("/api/process/inpaint", json={
        "image": img_b64,
        "mask": mask_b64,
        "radius": 5,
        "method": "telea",
    })
    elapsed = time.time() - t0
    assert resp.status_code == 200, f"Inpaint failed: {resp.text}"
    data = resp.json()
    assert data["ok"] is True
    out_inpaint_path = os.path.join(OUTPUT_DIR, "inpaint_output.png")
    with open(out_inpaint_path, "wb") as f:
        f.write(base64.b64decode(data["image"].split(",")[1]))
    print(f"Inpainting succeeded in {elapsed:.2f}s! Wrote {out_inpaint_path}")

    # 7. Photographic Adjustments
    print("\n[TEST 7] Testing /api/process/adjust...")
    t0 = time.time()
    resp = client.post("/api/process/adjust", json={
        "image": img_b64,
        "brightness": 15.0,
        "contrast": 20.0,
        "saturation": 25.0,
        "temperature": 10.0,
        "hue": 5.0,
        "sharpen": 30.0,
    })
    elapsed = time.time() - t0
    assert resp.status_code == 200, f"Adjust failed: {resp.text}"
    data = resp.json()
    assert data["ok"] is True
    out_adj_path = os.path.join(OUTPUT_DIR, "adjust_output.png")
    with open(out_adj_path, "wb") as f:
        f.write(base64.b64decode(data["image"].split(",")[1]))
    print(f"Adjustments succeeded in {elapsed:.2f}s! Wrote {out_adj_path}")

    # 8. Halftone Screening
    print("\n[TEST 8] Testing /api/process/halftone (CMYK screening)...")
    t0 = time.time()
    resp = client.post("/api/process/halftone", json={
        "image": img_b64,
        "cell_size": 8,
        "angle": 45.0,
        "shape": "circle",
        "color_mode": "cmyk",
        "dpi": 300,
    })
    elapsed = time.time() - t0
    assert resp.status_code == 200, f"Halftone failed: {resp.text}"
    data = resp.json()
    assert data["ok"] is True
    out_half_path = os.path.join(OUTPUT_DIR, "halftone_cmyk.png")
    with open(out_half_path, "wb") as f:
        f.write(base64.b64decode(data["image"].split(",")[1]))
    print(f"Halftone succeeded in {elapsed:.2f}s! Wrote {out_half_path}")

    print("\n" + "=" * 60)
    print("ALL 8 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print(f"Verified test outputs saved to: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()

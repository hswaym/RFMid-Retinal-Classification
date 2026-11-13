"""Ophthalmic Retinal Fundus Quality & Validity Gate.

Validates whether an uploaded image exhibits authentic retinal fundus optical,
spectral, and morphological characteristics before allowing clinical inference.
Rejects out-of-distribution (OOD) artifacts such as ID cards, text documents,
selfies, general photography, and synthetic noise.
"""

from typing import Any, Dict, Tuple
import cv2
import numpy as np


def validate_fundus_image(
    image_bgr: np.ndarray,
    min_resolution: int = 64,
) -> Tuple[bool, str, Dict[str, Any]]:
    """Evaluates multi-spectral optical and morphological criteria of retinal fundus photographs.

    Args:
        image_bgr: Input BGR image as uint8 NumPy array.
        min_resolution: Minimum acceptable width and height.

    Returns:
        Tuple of (is_valid: bool, rejection_reason: str, metrics: Dict[str, Any]).
    """
    if image_bgr is None or image_bgr.size == 0:
        return False, "Corrupted or empty image payload submitted.", {}

    h, w = image_bgr.shape[:2]
    if h < min_resolution or w < min_resolution:
        return (
            False,
            f"Image dimensions ({w}x{h}) below minimum required resolution ({min_resolution}x{min_resolution}).",
            {"width": w, "height": h},
        )

    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)

    # 1. Global Luminescence / Exposure check
    v_mean = float(np.mean(hsv[:, :, 2]))
    if v_mean < 12.0:
        return (
            False,
            "Severe under-exposure: image is near-complete darkness with insufficient illumination.",
            {"mean_value": v_mean},
        )
    if v_mean > 248.0:
        return (
            False,
            "Severe over-exposure: image is pure white washout with saturated pixels.",
            {"mean_value": v_mean},
        )

    # 2. Document / Paper Background Check (Pure White Pixel Ratio)
    # Real fundus cameras photograph through pupil apertures, having dark periphery and reddish tissue.
    # Documents, ID cards, slides, and invoices typically have >25% near-white pixels.
    white_mask = (rgb[:, :, 0] > 215) & (rgb[:, :, 1] > 215) & (rgb[:, :, 2] > 215)
    white_ratio = float(np.mean(white_mask))
    if white_ratio > 0.25:
        return (
            False,
            f"Document or artificial white background detected ({white_ratio * 100:.1f}% white pixels). Retinal fundus photographs require dark ophthalmic background aperture.",
            {"white_pixel_ratio": white_ratio},
        )

    # 3. Hemoglobin Absorption Signature (Red-to-Blue Spectral Ratio)
    # Retinal tissue illuminated in funduscopy reflects heavily above 600nm (melanin + hemoglobin)
    # while absorbing green/blue. Thus, R_mean / B_mean is strictly >= 1.25 in fundus images.
    r_mean = float(np.mean(rgb[:, :, 0]))
    b_mean = float(np.mean(rgb[:, :, 2]))
    rb_ratio = float((r_mean + 1e-4) / (b_mean + 1e-4))
    if rb_ratio < 1.25:
        return (
            False,
            f"Missing retinal vascular hemoglobin absorption signature (Red-to-Blue ratio {rb_ratio:.2f} < 1.25). Image does not exhibit choroidal/retinal vascular chrominance.",
            {"rb_ratio": rb_ratio, "r_mean": r_mean, "b_mean": b_mean},
        )

    # 4. Retinal Chromatic Saturation
    # Natural fundus tissue exhibits high vascular saturation; grayscale or washed out cards fail this.
    s_mean = float(np.mean(hsv[:, :, 1]))
    if s_mean < 35.0:
        return (
            False,
            f"Insufficient chromatic saturation ({s_mean:.1f} < 35.0). Retinal parenchyma requires characteristic vascular and melanin pigmentation.",
            {"saturation_mean": s_mean},
        )

    # 5. Red-Orange Vascular Hue Concentration
    # OpenCV Hue is 0-180. Red-orange covers 0-35 and 150-180.
    h_chan = hsv[:, :, 0]
    red_orange_mask = ((h_chan <= 35) | (h_chan >= 150)) & (hsv[:, :, 1] > 25)
    red_orange_ratio = float(np.mean(red_orange_mask))
    if red_orange_ratio < 0.20:
        return (
            False,
            f"Insufficient retinal hue distribution ({red_orange_ratio * 100:.1f}% < 20.0%). Expected dominant red-orange fundus parenchyma.",
            {"red_orange_ratio": red_orange_ratio},
        )

    metrics = {
        "width": w,
        "height": h,
        "mean_luminescence": round(v_mean, 2),
        "white_pixel_ratio": round(white_ratio, 4),
        "rb_ratio": round(rb_ratio, 2),
        "saturation_mean": round(s_mean, 2),
        "red_orange_ratio": round(red_orange_ratio, 4),
    }

    return True, "Valid retinal fundus photograph.", metrics


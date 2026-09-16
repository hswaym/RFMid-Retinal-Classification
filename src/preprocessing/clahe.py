"""Green-Channel CLAHE (Contrast Limited Adaptive Histogram Equalization).

The green channel of fundus photography provides the strongest optical absorption
and contrast for retinal micro-lesions (microaneurysms, hemorrhages, exudates).
Applying CLAHE specifically to this channel enhances diagnostic structures without
distorting overall retinal chrominance.
"""

from typing import Tuple
import cv2
import numpy as np


def apply_green_channel_clahe(
    image: np.ndarray,
    clip_limit: float = 2.0,
    tile_grid_size: Tuple[int, int] = (8, 8),
    is_rgb: bool = True,
) -> np.ndarray:
    """Applies CLAHE exclusively to the green channel of a 3-channel fundus image.

    Args:
        image: Input uint8 image of shape (H, W, 3).
        clip_limit: Threshold for contrast limiting (default: 2.0).
        tile_grid_size: Size of grid for histogram equalization (default: (8, 8)).
        is_rgb: True if channels are RGB, False if BGR (default: True).

    Returns:
        Contrast-enhanced uint8 image with CLAHE applied to the green channel.
    """
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError(f"Expected 3-channel image, got shape {image.shape}")

    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)

    # In both RGB and BGR, channel index 1 is Green
    green_channel = image[:, :, 1]
    enhanced_green = clahe.apply(green_channel)

    enhanced_image = image.copy()
    enhanced_image[:, :, 1] = enhanced_green
    return enhanced_image

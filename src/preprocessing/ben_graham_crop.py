"""Ben Graham's Circular Fundus Cropping.

Detects the circular field-of-view (FOV) of retinal fundus images,
removes non-informative black margins, and standardizes to 224x224.
"""

from typing import Tuple, Union
import cv2
import numpy as np


def crop_black_border(image: np.ndarray, tolerance: int = 7) -> np.ndarray:
    """Removes dark non-informative borders around retinal fundus images.

    Args:
        image: Input image as NumPy array (H, W, C) or (H, W).
        tolerance: Pixel intensity threshold below which pixels are treated as background.

    Returns:
        Cropped image containing the retinal field of view.
    """
    if image.ndim == 2:
        mask = image > tolerance
        if not np.any(mask):
            return image
        return image[np.ix_(mask.any(axis=1), mask.any(axis=0))]

    # Convert to grayscale for robust mask generation
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY if image.shape[2] == 3 else cv2.COLOR_BGR2GRAY)
    mask = gray > tolerance

    # If mask is empty, fallback to original
    if not np.any(mask):
        return image

    row_indices = mask.any(axis=1)
    col_indices = mask.any(axis=0)

    cropped = image[np.ix_(row_indices, col_indices)]
    if cropped.size == 0:
        return image

    return cropped


def circle_crop_fov(image: np.ndarray, output_size: int = 224, tolerance: int = 7) -> np.ndarray:
    """Detects the circular retinal FOV, crops black margins, and resizes to output_size x output_size.

    Args:
        image: Input uint8 image (H, W, 3).
        output_size: Target square dimension (default: 224).
        tolerance: Tolerance threshold for background detection.

    Returns:
        Square cropped and resized image of shape (output_size, output_size, 3).
    """
    cropped = crop_black_border(image, tolerance=tolerance)
    resized = cv2.resize(cropped, (output_size, output_size), interpolation=cv2.INTER_AREA)

    # Apply circular mask to ensure clean borders without corner boundary artifacts
    height, width = resized.shape[:2]
    mask = np.zeros((height, width), dtype=np.uint8)
    center = (int(width / 2), int(height / 2))
    radius = int(min(width, height) / 2)
    cv2.circle(mask, center, radius, (255,), -1)

    result = cv2.bitwise_and(resized, resized, mask=mask)
    return result


def ben_graham_local_norm(image: np.ndarray, sigma: int = 10) -> np.ndarray:
    """Ben Graham's local contrast enhancement via Gaussian blur subtraction.

    Subtracts local mean illumination: 4 * image - 4 * GaussianBlur(image) + 128.
    Emphasizes microvascular lesions and normalizes illumination gradients.

    Args:
        image: Input uint8 image.
        sigma: Standard deviation for Gaussian blur.

    Returns:
        Locally normalized image with enhanced vessel and lesion contrast.
    """
    blur = cv2.GaussianBlur(image, (0, 0), sigma)
    return cv2.addWeighted(image, 4, blur, -4, 128)

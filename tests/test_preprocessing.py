"""Unit tests for ophthalmic preprocessing modules."""

import numpy as np
import pytest
from src.preprocessing.ben_graham_crop import circle_crop_fov, crop_black_border
from src.preprocessing.clahe import apply_green_channel_clahe


def test_crop_black_border():
    # Synthetic image with black borders around a central circle
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    img[50:150, 50:150] = [200, 100, 50]

    cropped = crop_black_border(img, tolerance=10)
    assert cropped.shape[0] == 100
    assert cropped.shape[1] == 100
    assert cropped.shape[2] == 3


def test_circle_crop_fov():
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img[30:270, 30:270] = [150, 80, 40]

    result = circle_crop_fov(img, output_size=224)
    assert result.shape == (224, 224, 3)
    assert result.dtype == np.uint8


def test_apply_green_channel_clahe():
    img = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
    enhanced = apply_green_channel_clahe(img, clip_limit=2.0)

    assert enhanced.shape == (224, 224, 3)
    # Red and Blue channels should remain identical
    np.testing.assert_array_equal(enhanced[:, :, 0], img[:, :, 0])
    np.testing.assert_array_equal(enhanced[:, :, 2], img[:, :, 2])
    # Green channel should be contrast enhanced
    assert not np.array_equal(enhanced[:, :, 1], img[:, :, 1])


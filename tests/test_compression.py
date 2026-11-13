"""Unit tests for feature compression modules."""

import math
import numpy as np
import pytest
import torch
from src.compression.autoencoder import FeatureAutoencoder
from src.compression.bottleneck_linear import BottleneckLinear


def test_bottleneck_linear_shape_and_bounds():
    layer = BottleneckLinear(in_features=512, n_qubits=4, scale_pi=True)
    x = torch.randn(8, 512)
    out = layer(x)

    assert out.shape == (8, 4)
    # Output must strictly lie in [-pi, pi]
    assert (out >= -math.pi).all()
    assert (out <= math.pi).all()


def test_autoencoder_reconstruction_and_bounds():
    ae = FeatureAutoencoder(in_features=512, latent_dim=4, scale_pi=True)
    x = torch.randn(4, 512)

    latent = ae.encode(x)
    assert latent.shape == (4, 4)
    assert (latent >= -math.pi).all()
    assert (latent <= math.pi).all()

    recon, latent_out = ae(x)
    assert recon.shape == (4, 512)
    assert latent_out.shape == (4, 4)


def test_autoencoder_loaded_checkpoint():
    ae = FeatureAutoencoder.load("checkpoints/autoencoder_4qubit.pt")
    x = torch.randn(2, 512)
    latent = ae.encode(x)

    assert latent.shape == (2, 4)
    assert not torch.isnan(latent).any()

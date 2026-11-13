"""Unit tests for PennyLane Parameterized Quantum Circuit modules."""

import math
import pytest
import torch
from src.quantum.circuits import create_quantum_circuit
from src.quantum.torch_layer import get_quantum_torch_layer


def test_quantum_circuit_qnode():
    qnode, weight_shapes = create_quantum_circuit(n_qubits=4, n_layers=1)
    assert weight_shapes == {"weights": (1, 4, 3)}

    inputs = [0.1, -0.5, 1.2, -1.0]
    weights = torch.randn(1, 4, 3).numpy()
    expectations = qnode(inputs, weights)

    assert len(expectations) == 4
    for exp in expectations:
        # Pauli-Z expectation values must lie in [-1.0, 1.0]
        assert -1.0001 <= float(exp) <= 1.0001


def test_quantum_torch_layer_autograd():
    qlayer = get_quantum_torch_layer(n_qubits=4, n_layers=1)
    batch_angles = torch.randn(3, 4, requires_grad=True)

    output = qlayer(batch_angles)
    assert output.shape == (3, 4)

    # Test parameter-shift backward pass
    loss = output.sum()
    loss.backward()

    assert batch_angles.grad is not None
    assert qlayer.weights.grad is not None
    assert not torch.isnan(qlayer.weights.grad).any()


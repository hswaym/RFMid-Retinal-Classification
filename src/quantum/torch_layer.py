"""PennyLane PyTorch TorchLayer integration.

Wraps the Parameterized Quantum Circuit QNode as a native torch.nn.Module
via qml.qnn.TorchLayer so classical feature extraction, compression,
and quantum decision layers can be trained end-to-end with PyTorch autograd.
"""

from pathlib import Path
from typing import Optional, Union
import pennylane as qml
import torch
import torch.nn as nn

from src.quantum.circuits import create_quantum_circuit, get_circuit_from_config


def get_quantum_torch_layer(
    n_qubits: int = 4,
    n_layers: int = 1,
    dev_name: str = "default.qubit",
    shots: Optional[int] = None,
) -> qml.qnn.TorchLayer:
    """Instantiates a PyTorch-compatible TorchLayer for the quantum circuit.

    Args:
        n_qubits: Number of quantum wires / input dimensions (default: 4).
        n_layers: Depth of StronglyEntanglingLayers ansatz (default: 1).
        dev_name: PennyLane backend device (default: 'default.qubit').
        shots: Measurement shots (None for exact autograd backpropagation).

    Returns:
        A qml.qnn.TorchLayer instance that accepts (B, n_qubits) input tensors
        and returns (B, n_qubits) Pauli-Z expectation value tensors.
    """
    qnode, weight_shapes = create_quantum_circuit(
        n_qubits=n_qubits,
        n_layers=n_layers,
        dev_name=dev_name,
        shots=shots,
    )

    qlayer = qml.qnn.TorchLayer(qnode, weight_shapes)
    return qlayer


def get_quantum_torch_layer_from_config(
    config_path: Union[str, Path],
) -> qml.qnn.TorchLayer:
    """Instantiates a TorchLayer from a YAML configuration file."""
    qnode, weight_shapes, _ = get_circuit_from_config(config_path)
    return qml.qnn.TorchLayer(qnode, weight_shapes)


if __name__ == "__main__":
    print("=======================================================")
    print("          PennyLane TorchLayer Sanity Test            ")
    print("=======================================================")

    # 5-line sanity test confirming forward pass and gradient flow
    qlayer = get_quantum_torch_layer(n_qubits=4, n_layers=1)
    x = torch.randn(2, 4, requires_grad=True)
    out = qlayer(x)
    loss = out.sum()
    loss.backward()

    assert qlayer.weights.grad is not None, "Gradient did not flow to quantum circuit weights!"
    assert x.grad is not None, "Gradient did not flow back to input features!"

    print("Forward Pass Succeeded:")
    print(f"  Input Shape:       {list(x.shape)} (Batch of 2 samples, 4 angles)")
    print(f"  Output Shape:      {list(out.shape)} (Expectation values <Z_i>)")
    print(f"  Output Values:\n{out.detach().numpy()}")

    print("\nBackward Pass (Autograd) Succeeded:")
    print(f"  Circuit Weight Shape:  {list(qlayer.weights.shape)} (layers, qubits, 3 angles)")
    print(f"  Weight Gradients:\n{qlayer.weights.grad.numpy()}")
    print(f"  Input Gradients:\n{x.grad.numpy()}")
    print(f"  Total Quantum Trainable Params: {qlayer.weights.numel()} parameters")
    print("=======================================================")

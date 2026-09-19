"""Parameterized Quantum Circuits for Retinal Image Classification.

Defines PennyLane QNodes utilizing:
- AngleEmbedding (rotation='Y') for classical-to-quantum state encoding.
- StronglyEntanglingLayers (Rx, Ry, Rz + CNOT) for parameterized variational ansatz.
- Pauli-Z expectation value measurements across all qubits.
- Configuration loading from YAML (n_qubits, n_layers, device).
"""

from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import yaml

try:
    import pennylane as qml
except ImportError:
    qml = None


def load_circuit_config(config_path: Union[str, Path]) -> Dict[str, Any]:
    """Loads quantum circuit configuration from a YAML file."""
    config_path = Path(config_path)
    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    quantum_cfg = config.get("quantum", {})
    return {
        "n_qubits": int(quantum_cfg.get("n_qubits", 4)),
        "n_layers": int(quantum_cfg.get("n_layers", 1)),
        "device": str(quantum_cfg.get("device", "default.qubit")),
        "shots": quantum_cfg.get("shots", None),
    }


def create_quantum_circuit(
    n_qubits: int = 4,
    n_layers: int = 1,
    dev_name: str = "default.qubit",
    shots: Optional[int] = None,
) -> Tuple[Callable, Dict[str, Tuple[int, ...]]]:
    """Builds and returns a PennyLane QNode and its trainable weight shapes.

    Circuit Blueprint:
    1. Feature Map: AngleEmbedding with Y-rotation over all wires.
    2. Variational Ansatz: StronglyEntanglingLayers across n_layers with circular CNOT entanglement.
    3. Measurement: Pauli-Z expectation value for each qubit wire: [<Z_0>, <Z_1>, ..., <Z_{n-1}>].

    Args:
        n_qubits: Number of quantum wires (default: 4).
        n_layers: Depth of StronglyEntanglingLayers (default: 1).
        dev_name: PennyLane device identifier (default: 'default.qubit').
        shots: Number of measurement shots (None for analytical statevector simulation).

    Returns:
        (qnode, weight_shapes)
        where weight_shapes is a dict: {'weights': (n_layers, n_qubits, 3)}
    """
    if qml is None:
        raise ImportError("PennyLane is required to instantiate quantum circuits. Run 'pip install pennylane'.")

    dev = qml.device(dev_name, wires=n_qubits, shots=shots)
    weight_shape = qml.StronglyEntanglingLayers.shape(n_layers=n_layers, n_wires=n_qubits)
    weight_shapes = {"weights": weight_shape}

    @qml.qnode(dev, interface="torch", diff_method="backprop" if shots is None else "parameter-shift")
    def circuit(inputs, weights):
        # 1. Classical-to-Quantum Feature Map: AngleEmbedding (Ry)
        qml.AngleEmbedding(inputs, wires=range(n_qubits), rotation="Y")

        # 2. Parameterized Quantum Ansatz: StronglyEntanglingLayers (Rx, Ry, Rz + CNOT)
        qml.StronglyEntanglingLayers(weights, wires=range(n_qubits))

        # 3. Measurement: Pauli-Z expectation value on each qubit
        return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

    return circuit, weight_shapes


# Alias for explicit API naming compatibility
build_qnode = create_quantum_circuit


def get_circuit_from_config(
    config_path: Union[str, Path],
) -> Tuple[Callable, Dict[str, Tuple[int, ...]], Dict[str, Any]]:
    """Instantiates a QNode directly from a YAML configuration file.

    Args:
        config_path: Path to YAML config (e.g. configs/hybrid_4qubit.yaml).

    Returns:
        (qnode, weight_shapes, cfg_dict)
    """
    cfg = load_circuit_config(config_path)
    circuit, weight_shapes = create_quantum_circuit(
        n_qubits=cfg["n_qubits"],
        n_layers=cfg["n_layers"],
        dev_name=cfg["device"],
        shots=cfg["shots"],
    )
    return circuit, weight_shapes, cfg


def draw_circuit(n_qubits: int = 4, n_layers: int = 1) -> str:
    """Generates ASCII circuit diagram string for inspection and reports."""
    circuit, weight_shapes = create_quantum_circuit(n_qubits=n_qubits, n_layers=n_layers)

    # Dummy inputs and weights for drawing
    import torch
    dummy_in = torch.zeros(n_qubits)
    dummy_w = torch.zeros(weight_shapes["weights"])

    drawer = qml.draw(circuit)
    return drawer(dummy_in, dummy_w)


if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("Testing Quantum Circuit Module...")
    # Test loading from config
    cfg_file = "configs/hybrid_4qubit.yaml"
    qnode, w_shapes, cfg = get_circuit_from_config(cfg_file)

    print(f"Loaded Config from {cfg_file}:")
    print(f"  Qubits:  {cfg['n_qubits']}")
    print(f"  Layers:  {cfg['n_layers']}")
    print(f"  Device:  {cfg['device']}")
    print(f"  Weight Shapes: {w_shapes}")

    # Test forward pass with torch tensors
    import torch
    dummy_input = torch.tensor([0.1, 0.2, 0.3, 0.4])
    dummy_weights = torch.randn(w_shapes["weights"])

    expvals = qnode(dummy_input, dummy_weights)
    print(f"\nForward pass output:")
    print(f"  Expected {cfg['n_qubits']} measurements: {[round(float(v), 4) for v in expvals]}")

    # Draw circuit
    print("\n--- Quantum Circuit Diagram ---")
    try:
        circuit_diagram = draw_circuit(n_qubits=4, n_layers=1)
        print(circuit_diagram)
    except Exception as e:
        print(f"Circuit diagram drawing skipped: {e}")


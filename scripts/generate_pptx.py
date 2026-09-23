"""Generates a professional 16:9 widescreen PPTX presentation matching the user's exact slide structure:
1. Project name member details and all
2. Introduction
3. Problem Statement
4. Objectives
5. Literature Review and Research Gap
6. Methodology
7. System Architecture and Technology Stack
8. Model Algorithm Approach
9. Model Training & Model Results
10. Mid Sem Percentage Completion
11. References
12. Thank You
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path: str):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette: Deep Slate Navy & Clinical Teal
    NAVY = RGBColor(15, 23, 42)        # Slate 900
    DARK_BLUE = RGBColor(30, 58, 138)  # Blue 900
    TEAL = RGBColor(13, 148, 136)      # Teal 600
    CYAN = RGBColor(2, 132, 199)       # Sky 600
    WHITE = RGBColor(255, 255, 255)
    LIGHT_BG = RGBColor(248, 250, 252) # Slate 50
    CARD_BG = RGBColor(255, 255, 255)
    BORDER_COLOR = RGBColor(226, 232, 240) # Slate 200
    TEXT_MAIN = RGBColor(15, 23, 42)   # Slate 900
    TEXT_MUTED = RGBColor(71, 85, 105) # Slate 600
    GREEN = RGBColor(22, 163, 74)

    def add_header(slide, title_text: str, category_tag: str):
        banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
        banner.fill.solid()
        banner.fill.fore_color.rgb = NAVY
        banner.line.color.rgb = NAVY

        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.12), Inches(11.7), Inches(0.3))
        tf_tag = tag_box.text_frame
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = TEAL

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.55))
        tf_title = title_box.text_frame
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(11.7), Inches(0.3))
        tf_f = footer_box.text_frame
        p_f = tf_f.paragraphs[0]
        p_f.text = "EDI Mid-Semester Assessment | Project ID: ERI 5 / TY_CSE_10 | HQNN for Retinal Disease Classification"
        p_f.font.size = Pt(9)
        p_f.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER_COLOR):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)
        return card

    # =========================================================
    # SLIDE 1: PROJECT NAME, MEMBER DETAILS, AND ALL
    # =========================================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = NAVY
    bg1.line.color.rgb = NAVY

    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(1.2), Inches(1.5), Inches(0.08))
    bar.fill.solid()
    bar.fill.fore_color.rgb = TEAL
    bar.line.color.rgb = TEAL

    t_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.45), Inches(10.9), Inches(2.2))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Hybrid Quantum-Classical Convolutional Neural Networks for Retinal Disease Severity Grading"
    p1.font.size = Pt(30)
    p1.font.bold = True
    p1.font.color.rgb = WHITE

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Empirical Evaluation of Parameterized Quantum Circuits (PQCs) on the APTOS 2019 Benchmark"
    p1_sub.font.size = Pt(17)
    p1_sub.font.color.rgb = TEAL
    p1_sub.space_before = Pt(10)

    add_card(slide1, 1.2, 4.0, 10.9, 2.7, bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
    dt_box = slide1.shapes.add_textbox(Inches(1.5), Inches(4.15), Inches(10.3), Inches(2.4))
    tf_dt = dt_box.text_frame
    tf_dt.word_wrap = True

    p = tf_dt.paragraphs[0]
    p.text = "PROJECT METADATA & TEAM ROSTER"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p_m1 = tf_dt.add_paragraph()
    p_m1.text = "• Project ID / Code: ERI 5 / TY_CSE_10  |  Academic Year: 2026–2027"
    p_m1.font.size = Pt(12)
    p_m1.font.color.rgb = WHITE
    p_m1.space_before = Pt(4)

    p_m2 = tf_dt.add_paragraph()
    p_m2.text = "• Team Lead: Harshwardhan Suryawanshi (Quantum Architecture & Bridge Integration)"
    p_m2.font.size = Pt(12)
    p_m2.font.color.rgb = RGBColor(226, 232, 240)
    p_m2.space_before = Pt(3)

    p_m3 = tf_dt.add_paragraph()
    p_m3.text = "• Project Group Members: [Team Member 2 - Baselines & Loss] | [Team Member 3 - Preprocessing] | [Team Member 4 - Compression & Phase 4]"
    p_m3.font.size = Pt(12)
    p_m3.font.color.rgb = RGBColor(226, 232, 240)
    p_m3.space_before = Pt(3)

    p_m4 = tf_dt.add_paragraph()
    p_m4.text = "• Project Guide / Mentor: Respective EDI Guide (Mr. Gopal B. Deshmukh)"
    p_m4.font.size = Pt(12)
    p_m4.font.color.rgb = RGBColor(226, 232, 240)
    p_m4.space_before = Pt(3)

    p_m5 = tf_dt.add_paragraph()
    p_m5.text = "• Verified Checkpoint: 4-Qubit Autoencoder Hybrid (QWK: 0.7693, AUC-ROC: 0.8716) | Commit: 91bd77d"
    p_m5.font.size = Pt(11)
    p_m5.font.bold = True
    p_m5.font.color.rgb = TEAL
    p_m5.space_before = Pt(6)

    # =========================================================
    # SLIDE 2: INTRODUCTION
    # =========================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Introduction: Diabetic Retinopathy & Clinical Screening", "Project Background")

    add_card(slide2, 0.8, 1.4, 5.6, 5.4)
    tb = slide2.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(5.2), Inches(5.0))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "1. Clinical Background & Pathology"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = DARK_BLUE

    points_intro1 = [
        "Diabetic Retinopathy (DR): Microvascular complication of diabetes and the leading cause of preventable blindness in working-age adults.",
        "Pathophysiological Progression: Chronic hyperglycemia damages retinal capillary pericytes, causing microaneurysms, fluid leakage (hard exudates), capillary occlusion (cotton wool spots), and abnormal vessel proliferation.",
        "Clinical Urgency: Early detection and timely laser/anti-VEGF intervention prevents 95% of severe vision loss, but manual screening is constrained by a global shortage of retina specialists."
    ]
    for pt in points_intro1:
        p = tf.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MAIN
        p.space_before = Pt(10)

    add_card(slide2, 6.9, 1.4, 5.6, 5.4)
    tb2 = slide2.shapes.add_textbox(Inches(7.1), Inches(1.6), Inches(5.2), Inches(5.0))
    tf2 = tb2.text_frame
    tf2.word_wrap = True

    p = tf2.paragraphs[0]
    p.text = "2. The ICDR 5-Grade Staging System"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = DARK_BLUE

    grades = [
        "Grade 0 (No DR): Normal healthy retina; no vascular abnormalities (49.3% in APTOS).",
        "Grade 1 (Mild NPDR): Microaneurysms only; annual monitoring recommended (10.1% in APTOS).",
        "Grade 2 (Moderate NPDR): More than microaneurysms; dot-blot hemorrhages, hard exudates, cotton wool spots (27.3% in APTOS).",
        "Grade 3 (Severe NPDR): Meets the '4-2-1 Rule': severe hemorrhages in 4 quadrants or venous beading in 2+ quadrants (5.3% in APTOS).",
        "Grade 4 (Proliferative DR): Neovascularization and vitreous hemorrhage; high risk of imminent blindness (8.1% in APTOS)."
    ]
    for g in grades:
        p = tf2.add_paragraph()
        p.text = "• " + g
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_MAIN
        p.space_before = Pt(8)

    # =========================================================
    # SLIDE 3: PROBLEM STATEMENT
    # =========================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Problem Statement: Clinical & Computational Challenges", "Core Problem Definition")

    prob_cards = [
        ("1. Severe Real-World Class Imbalance", "In the benchmark APTOS 2019 dataset (3,662 images), Grade 0 constitutes 49.3% while Grade 3 represents only 5.3%. Standard cross-entropy optimization collapses by predicting only the majority class, missing severe sight-threatening lesions.", DARK_BLUE),
        ("2. Asymmetric Ordinal Distance Penalties", "DR severity is an ordinal clinical continuum. Misclassifying Grade 0 as Grade 1 is a harmless follow-up delay; misclassifying Grade 0 as Grade 4 causes irreversible blindness. Standard multi-class accuracy treats all classification mistakes equally.", DARK_BLUE),
        ("3. Classical Overparameterization & Compute", "Deep CNNs (ResNet-50: 25.6M params, ResNet18: 11.2M params) require massive computational resources and risk severe overfitting on rare minority disease grades in medical datasets.", DARK_BLUE),
        ("4. The Quantum Opportunity", "Can shallow Parameterized Quantum Circuits (PQCs) operating in exponential Hilbert space formulate effective decision boundaries with >99% fewer parameters, achieving high clinical agreement (QWK)?", TEAL)
    ]

    for idx, (title, desc, color) in enumerate(prob_cards):
        row = idx // 2
        col = idx % 2
        x = 0.8 + col * 6.0
        y = 1.4 + row * 2.7
        add_card(slide3, x, y, 5.7, 2.5)
        
        tb = slide3.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        
        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MAIN
        p_desc.space_before = Pt(6)

    # =========================================================
    # SLIDE 4: OBJECTIVES
    # =========================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Objectives: Project Goals & Scope", "Project Objectives")

    obj_items = [
        ("Objective 1: Clinical Preprocessing Engine", "Implement automated, standardized fundus preprocessing via Ben Graham circular masking and green-channel CLAHE at 224x224 to enhance lesion contrast.", TEAL),
        ("Objective 2: Controlled Classical Baselines", "Train state-of-the-art classical backbones (ResNet18, MobileNetV2) using class-weighted Focal Loss (gamma=2.0) on APTOS 2019 to establish a rigorous performance benchmark.", DARK_BLUE),
        ("Objective 3: Quantum Architecture & Compression Ablation", "Design PennyLane Parameterized Quantum Circuits (4 & 8 qubits) and systematically compare Linear, Deep Autoencoder, and PCA state preparation bottlenecks.", TEAL),
        ("Objective 4: Parameter Efficiency & Clinical QWK", "Demonstrate that a PQC with only 12 variational parameters can achieve high clinical Quadratic Weighted Kappa (QWK > 0.75) with >99% fewer decision parameters.", DARK_BLUE),
        ("Objective 5: NISQ Noise Resilience & QPU Execution", "Benchmark circuit degradation under simulated depolarizing noise (Qiskit Aer) and execute a 100-sample test batch on real IBM Quantum superconducting hardware (ibm_brisbane).", TEAL),
        ("Objective 6: Clinical Deployment Dashboard", "Develop an interactive Streamlit clinical web app for real-time fundus upload, angle inspection, and instant severity triage.", DARK_BLUE)
    ]

    for idx, (title, desc, color) in enumerate(obj_items):
        row = idx // 2
        col = idx % 2
        x = 0.8 + col * 6.0
        y = 1.4 + row * 1.8
        add_card(slide4, x, y, 5.7, 1.6)
        
        tb = slide4.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        
        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MAIN
        p_desc.space_before = Pt(4)

    # =========================================================
    # SLIDE 5: LITERATURE REVIEW AND RESEARCH GAP
    # =========================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Literature Review & Identified Research Gaps", "State-of-the-Art Analysis")

    table_shape = slide5.shapes.add_table(6, 4, Inches(0.8), Inches(1.4), Inches(11.73), Inches(3.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(3.6)
    table.columns[2].width = Inches(2.2)
    table.columns[3].width = Inches(3.73)

    headers = ["Author & Year", "Proposed Architecture", "Reported Metrics", "Critical Research Limitations"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(11)
            p.font.bold = True
            p.font.color.rgb = WHITE

    rows_data = [
        ("Bali et al. (2025)\nMethodsX (Elsevier)", "QuantumNet: ResNet-50 + Variational Quantum Classifier (VQC)", "Accuracy: 94.11%", "Evaluated only on noiseless simulator; no QWK; arbitrary linear bottleneck; no real QPU execution."),
        ("Ara et al. (2025)\nMethodsX (Elsevier)", "ResNet-50 + Dense Bottleneck + 8-Qubit VQC (Ry-Rz + CNOT)", "Balanced Acc: 80.96%", "Statevector simulation only; zero noise modeling; 2048->8 linear layer causes loss of lesion signals."),
        ("Stalin Babu et al. (2025)\nIEEE OTCON", "HQCNN: Classical CNN + Angle rotation quantum layers", "Accuracy: 98.89%\nF1: 97.58%", "Evaluated on small curated subset; lacks ordinal clinical distance metrics (no QWK)."),
        ("Sultana & Agrawal (2026)\nIEEE Conference", "Q-DRNet: CNN feature encoding + Variational quantum layer", "Accuracy: ~97.30%", "No physical quantum hardware validation; does not evaluate depolarizing or bit-flip noise."),
        ("Alsubai et al. (2023)\nMathematics (MDPI)", "Quantum-enhanced CNN + Multi-qubit Inception module", "Accuracy: 100% (IDRiD)\nAccuracy: 98% (SUSTech)", "Severe risk of overfitting on tiny IDRiD dataset; no QWK; lacks parameter-to-latency accounting.")
    ]

    for row_idx, r in enumerate(rows_data, start=1):
        for col_idx, text in enumerate(r):
            cell = table.cell(row_idx, col_idx)
            cell.text = text
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if row_idx % 2 == 1 else LIGHT_BG
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(10)
                p.font.color.rgb = TEXT_MAIN

    card_gap = add_card(slide5, 0.8, 4.8, 11.73, 2.0, bg_color=LIGHT_BG, border_color=TEAL)
    tb_gap = slide5.shapes.add_textbox(Inches(1.0), Inches(4.9), Inches(11.3), Inches(1.8))
    tf_gap = tb_gap.text_frame
    tf_gap.word_wrap = True

    p = tf_gap.paragraphs[0]
    p.text = "How Our Project Addresses the Critical Gaps in Literature:"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = DARK_BLUE

    gaps = [
        "1. Clinical Metric Rigor: We replace naive accuracy with Quadratic Weighted Kappa (QWK) and multi-class One-vs-Rest AUC-ROC.",
        "2. Systematic Compression Ablation: Instead of an arbitrary linear layer, we benchmark Linear Bottleneck vs. Deep Autoencoder vs. PCA.",
        "3. Strict Parameter & Latency Accounting: We isolate decision parameters (12 quantum params) and measure inference latency.",
        "4. NISQ Noise & QPU Roadmap: Phase 4 introduces Qiskit Aer depolarizing noise sweeps and physical execution on IBM Quantum (ibm_brisbane)."
    ]
    for g in gaps:
        p = tf_gap.add_paragraph()
        p.text = g
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MAIN
        p.space_before = Pt(2)

    # =========================================================
    # SLIDE 6: METHODOLOGY
    # =========================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Methodology: Clinical Preprocessing & Mathematical Formulations", "Technical Methodology")

    math_cards = [
        ("1. Clinical Preprocessing", "• Ben Graham Circular Crop: Automates contour thresholding, circular masking, and black margin removal.\n• Green-Channel CLAHE: Isolates 540-575nm spectrum where hemoglobin absorbs light, maximizing lesion contrast.\n• Bilinear Resize: Standardizes images to 224x224x3.", DARK_BLUE),
        ("2. Class-Weighted Focal Loss", "L_Focal = -sum y_c * alpha_c * (1 - p_c)^gamma * log(p_c)\n\n• gamma = 2.0 suppresses easy majority-class gradients (Grade 0)\n• alpha_c = N / (C * N_c) enforces 9.3x higher penalty on rare Grade 3 lesions.", TEAL),
        ("3. Quantum State Preparation", "|psi(z)> = (X)_{i=0}^{n-1} Ry(z_i) |0>\n\n• Continuous angles z_i in [-pi, pi] rotate qubits on Bloch sphere\n• Constant circuit depth O(1); zero multi-qubit CNOT overhead.", DARK_BLUE),
        ("4. Strongly Entangling Ansatz", "U(theta) = Prod_{l=1}^L [ U_ent * (X) R(alpha, beta, gamma) ]\n\n• 3 Euler rotation angles per qubit: Rz(gamma) Ry(beta) Rx(alpha)\n• Periodic circular CNOT ring generates multi-qubit entanglement.", TEAL),
        ("5. Parameter-Shift Rule", "d<Z_i>/dtheta_j = (<Z_i>(theta_j + pi/2) - <Z_i>(theta_j - pi/2)) / 2\n\n• Evaluates exact analytical gradients without intermediate state readout\n• Enables hardware-native backpropagation on physical QPUs.", DARK_BLUE),
        ("6. Quadratic Weighted Kappa", "kappa = 1 - (sum w_ij O_ij) / (sum w_ij E_ij)\n\nw_ij = (i - j)^2 / (C - 1)^2 = (i - j)^2 / 16\n• Penalizes severe clinical misclassifications quadratically (w_0,4 = 1.0 vs w_0,1 = 0.0625).", TEAL)
    ]

    for idx, (title, formula, color) in enumerate(math_cards):
        row = idx // 3
        col = idx % 3
        x = 0.8 + col * 4.0
        y = 1.4 + row * 2.7
        add_card(slide6, x, y, 3.73, 2.5)
        
        tb = slide6.shapes.add_textbox(Inches(x + 0.15), Inches(y + 0.15), Inches(3.43), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = color
        
        p_f = tf.add_paragraph()
        p_f.text = formula
        p_f.font.size = Pt(10)
        p_f.font.color.rgb = TEXT_MAIN
        p_f.space_before = Pt(6)

    # =========================================================
    # SLIDE 7: SYSTEM ARCHITECTURE AND TECHNOLOGY STACK
    # =========================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "System Architecture & Technology Stack", "System Design & Tech Stack")

    flow_steps = [
        ("1. Preprocessing", "Ben Graham Circular Crop\nGreen CLAHE Isolation\nResize: 224 x 224 x 3", TEAL),
        ("2. Classical Backbone", "ResNet18 (ImageNet)\nFrozen Feature Extractor\nOutput: 512-d Vector", DARK_BLUE),
        ("3. Compression Stage", "Linear / Autoencoder / PCA\nOutput: n_qubits angles\nDomain: [-pi, pi]", TEAL),
        ("4. Quantum PQC", "AngleEmbedding(Ry)\nStronglyEntanglingLayers\nPauli-Z Expectation: [-1, 1]", DARK_BLUE),
        ("5. Output Head", "Linear Head (n -> 5)\nSoftmax Probabilities\nFocal Loss Optimization", TEAL)
    ]

    for idx, (title, desc, color) in enumerate(flow_steps):
        x = 0.8 + idx * 2.4
        add_card(slide7, x, 1.4, 2.2, 2.2, bg_color=WHITE, border_color=color)
        tb = slide7.shapes.add_textbox(Inches(x + 0.1), Inches(1.5), Inches(2.0), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = color
        
        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(10)
        p_desc.font.color.rgb = TEXT_MAIN
        p_desc.space_before = Pt(6)

    tech_cols = [
        ("Medical & Preprocessing", [
            "OpenCV & Albumentations",
            "Ben Graham Circular Masking",
            "Green-Channel CLAHE Equalization"
        ], TEAL),
        ("Deep Learning & AI Stack", [
            "PyTorch 2.2+ (Autograd & GPU)",
            "ResNet18 & MobileNetV2 (Backbones)",
            "Class-Weighted Focal Loss (gamma=2.0)"
        ], DARK_BLUE),
        ("Quantum Technologies", [
            "PennyLane 0.35+ (Differentiable QML)",
            "StronglyEntanglingLayers (Ansatz)",
            "Qiskit 1.0 & IBM Quantum (Hardware)"
        ], TEAL)
    ]

    for idx, (title, items, color) in enumerate(tech_cols):
        x = 0.8 + idx * 4.0
        add_card(slide7, x, 3.8, 3.73, 3.0)
        tb = slide7.shapes.add_textbox(Inches(x + 0.15), Inches(3.9), Inches(3.43), Inches(2.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        
        for item in items:
            p_item = tf.add_paragraph()
            p_item.text = "• " + item
            p_item.font.size = Pt(11)
            p_item.font.color.rgb = TEXT_MAIN
            p_item.space_before = Pt(6)

    # =========================================================
    # SLIDE 8: MODEL ALGORITHM APPROACH
    # =========================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Model Algorithm Approach: Hybrid Pipeline & Compression Ablation", "Core Technical Approach")

    algo_cards = [
        ("1. Classical Feature Extraction & Freezing", "The ResNet18 convolutional backbone is initialized with ImageNet pre-trained weights and frozen. It acts as a deterministic 512-dimensional spatial feature extractor, isolating the learning capacity of the quantum decision layer.", DARK_BLUE),
        ("2. Three Interchangeable Compression Paradigms", "• Bottleneck Linear: Parametric nn.Linear(512, n) with tanh(x) * pi scaling.\n• Deep Autoencoder: 3-layer bottleneck (512->256->64->n) pre-trained with MSE reconstruction loss to preserve non-linear lesion manifolds.\n• PCA Compressor: Statistical SVD projection + min-max angle scaling.", TEAL),
        ("3. Quantum Variational Layer (PQC)", "Features are mapped to rotation angles in [-pi, pi]. State preparation uses AngleEmbedding on the Y-axis. The StronglyEntanglingLayers ansatz applies Euler rotations and circular CNOT entanglement, followed by Pauli-Z expectation value readout in [-1, 1].", DARK_BLUE),
        ("4. CPU-GPU Device Bridging Mechanism", "PennyLane's default.qubit simulator executes on CPU, while PyTorch tensors reside on CUDA GPU. Our custom hybrid module routes angles to .cpu() before the quantum layer and transfers outputs back to .to(device) for the classification head.", TEAL)
    ]

    for idx, (title, desc, color) in enumerate(algo_cards):
        row = idx // 2
        col = idx % 2
        x = 0.8 + col * 6.0
        y = 1.4 + row * 2.7
        add_card(slide8, x, y, 5.7, 2.5)
        
        tb = slide8.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        
        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MAIN
        p_desc.space_before = Pt(6)

    # =========================================================
    # SLIDE 9: MODEL TRAINING & MODEL RESULTS
    # =========================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Model Training & Empirical Results (APTOS Test Set, N=550)", "Training Setup & Benchmark Results")

    res_table_shape = slide9.shapes.add_table(7, 7, Inches(0.8), Inches(1.4), Inches(11.73), Inches(3.6))
    res_table = res_table_shape.table
    res_table.columns[0].width = Inches(2.6)
    res_table.columns[1].width = Inches(1.6)
    res_table.columns[2].width = Inches(1.4)
    res_table.columns[3].width = Inches(1.3)
    res_table.columns[4].width = Inches(1.5)
    res_table.columns[5].width = Inches(1.5)
    res_table.columns[6].width = Inches(1.83)

    cols = ["Model Architecture", "State Prep / Bottleneck", "Decision Params", "Accuracy", "Macro-F1", "QWK (Kappa)", "Latency (ms)"]
    for i, c in enumerate(cols):
        cell = res_table.cell(0, i)
        cell.text = c
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(10)
            p.font.bold = True
            p.font.color.rgb = WHITE

    benchmark_rows = [
        ("ResNet18 Baseline", "Direct Classical Head", "2,565", "81.27%", "0.6601", "0.8721", "206.26 ms"),
        ("MobileNetV2 Baseline", "Direct Classical Head", "6,405", "77.27%", "0.6187", "0.8719", "3.61 ms"),
        ("HQNN (4Q, Autoencoder)", "Deep 3-Layer AE", "297,897 (12 Q)", "59.64%", "0.4182", "0.7693 (Best)", "1.40 ms"),
        ("HQNN (4Q, Linear)", "Bottleneck Linear", "2,089 (12 Q)", "58.12%", "0.3840", "0.7611", "1.15 ms"),
        ("HQNN (8Q, Linear)", "Bottleneck Linear", "4,173 (24 Q)", "67.82%", "0.3269", "0.6376", "2.47 ms"),
        ("HQNN (4Q, PCA)", "Fixed Statistical PCA", "37 Total", "14.00%", "0.1242", "0.1379", "0.62 ms")
    ]

    for row_idx, r in enumerate(benchmark_rows, start=1):
        for col_idx, text in enumerate(r):
            cell = res_table.cell(row_idx, col_idx)
            cell.text = text
            cell.fill.solid()
            if row_idx == 3:
                cell.fill.fore_color.rgb = RGBColor(204, 251, 241)
            elif row_idx % 2 == 1:
                cell.fill.fore_color.rgb = CARD_BG
            else:
                cell.fill.fore_color.rgb = LIGHT_BG
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(10)
                if row_idx == 3 and col_idx == 5:
                    p.font.bold = True
                    p.font.color.rgb = TEAL
                else:
                    p.font.color.rgb = TEXT_MAIN

    add_card(slide9, 0.8, 5.2, 11.73, 1.6, bg_color=LIGHT_BG, border_color=TEAL)
    tb_hl = slide9.shapes.add_textbox(Inches(1.0), Inches(5.3), Inches(11.33), Inches(1.4))
    tf_hl = tb_hl.text_frame
    tf_hl.word_wrap = True

    p = tf_hl.paragraphs[0]
    p.text = "Key Verified Takeaways from Test Evaluation:"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = DARK_BLUE

    points_res = [
        "1. Autoencoder State Prep Wins: Reached QWK 0.7693 and AUC-ROC 0.8716, proving non-linear manifold learning preserves subtle microaneurysms before angle mapping.",
        "2. Extreme Parameter Efficiency: The 4-qubit Linear model achieved QWK 0.7611 with only 12 quantum circuit parameters.",
        "3. Training Speed Acceleration: Caching 512-d features reduced epoch training time from 45 minutes to 12 seconds per epoch."
    ]
    for pt in points_res:
        p = tf_hl.add_paragraph()
        p.text = pt
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MAIN
        p.space_before = Pt(2)

    # =========================================================
    # SLIDE 10: MID SEM PERCENTAGE COMPLETION
    # =========================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Mid-Semester Percentage Completion & Phase 4 Roadmap", "Project Status & Progress")

    status_cards = [
        ("Phase 1: Data & Clinical Preprocessing", "100% COMPLETE", [
            "Ingestion of 3,662 APTOS 2019 retinal fundus images.",
            "Stratified 70/15/15 train/val/test split generation.",
            "Ben Graham circular crop and green-channel CLAHE at 224x224.",
            "Visual verification artifacts generated in reports/preprocessing_samples/."
        ], GREEN),
        ("Phase 2: Classical Baselines & Loss", "100% COMPLETE", [
            "ResNet18 baseline trained (Accuracy: 81.27%, QWK: 0.8721).",
            "MobileNetV2 baseline trained (Accuracy: 77.27%, QWK: 0.8719).",
            "Class-weighted Focal Loss (gamma=2.0) implemented and verified.",
            "Feature extraction and disk caching pipeline operational."
        ], GREEN),
        ("Phase 3: Quantum Circuits & Hybrids", "100% COMPLETE", [
            "PennyLane StronglyEntanglingLayers circuits (4 & 8 qubits) built.",
            "3 Compression modules (Linear, Autoencoder, PCA) implemented.",
            "All 4 hybrid models trained and evaluated on held-out test split.",
            "Head-to-head empirical benchmark matrix compiled in reports/."
        ], GREEN),
        ("Phase 4: Hardware Noise & Deployment", "PLANNED (0% -> 100% by End-Sem)", [
            "Milestone 4.1: Qiskit Aer depolarizing and thermal relaxation noise sweeps.",
            "Milestone 4.2: Execution on real IBM Quantum hardware (ibm_brisbane).",
            "Milestone 4.3: Clinical Streamlit web application deployment.",
            "Milestone 4.4: Final IEEE conference manuscript and viva defense."
        ], DARK_BLUE)
    ]

    for idx, (title, pct, tasks, color) in enumerate(status_cards):
        row = idx // 2
        col = idx % 2
        x = 0.8 + col * 6.0
        y = 1.4 + row * 2.7
        add_card(slide10, x, y, 5.7, 2.5)
        
        tb = slide10.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = f"{title} [{pct}]"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = color
        
        for t in tasks:
            p_t = tf.add_paragraph()
            p_t.text = "✔ " + t if "COMPLETE" in pct else "• " + t
            p_t.font.size = Pt(10)
            p_t.font.color.rgb = TEXT_MAIN
            p_t.space_before = Pt(3)

    # =========================================================
    # SLIDE 11: REFERENCES
    # =========================================================
    slide11 = prs.slides.add_slide(blank_layout)
    add_header(slide11, "References & Literature Citations", "Scholarly References")

    add_card(slide11, 0.8, 1.4, 11.73, 5.4)
    tb_ref = slide11.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.33), Inches(5.0))
    tf_ref = tb_ref.text_frame
    tf_ref.word_wrap = True

    p = tf_ref.paragraphs[0]
    p.text = "Academic & Technical Citations:"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = DARK_BLUE

    refs = [
        "1. Bali, R. et al. (2025). 'QuantumNet: Parameter-efficient hybrid quantum-classical transfer learning for diabetic retinopathy detection.' MethodsX (Elsevier), 14, 102980.",
        "2. Ara, S. et al. (2025). 'Multi-grade diabetic retinopathy classification using 8-qubit variational quantum circuits and stratified sampling.' MethodsX (Elsevier), 14, 103012.",
        "3. Stalin Babu, C. et al. (2025). 'HQCNN: Hybrid quantum convolutional neural networks for retinal disease grading.' IEEE OTCON Proceedings, pp. 112–118.",
        "4. Sultana, M. & Agrawal, P. (2026). 'Q-DRNet: Parameterized quantum circuits for low-power edge ophthalmic diagnostics.' IEEE Conference on Computational Intelligence, pp. 245–251.",
        "5. Alsubai, S. et al. (2023). 'Quantum-enhanced deep neural architectures for medical image representation.' Mathematics (MDPI), 11(14), 3120.",
        "6. Bergholm, V. et al. (2018). 'PennyLane: Automatic differentiation of hybrid quantum-classical computations.' arXiv:1811.04968.",
        "7. APTOS 2019 Blindness Detection Benchmark, Asia Pacific Tele-Ophthalmology Society, Kaggle Dataset (3,662 fundus images).",
        "8. Lin, T.-Y. et al. (2017). 'Focal Loss for Dense Object Detection.' IEEE Transactions on Pattern Analysis and Machine Intelligence, 42(2), 318–327."
    ]
    for r in refs:
        p_r = tf_ref.add_paragraph()
        p_r.text = r
        p_r.font.size = Pt(11)
        p_r.font.color.rgb = TEXT_MAIN
        p_r.space_before = Pt(6)

    # =========================================================
    # SLIDE 12: THANK YOU
    # =========================================================
    slide12 = prs.slides.add_slide(blank_layout)
    bg12 = slide12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg12.fill.solid()
    bg12.fill.fore_color.rgb = NAVY
    bg12.line.color.rgb = NAVY

    t_box = slide12.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.9), Inches(1.5))
    tf12 = t_box.text_frame
    p12 = tf12.paragraphs[0]
    p12.text = "Thank You!"
    p12.font.size = Pt(44)
    p12.font.bold = True
    p12.font.color.rgb = WHITE

    p12_sub = tf12.add_paragraph()
    p12_sub.text = "Questions & Answers | Defense Discussion"
    p12_sub.font.size = Pt(20)
    p12_sub.font.color.rgb = TEAL
    p12_sub.space_before = Pt(8)

    add_card(slide12, 1.2, 3.8, 10.9, 2.8, bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
    dt_box = slide12.shapes.add_textbox(Inches(1.5), Inches(4.0), Inches(10.3), Inches(2.4))
    tf_dt = dt_box.text_frame
    tf_dt.word_wrap = True

    p = tf_dt.paragraphs[0]
    p.text = "PROJECT REPOSITORY & CONTACT DETAILS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p_c1 = tf_dt.add_paragraph()
    p_c1.text = "• GitHub Repository: https://github.com/hswaym/RFMid-Retinal-Classification"
    p_c1.font.size = Pt(13)
    p_c1.font.color.rgb = WHITE
    p_c1.space_before = Pt(6)

    p_c2 = tf_dt.add_paragraph()
    p_c2.text = "• Project Tracking ID: ERI 5 / TY_CSE_10  |  Academic Year: 2026–2027"
    p_c2.font.size = Pt(13)
    p_c2.font.color.rgb = RGBColor(226, 232, 240)
    p_c2.space_before = Pt(4)

    p_c3 = tf_dt.add_paragraph()
    p_c3.text = "• Verified Model Checkpoint: HQNN 4-Qubit Autoencoder (QWK: 0.7693, AUC-ROC: 0.8716)"
    p_c3.font.size = Pt(13)
    p_c3.font.color.rgb = RGBColor(226, 232, 240)
    p_c3.space_before = Pt(4)

    p_c4 = tf_dt.add_paragraph()
    p_c4.text = "• We now invite questions and feedback from the review committee."
    p_c4.font.size = Pt(12)
    p_c4.font.bold = True
    p_c4.font.color.rgb = TEAL
    p_c4.space_before = Pt(8)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    output_pptx = r"c:\Users\hsway\OneDrive\Desktop\Everything\College Projects\ERI 5\hqnn-retinal-classification\reports\mid_sem_presentation.pptx"
    create_presentation(output_pptx)

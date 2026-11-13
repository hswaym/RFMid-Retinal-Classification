import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * RetinalQuantumCanvas (Figma Sci-Fi Clinical Theme)
 * High-performance WebGL scene implementing "The Eye Becomes the Circuit".
 * Visual Palette:
 *  - Electric Cyan (#00F5D4)
 *  - Luminous Violet (#8A2BE2)
 *  - Electric Cobalt (#2F7DF6)
 *  - Retinal Hemoglobin Amber/Coral (#FFB703 / #FF4D6D)
 */
export default function RetinalQuantumCanvas({ progress = 0 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const blochRef = useRef(null);
  const ringRef = useRef(null);
  const targetProgress = useRef(progress);

  useEffect(() => {
    targetProgress.current = progress;
  }, [progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.warn("WebGL not supported, falling back.", e);
      return;
    }

    // Generate 1500 particles for high-density retinal vascular graph
    const PARTICLE_COUNT = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const origPositions = new Float32Array(PARTICLE_COUNT * 3);

    const cCyan = new THREE.Color('#00F5D4');       // Quantum energy
    const cViolet = new THREE.Color('#8A2BE2');     // Entanglement
    const cBlue = new THREE.Color('#2F7DF6');       // Cobalt telemetry
    const cCoral = new THREE.Color('#FF4D6D');      // Hemoglobin microaneurysms
    const cAmber = new THREE.Color('#FFB703');      // Hard exudates

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      let x, y, z;

      if (i < 350) {
        // Optic disc and central vascular arcade
        const theta = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.5) * 0.45;
        x = Math.cos(theta) * r + 0.55;
        y = Math.sin(theta) * r * 0.9;
        z = (Math.random() - 0.5) * 0.08;
      } else if (i < 1050) {
        // Superior and Inferior vascular branches
        const t = (i - 350) / 700;
        const branchAngle = (Math.floor(i / 130) * Math.PI) / 2.5 + (Math.random() - 0.5) * 0.25;
        const radius = 0.35 + t * 1.45;
        x = Math.cos(branchAngle) * radius + (Math.random() - 0.5) * 0.12;
        y = Math.sin(branchAngle) * radius * 0.85 + (Math.random() - 0.5) * 0.12;
        z = (Math.random() - 0.5) * 0.1;
      } else {
        // Macula & peripheral retina
        const theta = Math.random() * Math.PI * 2;
        const r = 0.2 + Math.sqrt(Math.random()) * 1.55;
        x = Math.cos(theta) * r;
        y = Math.sin(theta) * r * 0.95;
        z = (Math.random() - 0.5) * 0.15;
      }

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      origPositions[idx] = x;
      origPositions[idx + 1] = y;
      origPositions[idx + 2] = z;

      // Color assignment: Cyan + Coral/Amber lesion points
      const pickColor = i % 5 === 0 ? cCoral : i % 7 === 0 ? cAmber : cCyan;
      colors[idx] = pickColor.r;
      colors[idx + 1] = pickColor.g;
      colors[idx + 2] = pickColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending, // Glowing sci-fi aesthetic
    });

    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Build the Futuristic Bloch Sphere
    const blochGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(1.25, 28, 20);
    const sphereWire = new THREE.WireframeGeometry(sphereGeo);
    const sphereLine = new THREE.LineSegments(
      sphereWire,
      new THREE.LineBasicMaterial({ color: 0x2F7DF6, transparent: true, opacity: 0.35 })
    );
    blochGroup.add(sphereLine);

    // Glowing coordinate axes
    const axesGeo = new THREE.BufferGeometry();
    const axesPos = new Float32Array([
      -1.5, 0, 0, 1.5, 0, 0,
      0, -1.5, 0, 0, 1.5, 0,
      0, 0, -1.5, 0, 0, 1.5,
    ]);
    axesGeo.setAttribute('position', new THREE.BufferAttribute(axesPos, 3));
    const axesLines = new THREE.LineSegments(
      axesGeo,
      new THREE.LineBasicMaterial({ color: 0x00F5D4, transparent: true, opacity: 0.5 })
    );
    blochGroup.add(axesLines);

    // Cyan & Violet Entangling Torus Rings
    const ringGeo = new THREE.TorusGeometry(1.28, 0.015, 12, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00F5D4, wireframe: true });
    const cnotRing = new THREE.Mesh(ringGeo, ringMat);
    cnotRing.rotation.x = Math.PI / 2;
    blochGroup.add(cnotRing);
    ringRef.current = cnotRing;

    const ringGeo2 = new THREE.TorusGeometry(1.28, 0.015, 12, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8A2BE2, wireframe: true });
    const cnotRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    cnotRing2.rotation.y = Math.PI / 2;
    blochGroup.add(cnotRing2);

    // 4 Qubit Vector Arrows (|psi_0> to |psi_3>)
    const qubitVectors = [];
    const baseAngles = [-0.62, 1.25, -1.88, 2.44];
    for (let q = 0; q < 4; q++) {
      const arrowGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.25, 8);
      const arrowMat = new THREE.MeshBasicMaterial({ color: q % 2 === 0 ? 0x00F5D4 : 0x8A2BE2 });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.y = 0.625;
      const arrowPivot = new THREE.Group();
      arrowPivot.add(arrow);
      arrowPivot.rotation.z = baseAngles[q];
      arrowPivot.rotation.y = (q * Math.PI) / 2;
      blochGroup.add(arrowPivot);
      qubitVectors.push(arrowPivot);
    }

    blochGroup.visible = false;
    scene.add(blochGroup);
    blochRef.current = blochGroup;

    // 4 Target Coordinates for Autoencoder Latent Collapse
    const angleTargets = [
      new THREE.Vector3(-1.0, 0.7, 0),
      new THREE.Vector3(1.0, 0.7, 0),
      new THREE.Vector3(-1.0, -0.7, 0),
      new THREE.Vector3(1.0, -0.7, 0),
    ];

    let currentP = 0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      currentP += (targetProgress.current - currentP) * 0.08;

      const posAttr = particles.geometry.attributes.position;
      const colAttr = particles.geometry.attributes.color;
      const pArr = posAttr.array;
      const cArr = colAttr.array;

      const time = performance.now() * 0.001;

      if (currentP < 0.65) {
        particles.visible = true;
        blochGroup.visible = false;
        particles.rotation.y = time * 0.12 + currentP * 0.8;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i * 3;
          const origX = origPositions[idx];
          const origY = origPositions[idx + 1];
          const origZ = origPositions[idx + 2];

          if (currentP < 0.2) {
            // Stage 1: Raw Retinal Scanning (Cyan & Coral Glow)
            pArr[idx] = origX + Math.sin(time + i) * 0.006;
            pArr[idx + 1] = origY + Math.cos(time + i) * 0.006;
            pArr[idx + 2] = origZ;
          } else if (currentP < 0.4) {
            // Stage 2: Green-Channel Spectral Focus (Shift to Pure Cyan)
            const t = (currentP - 0.2) / 0.2;
            pArr[idx] = origX;
            pArr[idx + 1] = origY;
            pArr[idx + 2] = origZ;

            cArr[idx] = THREE.MathUtils.lerp(cArr[idx], cCyan.r, t * 0.1);
            cArr[idx + 1] = THREE.MathUtils.lerp(cArr[idx + 1], cCyan.g, t * 0.1);
            cArr[idx + 2] = THREE.MathUtils.lerp(cArr[idx + 2], cCyan.b, t * 0.1);
          } else if (currentP < 0.58) {
            // Stage 3: Autoencoder Latent Dissolution into 3D Cloud
            const t = (currentP - 0.4) / 0.18;
            const noiseFactor = Math.sin(i * 13.7 + time) * 1.3 * t;
            pArr[idx] = origX * (1 - t * 0.5) + Math.cos(i) * noiseFactor * 0.75;
            pArr[idx + 1] = origY * (1 - t * 0.5) + Math.sin(i) * noiseFactor * 0.75;
            pArr[idx + 2] = origZ + Math.sin(i * 3.3) * noiseFactor * 0.95;

            cArr[idx] = THREE.MathUtils.lerp(cCyan.r, cViolet.r, t);
            cArr[idx + 1] = THREE.MathUtils.lerp(cCyan.g, cViolet.g, t);
            cArr[idx + 2] = THREE.MathUtils.lerp(cCyan.b, cViolet.b, t);
          } else {
            // Stage 4: Collapse into 4 glowing quantum rotation angles
            const t = (currentP - 0.58) / 0.14;
            const target = angleTargets[i % 4];
            pArr[idx] = THREE.MathUtils.lerp(pArr[idx], target.x + (Math.random() - 0.5) * 0.08, t * 0.25);
            pArr[idx + 1] = THREE.MathUtils.lerp(pArr[idx + 1], target.y + (Math.random() - 0.5) * 0.08, t * 0.25);
            pArr[idx + 2] = THREE.MathUtils.lerp(pArr[idx + 2], target.z, t * 0.25);

            cArr[idx] = cCyan.r;
            cArr[idx + 1] = cCyan.g;
            cArr[idx + 2] = cCyan.b;
          }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      } else {
        // Stage 5 & 6: The Bloch Sphere & Quantum CNOT Rings
        particles.visible = false;
        blochGroup.visible = true;

        blochGroup.rotation.y = time * 0.45 + (currentP - 0.65) * 2.2;
        blochGroup.rotation.x = Math.sin(time * 0.25) * 0.18 + (currentP - 0.65) * 0.5;

        cnotRing.rotation.z = time * 1.8;
        cnotRing2.rotation.x = time * -1.4;

        qubitVectors.forEach((qv, qIdx) => {
          const dynamicAngle = baseAngles[qIdx] + Math.sin(time + qIdx) * 0.18 * (1 - (currentP - 0.85));
          qv.rotation.z = dynamicAngle;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      pMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full relative" />;
}

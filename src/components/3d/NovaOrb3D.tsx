import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NovaOrb3DProps {
  size?: number;
  state?: 'idle' | 'listening' | 'speaking' | 'pulsing';
  interactive?: boolean;
}

export const NovaOrb3D: React.FC<NovaOrb3DProps> = ({
  size = 140,
  state = 'idle',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for rotation
    const group = new THREE.Group();
    scene.add(group);

    // Core Glowing Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0xA97AFF),
      emissive: new THREE.Color(0x3DDEE4),
      emissiveIntensity: 0.6,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(coreSphere);

    // Outer Geometric Wireframe Lattice
    const icosaGeo = new THREE.IcosahedronGeometry(1.25, 2);
    const icosaMat = new THREE.MeshBasicMaterial({
      color: 0xC6A9FF,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(icosaGeo, icosaMat);
    group.add(wireMesh);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0x221144, 1.5);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0xA97AFF, 3, 10);
    purpleLight.position.set(2, 2, 2);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x3DDEE4, 3, 10);
    cyanLight.position.set(-2, -2, 2);
    scene.add(cyanLight);

    // Particle Ring
    const particleCount = 45;
    const ringGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2;
      const radius = 1.5 + (Math.random() * 0.2);
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    ringGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x3DDEE4,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
    });
    const particleRing = new THREE.Points(ringGeo, particleMat);
    group.add(particleRing);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // State-based reactivity
      let speed = 0.8;
      let pulseAmp = 0.05;

      if (state === 'speaking') {
        speed = 2.5;
        pulseAmp = 0.15;
      } else if (state === 'listening') {
        speed = 1.6;
        pulseAmp = 0.1;
      }

      // Rotations
      group.rotation.y = elapsedTime * 0.5 * speed;
      group.rotation.x = Math.sin(elapsedTime * 0.3 * speed) * 0.2;
      wireMesh.rotation.y = -elapsedTime * 0.3 * speed;
      particleRing.rotation.z = elapsedTime * 0.2 * speed;

      // Breathing / Pulsing Scale
      const scale = 1 + Math.sin(elapsedTime * 2 * speed) * pulseAmp;
      coreSphere.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size, state]);

  return (
    <div
      ref={mountRef}
      className={`inline-flex items-center justify-center relative cursor-pointer ${
        interactive ? 'hover:scale-105 transition-transform duration-300' : ''
      }`}
      style={{ width: size, height: size }}
    />
  );
};

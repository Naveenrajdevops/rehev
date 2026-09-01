import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Landmark3D } from '../../types';
import { POSE_CONNECTIONS } from '../../services/poseService';

interface LivePose3DProps {
  landmarks: Landmark3D[];
  confidence: number;
}

export const LivePose3D: React.FC<LivePose3DProps> = ({ landmarks, confidence }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const jointMeshesRef = useRef<THREE.Mesh[]>([]);
  const boneLinesRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 360;
    const height = mount.clientHeight || 360;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Coordinate grid
    const grid = new THREE.GridHelper(2.5, 10, 0xA97AFF, 0x1A1938);
    grid.position.y = -1.2;
    scene.add(grid);

    // Lights
    const amb = new THREE.AmbientLight(0xFFFFFF, 1.2);
    scene.add(amb);
    const light1 = new THREE.DirectionalLight(0x3DDEE4, 2);
    light1.position.set(2, 3, 2);
    scene.add(light1);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Create 33 sphere meshes for landmarks
    const jointGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x43E6A0, roughness: 0.2 });

    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < 33; i++) {
      const mesh = new THREE.Mesh(jointGeo, jointMat.clone());
      mesh.visible = false;
      group.add(mesh);
      meshes.push(mesh);
    }
    jointMeshesRef.current = meshes;

    // Bone Line Segments
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(POSE_CONNECTIONS.length * 2 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xA97AFF, linewidth: 2 });
    const boneLines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(boneLines);
    boneLinesRef.current = boneLines;

    // Mouse drag rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      groupRef.current.rotation.y += dx * 0.01;
      groupRef.current.rotation.x += dy * 0.01;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging && groupRef.current) {
        groupRef.current.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update positions on new landmarks
  useEffect(() => {
    if (!landmarks || landmarks.length < 33 || !groupRef.current) return;

    const meshes = jointMeshesRef.current;
    const boneLines = boneLinesRef.current;

    // Update Joints
    for (let i = 0; i < 33; i++) {
      const lm = landmarks[i];
      const mesh = meshes[i];
      if (!mesh) continue;

      if ((lm.visibility || 1) > 0.4) {
        mesh.visible = true;
        // Transform MediaPipe normalized coordinates (x: 0..1, y: 0..1, z: ~0) into 3D world space
        const wx = (lm.x - 0.5) * -2.2;
        const wy = -(lm.y - 0.5) * 2.2;
        const wz = -(lm.z || 0) * 2.2;
        mesh.position.set(wx, wy, wz);

        // Color based on confidence/problem indicator
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (confidence < 0.6) {
          mat.color.setHex(0xFF6C84); // Red warning
        } else if ([25, 26, 23, 24].includes(i)) {
          mat.color.setHex(0x3DDEE4); // Cyan key joints
        } else {
          mat.color.setHex(0x43E6A0); // Green
        }
      } else {
        mesh.visible = false;
      }
    }

    // Update Bone Lines
    if (boneLines) {
      const posAttr = boneLines.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      let idx = 0;

      for (const [a, b] of POSE_CONNECTIONS) {
        const l1 = landmarks[a];
        const l2 = landmarks[b];

        if ((l1.visibility || 1) > 0.4 && (l2.visibility || 1) > 0.4) {
          arr[idx++] = (l1.x - 0.5) * -2.2;
          arr[idx++] = -(l1.y - 0.5) * 2.2;
          arr[idx++] = -(l1.z || 0) * 2.2;

          arr[idx++] = (l2.x - 0.5) * -2.2;
          arr[idx++] = -(l2.y - 0.5) * 2.2;
          arr[idx++] = -(l2.z || 0) * 2.2;
        } else {
          // Zero out if occluded
          for (let k = 0; k < 6; k++) arr[idx++] = 0;
        }
      }
      posAttr.needsUpdate = true;
    }
  }, [landmarks, confidence]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-panel border border-bg-border/60">
      <div className="absolute top-3 left-4 z-10 flex items-center justify-between w-[92%] pointer-events-none">
        <span className="text-xs font-semibold text-rehab-purpleLight tracking-wider uppercase bg-bg-dark/80 px-2.5 py-1 rounded-full border border-bg-border">
          Spatial 3D Skeleton (Drag to Rotate)
        </span>
        <span className="text-[11px] text-slate-400">
          Tracking: {confidence > 0.65 ? 'Optimal' : 'Occluded'}
        </span>
      </div>
      <div ref={mountRef} className="w-full h-full min-h-[340px] cursor-grab active:cursor-grabbing" />
    </div>
  );
};

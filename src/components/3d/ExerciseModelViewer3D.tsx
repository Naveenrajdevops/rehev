import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Exercise } from '../../types';

interface ExerciseModelViewer3DProps {
  exercise: Exercise;
  height?: number;
}

export const ExerciseModelViewer3D: React.FC<ExerciseModelViewer3DProps> = ({
  exercise,
  height = 320,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Subtle grid platform
    const grid = new THREE.GridHelper(3, 12, 0xA97AFF, 0x1A1938);
    grid.position.y = -1.5;
    scene.add(grid);

    // Lights
    const ambLight = new THREE.AmbientLight(0x332255, 1.8);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0x3DDEE4, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xA97AFF, 2, 10);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    // Anatomical Skeleton Structure
    const skeletonGroup = new THREE.Group();
    scene.add(skeletonGroup);

    // Materials
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0x5C9EFF,
      roughness: 0.3,
      metalness: 0.2,
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x3DDEE4,
      emissive: 0x114455,
      roughness: 0.2,
    });
    const highlightJointMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFC45A,
      emissive: 0xFF6C84,
      emissiveIntensity: 0.5,
      roughness: 0.1,
    });

    const createJoint = (isTarget = false) => {
      const geo = new THREE.SphereGeometry(0.08, 16, 16);
      return new THREE.Mesh(geo, isTarget ? highlightJointMaterial : jointMaterial);
    };

    const createBone = (length = 0.6) => {
      const geo = new THREE.CylinderGeometry(0.035, 0.035, length, 12);
      return new THREE.Mesh(geo, boneMaterial);
    };

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xDCCBFF, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.25;
    skeletonGroup.add(head);

    // Spine
    const spine = createBone(0.65);
    spine.position.y = 0.75;
    skeletonGroup.add(spine);

    // Pelvis
    const pelvis = createJoint(false);
    pelvis.position.y = 0.4;
    skeletonGroup.add(pelvis);

    // Shoulders
    const shoulderBar = createBone(0.7);
    shoulderBar.rotation.z = Math.PI / 2;
    shoulderBar.position.y = 1.05;
    skeletonGroup.add(shoulderBar);

    // Left & Right Shoulder Joints
    const leftShoulder = createJoint(exercise.target_joints.includes('left_shoulder'));
    leftShoulder.position.set(-0.35, 1.05, 0);
    skeletonGroup.add(leftShoulder);

    const rightShoulder = createJoint(exercise.target_joints.includes('right_shoulder'));
    rightShoulder.position.set(0.35, 1.05, 0);
    skeletonGroup.add(rightShoulder);

    // Left Arm Hierarchy
    const leftUpperArm = new THREE.Group();
    leftUpperArm.position.set(-0.35, 1.05, 0);
    const lUpperBone = createBone(0.45);
    lUpperBone.position.y = -0.225;
    leftUpperArm.add(lUpperBone);
    const leftElbow = createJoint(exercise.target_joints.includes('left_elbow'));
    leftElbow.position.y = -0.45;
    leftUpperArm.add(leftElbow);

    const leftForearm = new THREE.Group();
    leftForearm.position.y = -0.45;
    const lForeBone = createBone(0.4);
    lForeBone.position.y = -0.2;
    leftForearm.add(lForeBone);
    leftUpperArm.add(leftForearm);
    skeletonGroup.add(leftUpperArm);

    // Right Arm Hierarchy
    const rightUpperArm = new THREE.Group();
    rightUpperArm.position.set(0.35, 1.05, 0);
    const rUpperBone = createBone(0.45);
    rUpperBone.position.y = -0.225;
    rightUpperArm.add(rUpperBone);
    const rightElbow = createJoint(exercise.target_joints.includes('right_elbow'));
    rightElbow.position.y = -0.45;
    rightUpperArm.add(rightElbow);

    const rightForearm = new THREE.Group();
    rightForearm.position.y = -0.45;
    const rForeBone = createBone(0.4);
    rForeBone.position.y = -0.2;
    rightForearm.add(rForeBone);
    rightUpperArm.add(rightForearm);
    skeletonGroup.add(rightUpperArm);

    // Left Leg Hierarchy
    const leftThigh = new THREE.Group();
    leftThigh.position.set(-0.2, 0.4, 0);
    const lThighBone = createBone(0.6);
    lThighBone.position.y = -0.3;
    leftThigh.add(lThighBone);
    const leftKnee = createJoint(exercise.target_joints.includes('left_knee'));
    leftKnee.position.y = -0.6;
    leftThigh.add(leftKnee);

    const leftShin = new THREE.Group();
    leftShin.position.y = -0.6;
    const lShinBone = createBone(0.55);
    lShinBone.position.y = -0.275;
    leftShin.add(lShinBone);
    const leftAnkle = createJoint(exercise.target_joints.includes('left_ankle'));
    leftAnkle.position.y = -0.55;
    leftShin.add(leftAnkle);
    leftThigh.add(leftShin);
    skeletonGroup.add(leftThigh);

    // Right Leg Hierarchy
    const rightThigh = new THREE.Group();
    rightThigh.position.set(0.2, 0.4, 0);
    const rThighBone = createBone(0.6);
    rThighBone.position.y = -0.3;
    rightThigh.add(rThighBone);
    const rightKnee = createJoint(exercise.target_joints.includes('right_knee'));
    rightKnee.position.y = -0.6;
    rightThigh.add(rightKnee);

    const rightShin = new THREE.Group();
    rightShin.position.y = -0.6;
    const rShinBone = createBone(0.55);
    rShinBone.position.y = -0.275;
    rightShin.add(rShinBone);
    const rightAnkle = createJoint(exercise.target_joints.includes('right_ankle'));
    rightAnkle.position.y = -0.55;
    rightShin.add(rightAnkle);
    rightThigh.add(rightShin);
    skeletonGroup.add(rightThigh);

    // Animation loop based on exercise kinematics
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime() * 1.8;
      const cycle = (Math.sin(t) + 1) / 2; // 0 to 1

      skeletonGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.25;

      // Animate joints based on specific exercise
      if (exercise.id === 'squat-rehab' || exercise.id === 'sit-to-stand') {
        const squatDepth = cycle * 0.45;
        skeletonGroup.position.y = -squatDepth;
        leftThigh.rotation.x = -cycle * 1.1;
        rightThigh.rotation.x = -cycle * 1.1;
        leftShin.rotation.x = cycle * 1.5;
        rightShin.rotation.x = cycle * 1.5;
        spine.rotation.x = cycle * 0.35;
      } else if (exercise.id === 'bicep-curl') {
        leftForearm.rotation.x = cycle * 2.2;
        rightForearm.rotation.x = cycle * 2.2;
      } else if (exercise.id === 'shoulder-raise') {
        leftUpperArm.rotation.z = -cycle * 1.6;
        rightUpperArm.rotation.z = cycle * 1.6;
      } else if (exercise.id === 'knee-flexion') {
        rightShin.rotation.x = cycle * 1.8;
      } else if (exercise.id === 'leg-raise') {
        rightThigh.rotation.x = -cycle * 0.9;
        rightShin.rotation.x = 0;
      } else if (exercise.id === 'calf-raise') {
        skeletonGroup.position.y = cycle * 0.2;
      } else {
        // Default gentle sway
        leftThigh.rotation.x = Math.sin(t) * 0.3;
        rightThigh.rotation.x = -Math.sin(t) * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [exercise, height]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden glass-card p-2">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rehab-cyan animate-ping" />
        <span className="text-xs font-semibold text-rehab-cyan tracking-wider uppercase">
          3D Biomechanical Kinematics
        </span>
      </div>
      <div className="absolute bottom-3 right-4 z-10 text-[11px] text-slate-400 bg-bg-dark/80 px-2.5 py-1 rounded-full border border-bg-border">
        Target ROM: {exercise.target_rom_min}° – {exercise.target_rom_max}°
      </div>
      <div ref={mountRef} style={{ width: '100%', height }} />
    </div>
  );
};

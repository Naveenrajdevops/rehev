import { Landmark3D } from '../types';

/**
 * Generates realistic 33-point MediaPipe landmark stream simulating
 * an anatomical human performing a squat or arm flexion repetition cycle.
 * @param t Time in seconds
 * @param exerciseId The exercise being simulated
 */
export function generateSimulatedLandmarks(t: number, exerciseId: string): { landmarks: Landmark3D[]; confidence: number } {
  // Movement cycle frequency (approx 3.0 seconds per rep)
  const cycle = (Math.sin(t * 2.1) + 1) / 2; // 0 to 1

  const landmarks: Landmark3D[] = [];

  // Base upright posture landmarks (normalized 0 to 1)
  const baseY = 0.5;

  // Squat simulation adjustments
  let hipDrop = 0;
  let kneeBend = 0;
  let elbowBend = 0;
  let shoulderRaise = 0;

  if (['squat-rehab', 'sit-to-stand', 'knee-flexion'].includes(exerciseId)) {
    hipDrop = cycle * 0.18;
    kneeBend = cycle * 0.22;
  } else if (exerciseId === 'bicep-curl') {
    elbowBend = cycle * 0.25;
  } else if (exerciseId === 'shoulder-raise') {
    shoulderRaise = cycle * 0.35;
  }

  // 0-10: Face
  for (let i = 0; i <= 10; i++) {
    landmarks.push({
      x: 0.5 + ((i % 3 - 1) * 0.02),
      y: 0.15 + hipDrop * 0.8 + (i * 0.005),
      z: 0.0,
      visibility: 0.98
    });
  }

  // 11: Left Shoulder, 12: Right Shoulder
  landmarks[11] = { x: 0.42 - shoulderRaise * 0.2, y: 0.28 + hipDrop * 0.8 - shoulderRaise * 0.1, z: 0.0, visibility: 0.96 };
  landmarks[12] = { x: 0.58 + shoulderRaise * 0.2, y: 0.28 + hipDrop * 0.8 - shoulderRaise * 0.1, z: 0.0, visibility: 0.96 };

  // 13: Left Elbow, 14: Right Elbow
  landmarks[13] = { x: 0.38 - shoulderRaise * 0.3, y: 0.42 + hipDrop * 0.8 - shoulderRaise * 0.3, z: -elbowBend * 0.1, visibility: 0.95 };
  landmarks[14] = { x: 0.62 + shoulderRaise * 0.3, y: 0.42 + hipDrop * 0.8 - shoulderRaise * 0.3, z: -elbowBend * 0.1, visibility: 0.95 };

  // 15: Left Wrist, 16: Right Wrist
  landmarks[15] = { x: 0.37 - shoulderRaise * 0.3, y: 0.56 + hipDrop * 0.8 - elbowBend * 0.35 - shoulderRaise * 0.4, z: -elbowBend * 0.2, visibility: 0.94 };
  landmarks[16] = { x: 0.63 + shoulderRaise * 0.3, y: 0.56 + hipDrop * 0.8 - elbowBend * 0.35 - shoulderRaise * 0.4, z: -elbowBend * 0.2, visibility: 0.94 };

  // 17-22: Hands
  for (let i = 17; i <= 22; i++) {
    const isLeft = i % 2 !== 0;
    landmarks[i] = {
      x: isLeft ? 0.36 : 0.64,
      y: 0.60 + hipDrop * 0.8 - elbowBend * 0.35,
      z: 0.0,
      visibility: 0.9
    };
  }

  // 23: Left Hip, 24: Right Hip
  landmarks[23] = { x: 0.44, y: 0.50 + hipDrop, z: -0.05, visibility: 0.97 };
  landmarks[24] = { x: 0.56, y: 0.50 + hipDrop, z: -0.05, visibility: 0.97 };

  // 25: Left Knee, 26: Right Knee
  landmarks[25] = { x: 0.42 - kneeBend * 0.1, y: 0.70 + hipDrop * 0.5, z: kneeBend * 0.3, visibility: 0.96 };
  landmarks[26] = { x: 0.58 + kneeBend * 0.1, y: 0.70 + hipDrop * 0.5, z: kneeBend * 0.3, visibility: 0.96 };

  // 27: Left Ankle, 28: Right Ankle
  landmarks[27] = { x: 0.43, y: 0.90, z: 0.0, visibility: 0.95 };
  landmarks[28] = { x: 0.57, y: 0.90, z: 0.0, visibility: 0.95 };

  // 29: Left Heel, 30: Right Heel
  landmarks[29] = { x: 0.42, y: 0.92, z: 0.05, visibility: 0.92 };
  landmarks[30] = { x: 0.58, y: 0.92, z: 0.05, visibility: 0.92 };

  // 31: Left Foot Index, 32: Right Foot Index
  landmarks[31] = { x: 0.43, y: 0.94, z: -0.1, visibility: 0.94 };
  landmarks[32] = { x: 0.57, y: 0.94, z: -0.1, visibility: 0.94 };

  return {
    landmarks,
    confidence: 0.96
  };
}

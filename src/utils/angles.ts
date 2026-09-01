import { Landmark3D, JointAngles } from '../types';

/**
 * Calculates 3D interior joint angle at vertex B formed by points A - B - C
 * Returns angle in degrees [0° - 180°]
 */
export function calculateJointAngle(a: Landmark3D, b: Landmark3D, c: Landmark3D): number {
  if (!a || !b || !c) return 0;

  // Vector BA
  const v1 = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: (a.z || 0) - (b.z || 0)
  };

  // Vector BC
  const v2 = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: (c.z || 0) - (b.z || 0)
  };

  // Dot product
  const dot = (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);

  // Magnitudes
  const mag1 = Math.sqrt((v1.x * v1.x) + (v1.y * v1.y) + (v1.z * v1.z));
  const mag2 = Math.sqrt((v2.x * v2.x) + (v2.y * v2.y) + (v2.z * v2.z));

  if (mag1 === 0 || mag2 === 0) return 0;

  // Cosine clamped to [-1, 1] to prevent NaN
  let cosTheta = dot / (mag1 * mag2);
  cosTheta = Math.max(-1.0, Math.min(1.0, cosTheta));

  const angleRadians = Math.acos(cosTheta);
  return Math.round((angleRadians * (180.0 / Math.PI)) * 10) / 10;
}

/**
 * Extracts 10 bilateral joint angles from standard MediaPipe 33-landmark array
 */
export function computeAllJointAngles(landmarks: Landmark3D[]): JointAngles {
  const defaultAngles: JointAngles = {
    left_knee: 180,
    right_knee: 180,
    left_hip: 180,
    right_hip: 180,
    left_ankle: 90,
    right_ankle: 90,
    left_elbow: 180,
    right_elbow: 180,
    left_shoulder: 0,
    right_shoulder: 0
  };

  if (!landmarks || landmarks.length < 33) {
    return defaultAngles;
  }

  // MediaPipe Landmark Indices:
  // 11: Left Shoulder, 12: Right Shoulder
  // 13: Left Elbow,    14: Right Elbow
  // 15: Left Wrist,    16: Right Wrist
  // 23: Left Hip,      24: Right Hip
  // 25: Left Knee,     26: Right Knee
  // 27: Left Ankle,    28: Right Ankle
  // 31: Left FootIdx,  32: Right FootIdx

  const ls = landmarks[11];
  const rs = landmarks[12];
  const le = landmarks[13];
  const re = landmarks[14];
  const lw = landmarks[15];
  const rw = landmarks[16];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const lk = landmarks[25];
  const rk = landmarks[26];
  const la = landmarks[27];
  const ra = landmarks[28];
  const lf = landmarks[31];
  const rf = landmarks[32];

  // Knee angle (Hip - Knee - Ankle)
  const left_knee = calculateJointAngle(lh, lk, la);
  const right_knee = calculateJointAngle(rh, rk, ra);

  // Hip angle (Shoulder - Hip - Knee)
  const left_hip = calculateJointAngle(ls, lh, lk);
  const right_hip = calculateJointAngle(rs, rh, rk);

  // Ankle angle (Knee - Ankle - Foot Index)
  const left_ankle = calculateJointAngle(lk, la, lf);
  const right_ankle = calculateJointAngle(rk, ra, rf);

  // Elbow angle (Shoulder - Elbow - Wrist)
  const left_elbow = calculateJointAngle(ls, le, lw);
  const right_elbow = calculateJointAngle(rs, re, rw);

  // Shoulder angle (Hip - Shoulder - Elbow)
  const left_shoulder = calculateJointAngle(lh, ls, le);
  const right_shoulder = calculateJointAngle(rh, rs, re);

  return {
    left_knee: left_knee || 180,
    right_knee: right_knee || 180,
    left_hip: left_hip || 180,
    right_hip: right_hip || 180,
    left_ankle: left_ankle || 90,
    right_ankle: right_ankle || 90,
    left_elbow: left_elbow || 180,
    right_elbow: right_elbow || 180,
    left_shoulder: left_shoulder || 0,
    right_shoulder: right_shoulder || 0
  };
}

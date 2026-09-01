import { JointAngles, SymmetryMetric, Exercise } from '../types';

export function calculateBilateralSymmetry(angles: JointAngles, exercise: Exercise): SymmetryMetric {
  let leftAngle = 180;
  let rightAngle = 180;

  // Determine relevant joint pair based on exercise
  if (['squat-rehab', 'knee-flexion', 'knee-extension', 'sit-to-stand', 'balance'].includes(exercise.id)) {
    leftAngle = angles.left_knee;
    rightAngle = angles.right_knee;
  } else if (['bicep-curl'].includes(exercise.id)) {
    leftAngle = angles.left_elbow;
    rightAngle = angles.right_elbow;
  } else if (['shoulder-raise', 'posture-correction'].includes(exercise.id)) {
    leftAngle = angles.left_shoulder;
    rightAngle = angles.right_shoulder;
  } else if (['leg-raise'].includes(exercise.id)) {
    leftAngle = angles.left_hip;
    rightAngle = angles.right_hip;
  } else {
    leftAngle = angles.left_knee;
    rightAngle = angles.right_knee;
  }

  const diff = Math.abs(leftAngle - rightAngle);
  const diffDeg = Math.round(diff * 10) / 10;

  // Calculate percentage: 0° diff = 100%, 15° diff = ~81%, 30°+ diff = <60%
  const penalty = diffDeg * 1.25;
  const score = Math.max(40, Math.min(100, Math.round(100 - penalty)));

  let dominantSide: 'Left' | 'Right' | 'Equal' = 'Equal';
  if (leftAngle > rightAngle + 3) dominantSide = 'Left';
  else if (rightAngle > leftAngle + 3) dominantSide = 'Right';

  let observation = "Balanced bilateral symmetry.";
  if (diffDeg < 5.0) {
    observation = "Optimal bilateral balance (within 5° variance).";
  } else if (diffDeg < 12.0) {
    observation = `Mild ${dominantSide} side asymmetry (${diffDeg}° variance). Maintain equal weight distribution.`;
  } else {
    observation = `Noticeable ${dominantSide} side compensation (${diffDeg}° diff). Avoid favoring the unaffected limb.`;
  }

  return {
    symmetryScore: score,
    differenceDegrees: diffDeg,
    dominantSide,
    clinicalObservation: observation
  };
}

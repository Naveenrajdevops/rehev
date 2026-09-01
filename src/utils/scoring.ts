import { QualityMetric, SymmetryMetric, Exercise, RepState } from '../types';

export function calculateMovementQuality(
  repState: RepState,
  symmetry: SymmetryMetric,
  exercise: Exercise,
  poseConfidence: number
): QualityMetric {
  // 1. ROM Factor (Target vs observed)
  const targetRom = exercise.target_rom_max - exercise.target_rom_min;
  const observedRom = repState.currentRom;
  let romRatio = targetRom > 0 ? (observedRom / targetRom) : 1.0;
  romRatio = Math.min(1.15, Math.max(0.3, romRatio));
  const romScore = Math.min(100, Math.round(romRatio * 95));

  // 2. Symmetry Factor
  const symmetryScore = symmetry.symmetryScore;

  // 3. Stability & Pose Confidence Factor
  const stabilityScore = Math.min(100, Math.round(poseConfidence * 100));

  // 4. Tempo Factor (Target cadence is 2.0s - 3.5s per repetition)
  const tempo = repState.tempo;
  let tempoScore = 90;
  if (tempo >= 1.8 && tempo <= 3.8) {
    tempoScore = 98;
  } else if (tempo < 1.4) {
    tempoScore = 75; // Too fast
  } else if (tempo > 4.5) {
    tempoScore = 80; // Extended pause
  }

  // Composite Weighted Score
  // Weights: ROM (30%), Symmetry (25%), Stability/Confidence (20%), Tempo (15%), Consistency (10%)
  const compositeScore = Math.round(
    (romScore * 0.30) +
    (symmetryScore * 0.25) +
    (stabilityScore * 0.20) +
    (tempoScore * 0.15) +
    (92 * 0.10)
  );

  const clampedScore = Math.max(45, Math.min(99, compositeScore));

  // Advisory message
  let advisory = "Smooth, stable repetition form.";
  if (clampedScore >= 90) {
    advisory = "Excellent biomechanical control and target depth.";
  } else if (symmetry.differenceDegrees > 10) {
    advisory = `Attention: ${symmetry.dominantSide} side favoring. Focus on equal bilateral drive.`;
  } else if (tempo < 1.6) {
    advisory = "Tempo too brisk. Slow down the eccentric descent for maximum muscle activation.";
  } else if (romRatio < 0.75) {
    advisory = "Aim for slightly deeper comfortable flexion to meet target ROM.";
  } else if (poseConfidence < 0.7) {
    advisory = "Step slightly back into full camera view for maximum tracking accuracy.";
  }

  return {
    score: clampedScore,
    romFactor: romScore,
    symmetryFactor: symmetryScore,
    stabilityFactor: stabilityScore,
    tempoFactor: tempoScore,
    confidenceFactor: stabilityScore,
    advisory
  };
}

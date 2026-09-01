import { JointAngles, MovementPhase, RepState, Exercise } from '../types';

export class RepetitionEngine {
  private count = 0;
  private phase: MovementPhase = 'REST';
  private currentRom = 0;
  private minAngleObserved = 180;
  private maxAngleObserved = 0;
  private peakFlexionObserved = 0;
  private phaseStartTime = Date.now();
  private repStartTime = Date.now();
  private lastRepCompletedTime = 0;
  private recentTempos: number[] = [];

  // Cooldown in ms to prevent accidental double triggering
  private debounceThresholdMs = 900;

  constructor(private exercise: Exercise) {
    this.reset();
  }

  public setExercise(exercise: Exercise) {
    this.exercise = exercise;
    this.reset();
  }

  public reset() {
    this.count = 0;
    this.phase = 'REST';
    this.currentRom = 0;
    this.minAngleObserved = 180;
    this.maxAngleObserved = 0;
    this.peakFlexionObserved = 0;
    this.phaseStartTime = Date.now();
    this.repStartTime = Date.now();
    this.lastRepCompletedTime = 0;
    this.recentTempos = [];
  }

  /**
   * Evaluates current joint angles against the exercise state machine
   * Returns: { repCompleted: boolean, repData?: any, state: RepState }
   */
  public update(angles: JointAngles): {
    repCompleted: boolean;
    repData?: {
      repNumber: number;
      rom: number;
      duration: number;
      peakFlexion: number;
    };
    state: RepState;
  } {
    const now = Date.now();
    
    // Select primary tracked joint angle for the exercise
    let primaryAngle = 180;
    switch (this.exercise.id) {
      case 'squat-rehab':
      case 'knee-flexion':
      case 'sit-to-stand':
        primaryAngle = (angles.left_knee + angles.right_knee) / 2;
        break;
      case 'knee-extension':
        primaryAngle = Math.max(180 - angles.left_knee, 180 - angles.right_knee);
        break;
      case 'bicep-curl':
        primaryAngle = (angles.left_elbow + angles.right_elbow) / 2;
        break;
      case 'shoulder-raise':
        primaryAngle = (angles.left_shoulder + angles.right_shoulder) / 2;
        break;
      case 'leg-raise':
        primaryAngle = Math.max(angles.left_hip, angles.right_hip);
        break;
      case 'calf-raise':
        primaryAngle = (angles.left_ankle + angles.right_ankle) / 2;
        break;
      default:
        primaryAngle = (angles.left_knee + angles.right_knee) / 2;
    }

    // Track min and max
    if (primaryAngle < this.minAngleObserved) this.minAngleObserved = primaryAngle;
    if (primaryAngle > this.maxAngleObserved) this.maxAngleObserved = primaryAngle;
    
    // Compute current ROM deviation
    this.currentRom = Math.abs(this.maxAngleObserved - this.minAngleObserved);

    let repCompleted = false;
    let completedRepData;

    // State machine logic for flexion-based exercises (e.g. Squats, Curls)
    const isFlexionBased = ['squat-rehab', 'knee-flexion', 'sit-to-stand', 'bicep-curl'].includes(this.exercise.id);

    if (isFlexionBased) {
      // Thresholds: Upright is ~165-180°, Inflection is <115-125°
      const uprightThreshold = 155;
      const inflectionThreshold = 120;

      switch (this.phase) {
        case 'REST':
          if (primaryAngle < uprightThreshold) {
            this.phase = 'ECCENTRIC';
            this.phaseStartTime = now;
            this.repStartTime = now;
            this.minAngleObserved = primaryAngle;
          }
          break;

        case 'ECCENTRIC':
          if (primaryAngle <= inflectionThreshold) {
            this.phase = 'INFLECTION';
            this.phaseStartTime = now;
            this.peakFlexionObserved = 180 - primaryAngle;
          } else if (primaryAngle > uprightThreshold + 10 && (now - this.phaseStartTime > 3000)) {
            // Cancelled attempt, reset to REST
            this.phase = 'REST';
          }
          break;

        case 'INFLECTION':
          if (primaryAngle > inflectionThreshold + 10) {
            this.phase = 'CONCENTRIC';
            this.phaseStartTime = now;
          }
          break;

        case 'CONCENTRIC':
          if (primaryAngle >= uprightThreshold) {
            const timeSinceLastRep = now - this.lastRepCompletedTime;
            const repDuration = (now - this.repStartTime) / 1000;

            if (timeSinceLastRep > this.debounceThresholdMs && repDuration >= 1.0) {
              this.count += 1;
              this.lastRepCompletedTime = now;
              this.recentTempos.push(repDuration);
              if (this.recentTempos.length > 10) this.recentTempos.shift();

              repCompleted = true;
              completedRepData = {
                repNumber: this.count,
                rom: Math.round(this.currentRom),
                duration: Math.round(repDuration * 10) / 10,
                peakFlexion: Math.round(this.peakFlexionObserved)
              };

              // Reset for next repetition
              this.minAngleObserved = 180;
              this.maxAngleObserved = primaryAngle;
            }
            this.phase = 'REST';
          }
          break;
      }
    } else {
      // Extension/Abduction based exercises (e.g. Shoulder Raise, Calf Raise, Leg Raise)
      const restThreshold = 35;
      const peakThreshold = 75;

      switch (this.phase) {
        case 'REST':
          if (primaryAngle > restThreshold) {
            this.phase = 'ECCENTRIC';
            this.phaseStartTime = now;
            this.repStartTime = now;
          }
          break;
        case 'ECCENTRIC':
          if (primaryAngle >= peakThreshold) {
            this.phase = 'INFLECTION';
            this.phaseStartTime = now;
            this.peakFlexionObserved = primaryAngle;
          }
          break;
        case 'INFLECTION':
          if (primaryAngle < peakThreshold - 10) {
            this.phase = 'CONCENTRIC';
            this.phaseStartTime = now;
          }
          break;
        case 'CONCENTRIC':
          if (primaryAngle <= restThreshold) {
            const timeSinceLastRep = now - this.lastRepCompletedTime;
            const repDuration = (now - this.repStartTime) / 1000;

            if (timeSinceLastRep > this.debounceThresholdMs && repDuration >= 1.0) {
              this.count += 1;
              this.lastRepCompletedTime = now;
              this.recentTempos.push(repDuration);

              repCompleted = true;
              completedRepData = {
                repNumber: this.count,
                rom: Math.round(this.currentRom),
                duration: Math.round(repDuration * 10) / 10,
                peakFlexion: Math.round(this.peakFlexionObserved)
              };

              this.minAngleObserved = primaryAngle;
              this.maxAngleObserved = 0;
            }
            this.phase = 'REST';
          }
          break;
      }
    }

    const avgTempo = this.recentTempos.length > 0 
      ? Math.round((this.recentTempos.reduce((a, b) => a + b, 0) / this.recentTempos.length) * 10) / 10 
      : 2.4;

    return {
      repCompleted,
      repData: completedRepData,
      state: {
        count: this.count,
        phase: this.phase,
        currentRom: Math.round(this.currentRom),
        minRom: Math.round(this.minAngleObserved),
        maxRom: Math.round(this.maxAngleObserved),
        tempo: avgTempo,
        phaseStartTime: this.phaseStartTime,
        lastRepCompletedTime: this.lastRepCompletedTime
      }
    };
  }
}

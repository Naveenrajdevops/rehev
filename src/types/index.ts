export type UserRole = 'therapist' | 'patient' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  patient_id?: number;
}

export type PatientStatus = 'Needs Review' | 'Improving' | 'Stable' | 'Excellent';

export interface Patient {
  id: number;
  patient_id_code: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  condition: string;
  affected_side: 'Left' | 'Right' | 'Bilateral' | 'None';
  primary_goal: string;
  status: PatientStatus;
  overall_quality_score: number;
  symmetry_score: number;
  rom_achievement: number;
  adherence_rate: number;
  start_date: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  target_body_part: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  target_joints: string[];
  target_rom_min: number;
  target_rom_max: number;
  target_reps: number;
  target_sets: number;
  rest_seconds: number;
  camera_angle: string;
  purpose: string;
  instructions: string[];
  feedback_rules?: Array<{ rule: string; msg: string }>;
  icon_name: string;
}

export interface PlanExercise {
  id?: number;
  exercise_id: string;
  sets: number;
  reps: number;
  target_rom: number;
  target_quality: number;
  notes?: string;
}

export interface RehabPlan {
  id: number;
  patient_id: number;
  title: string;
  description?: string;
  frequency: string;
  start_date: string;
  status: 'Active' | 'Completed' | 'Paused';
  exercises: PlanExercise[];
}

export interface SessionRepetition {
  id?: number;
  rep_number: number;
  quality_score: number;
  rom_degrees: number;
  symmetry_score: number;
  duration_seconds: number;
  peak_flexion_degrees: number;
  form_notes?: string;
}

export interface Session {
  id: number;
  session_uid: string;
  patient_id: number;
  exercise_id: string;
  date: string;
  duration_seconds: number;
  repetitions_completed: number;
  target_repetitions: number;
  sets_completed: number;
  target_sets: number;
  movement_quality_score: number;
  symmetry_score: number;
  min_rom_degrees: number;
  max_rom_degrees: number;
  avg_rom_degrees: number;
  target_rom_degrees: number;
  average_confidence: number;
  average_tempo_seconds: number;
  ai_feedback_summary?: string;
  therapist_notes?: string;
  completion_status: 'Completed' | 'Paused' | 'Aborted';
  repetitions?: SessionRepetition[];
}

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface JointAngles {
  left_knee: number;
  right_knee: number;
  left_hip: number;
  right_hip: number;
  left_ankle: number;
  right_ankle: number;
  left_elbow: number;
  right_elbow: number;
  left_shoulder: number;
  right_shoulder: number;
  [key: string]: number;
}

export type MovementPhase = 'REST' | 'ECCENTRIC' | 'INFLECTION' | 'CONCENTRIC' | 'COMPLETED';

export interface RepState {
  count: number;
  phase: MovementPhase;
  currentRom: number;
  minRom: number;
  maxRom: number;
  tempo: number;
  phaseStartTime: number;
  lastRepCompletedTime: number;
}

export interface SymmetryMetric {
  symmetryScore: number;
  differenceDegrees: number;
  dominantSide: 'Left' | 'Right' | 'Equal';
  clinicalObservation: string;
}

export interface QualityMetric {
  score: number;
  romFactor: number;
  symmetryFactor: number;
  stabilityFactor: number;
  tempoFactor: number;
  confidenceFactor: number;
  advisory: string;
}

export interface CameraGuidance {
  isFullyVisible: boolean;
  warnings: string[];
  poseConfidence: number;
  fps: number;
}

export interface AIMessage {
  id?: number;
  sender: 'user' | 'nova';
  message: string;
  session_context?: any;
  created_at?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  is_read: boolean;
  created_at?: string;
}

export interface ClinicalReport {
  id: number;
  report_uid: string;
  patient_id: number;
  session_id?: number;
  title: string;
  report_type: string;
  generated_at: string;
  data?: any;
  therapist_notes?: string;
  status: string;
}

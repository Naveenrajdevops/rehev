import { Patient, RehabPlan, Session, NotificationItem, ClinicalReport } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    patient_id_code: "PT-8821",
    name: "Eleanor Vance",
    age: 29,
    gender: "Female",
    phone: "+1 (555) 234-5678",
    email: "eleanor.vance@example.com",
    condition: "Post-op ACL Reconstruction",
    affected_side: "Right",
    primary_goal: "Restore full knee flexion, eliminate valgus collapse, resume running",
    status: "Improving",
    overall_quality_score: 91.2,
    symmetry_score: 93.4,
    rom_achievement: 96.0,
    adherence_rate: 96.5,
    start_date: "2026-08-07T00:00:00Z"
  },
  {
    id: 2,
    patient_id_code: "PT-8822",
    name: "Liam Chen",
    age: 42,
    gender: "Male",
    phone: "+1 (555) 345-6789",
    email: "liam.chen@example.com",
    condition: "Subacromial Shoulder Impingement",
    affected_side: "Left",
    primary_goal: "Pain-free overhead reaching and scapular stability",
    status: "Needs Review",
    overall_quality_score: 76.5,
    symmetry_score: 78.0,
    rom_achievement: 74.0,
    adherence_rate: 72.0,
    start_date: "2026-08-17T00:00:00Z"
  },
  {
    id: 3,
    patient_id_code: "PT-8823",
    name: "Sophia Rodriguez",
    age: 35,
    gender: "Female",
    phone: "+1 (555) 456-7890",
    email: "sophia.r@example.com",
    condition: "Patellofemoral Pain Syndrome",
    affected_side: "Bilateral",
    primary_goal: "Quad strength & pain-free stair descent",
    status: "Stable",
    overall_quality_score: 84.0,
    symmetry_score: 86.5,
    rom_achievement: 88.0,
    adherence_rate: 89.0,
    start_date: "2026-07-30T00:00:00Z"
  },
  {
    id: 4,
    patient_id_code: "PT-8824",
    name: "Arthur Pendelton",
    age: 68,
    gender: "Male",
    phone: "+1 (555) 567-8901",
    email: "arthur.p@example.com",
    condition: "Total Knee Arthroplasty (TKA)",
    affected_side: "Right",
    primary_goal: "Sit-to-stand independence and gait velocity",
    status: "Improving",
    overall_quality_score: 88.0,
    symmetry_score: 90.2,
    rom_achievement: 91.5,
    adherence_rate: 95.0,
    start_date: "2026-08-13T00:00:00Z"
  },
  {
    id: 5,
    patient_id_code: "PT-8825",
    name: "Maya Lin",
    age: 24,
    gender: "Female",
    phone: "+1 (555) 678-9012",
    email: "maya.lin@example.com",
    condition: "Ankle Inversion Sprain Grade II",
    affected_side: "Left",
    primary_goal: "Single leg balance stability and return to soccer",
    status: "Excellent",
    overall_quality_score: 96.0,
    symmetry_score: 95.5,
    rom_achievement: 98.0,
    adherence_rate: 100.0,
    start_date: "2026-07-22T00:00:00Z"
  }
];

export const INITIAL_PLANS: RehabPlan[] = [
  {
    id: 1,
    patient_id: 1,
    title: "ACL Post-Operative Phase II Strengthening",
    description: "Focus on progressive knee flexion ROM, hamstring co-contraction, and symmetrical squat mechanics.",
    frequency: "3x per week",
    start_date: "2026-08-10T00:00:00Z",
    status: "Active",
    exercises: [
      { exercise_id: "squat-rehab", sets: 3, reps: 10, target_rom: 100, target_quality: 88, notes: "Maintain upright chest, avoid valgus twitch" },
      { exercise_id: "knee-flexion", sets: 3, reps: 12, target_rom: 115, target_quality: 90, notes: "Smooth eccentric control" },
      { exercise_id: "sit-to-stand", sets: 3, reps: 10, target_rom: 95, target_quality: 85, notes: "Even weight distribution on heels" },
      { exercise_id: "balance", sets: 3, reps: 5, target_rom: 10, target_quality: 90, notes: "20s holds each side" }
    ]
  }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 1,
    session_uid: "SES-2026-808",
    patient_id: 1,
    exercise_id: "squat-rehab",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration_seconds: 210,
    repetitions_completed: 10,
    target_repetitions: 10,
    sets_completed: 3,
    target_sets: 3,
    movement_quality_score: 94.5,
    symmetry_score: 93.8,
    min_rom_degrees: 44.0,
    max_rom_degrees: 103.5,
    avg_rom_degrees: 96.0,
    target_rom_degrees: 105.0,
    average_confidence: 0.95,
    average_tempo_seconds: 2.4,
    ai_feedback_summary: "Exceptional stability across all 10 repetitions. Bilateral knee deviation was under 3.5°. Range of motion is now within 1.5° of target.",
    therapist_notes: "Patient is ready to increase eccentric loading duration.",
    completion_status: "Completed",
    repetitions: [
      { rep_number: 1, quality_score: 92, rom_degrees: 98, symmetry_score: 91, duration_seconds: 2.5, peak_flexion_degrees: 98, form_notes: "Controlled descent" },
      { rep_number: 2, quality_score: 95, rom_degrees: 102, symmetry_score: 94, duration_seconds: 2.4, peak_flexion_degrees: 102, form_notes: "Optimal depth and cadence" },
      { rep_number: 3, quality_score: 96, rom_degrees: 104, symmetry_score: 95, duration_seconds: 2.3, peak_flexion_degrees: 104, form_notes: "Stable knee tracking" },
      { rep_number: 4, quality_score: 94, rom_degrees: 103, symmetry_score: 93, duration_seconds: 2.4, peak_flexion_degrees: 103, form_notes: "Good lumbar alignment" },
      { rep_number: 5, quality_score: 97, rom_degrees: 105, symmetry_score: 96, duration_seconds: 2.3, peak_flexion_degrees: 105, form_notes: "Target ROM achieved" },
      { rep_number: 6, quality_score: 93, rom_degrees: 101, symmetry_score: 92, duration_seconds: 2.5, peak_flexion_degrees: 101, form_notes: "Smooth return" },
      { rep_number: 7, quality_score: 96, rom_degrees: 104, symmetry_score: 95, duration_seconds: 2.4, peak_flexion_degrees: 104, form_notes: "Balanced weight drive" },
      { rep_number: 8, quality_score: 95, rom_degrees: 103, symmetry_score: 94, duration_seconds: 2.4, peak_flexion_degrees: 103, form_notes: "Consistent tempo" },
      { rep_number: 9, quality_score: 94, rom_degrees: 102, symmetry_score: 93, duration_seconds: 2.5, peak_flexion_degrees: 102, form_notes: "Minor hip fatigue, solid form" },
      { rep_number: 10, quality_score: 93, rom_degrees: 101, symmetry_score: 92, duration_seconds: 2.6, peak_flexion_degrees: 101, form_notes: "Clean finish" }
    ]
  },
  {
    id: 2,
    session_uid: "SES-2026-807",
    patient_id: 1,
    exercise_id: "knee-flexion",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration_seconds: 195,
    repetitions_completed: 12,
    target_repetitions: 12,
    sets_completed: 3,
    target_sets: 3,
    movement_quality_score: 91.0,
    symmetry_score: 92.4,
    min_rom_degrees: 32.0,
    max_rom_degrees: 114.0,
    avg_rom_degrees: 108.0,
    target_rom_degrees: 120.0,
    average_confidence: 0.94,
    average_tempo_seconds: 2.3,
    ai_feedback_summary: "Good active hamstring contraction. Smooth terminal flexion.",
    therapist_notes: "ROM increased by +4° compared with baseline.",
    completion_status: "Completed",
    repetitions: []
  },
  {
    id: 3,
    session_uid: "SES-2026-806",
    patient_id: 1,
    exercise_id: "sit-to-stand",
    date: new Date(Date.now() - 86400000 * 8).toISOString(),
    duration_seconds: 180,
    repetitions_completed: 10,
    target_repetitions: 10,
    sets_completed: 3,
    target_sets: 3,
    movement_quality_score: 88.5,
    symmetry_score: 89.0,
    min_rom_degrees: 35.0,
    max_rom_degrees: 93.0,
    avg_rom_degrees: 88.0,
    target_rom_degrees: 95.0,
    average_confidence: 0.93,
    average_tempo_seconds: 2.7,
    ai_feedback_summary: "Functional weight transfer was symmetrical.",
    therapist_notes: "Advise patient to avoid pushing off with arms.",
    completion_status: "Completed",
    repetitions: []
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: "Plan Assigned", message: "Dr. Marcus Reynolds assigned 'ACL Post-Op Phase II Strengthening'.", type: "info", is_read: false, created_at: "2 hours ago" },
  { id: 2, title: "Milestone Achieved", message: "You reached 95% movement quality in your last squat session!", type: "success", is_read: false, created_at: "1 day ago" },
  { id: 3, title: "Session Reminder", message: "Scheduled rehabilitation workout: Active Knee Flexion today.", type: "info", is_read: true, created_at: "2 days ago" },
  { id: 4, title: "AI Coach Observation", message: "Nova noticed your right knee symmetry improved by +6.2° this week.", type: "alert", is_read: false, created_at: "3 days ago" }
];

export const INITIAL_REPORTS: ClinicalReport[] = [
  {
    id: 1,
    report_uid: "RPT-2026-0801",
    patient_id: 1,
    session_id: 1,
    title: "Kinematic Progress Evaluation — Eleanor Vance",
    report_type: "Session Summary",
    generated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    therapist_notes: "Eleanor has demonstrated consistent compliance and remarkable restoration of terminal knee extension.",
    status: "Ready"
  }
];

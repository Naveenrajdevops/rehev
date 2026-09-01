import { Exercise } from '../types';

export const CLINICAL_EXERCISES: Exercise[] = [
  {
    id: "squat-rehab",
    name: "Squat Rehabilitation",
    category: "Knee & Hip",
    target_body_part: "Quadriceps, Glutes, Hamstrings",
    difficulty: "Beginner",
    target_joints: ["left_knee", "right_knee", "left_hip", "right_hip"],
    target_rom_min: 40.0,
    target_rom_max: 105.0,
    target_reps: 10,
    target_sets: 3,
    rest_seconds: 45,
    camera_angle: "Front or 45° Side View (2.5m - 3m)",
    purpose: "Restores closed-chain knee flexion, pelvic symmetry, and lower extremity eccentric load tolerance.",
    instructions: [
      "Stand upright with feet shoulder-width apart and toes pointed slightly outward.",
      "Hinge at your hips and bend your knees slowly as if lowering onto a chair.",
      "Descend until your knees reach approximately 90-100 degrees of flexion.",
      "Drive through your mid-foot and heels to return smoothly to standing."
    ],
    feedback_rules: [
      { rule: "knee_valgus", msg: "Avoid letting knees collapse inward during descent." },
      { rule: "asymmetry", msg: "Ensure weight is balanced evenly between both legs." }
    ],
    icon_name: "Activity"
  },
  {
    id: "knee-flexion",
    name: "Active Knee Flexion",
    category: "Knee",
    target_body_part: "Hamstrings, Joint Capsule",
    difficulty: "Beginner",
    target_joints: ["left_knee", "right_knee"],
    target_rom_min: 30.0,
    target_rom_max: 120.0,
    target_reps: 12,
    target_sets: 3,
    rest_seconds: 30,
    camera_angle: "Side View (2.5m)",
    purpose: "Isolates active hamstring contraction and increases passive-active knee flexion range post-surgery.",
    instructions: [
      "Stand tall holding a sturdy surface for balance or sit tall in a chair.",
      "Slowly bend the target knee, bringing your heel up toward your glute.",
      "Pause for 1 second at maximum comfortable flexion.",
      "Lower your foot with smooth control to the floor."
    ],
    icon_name: "RotateCcw"
  },
  {
    id: "knee-extension",
    name: "Terminal Knee Extension",
    category: "Knee",
    target_body_part: "Vastus Medialis Oblique (VMO)",
    difficulty: "Beginner",
    target_joints: ["left_knee", "right_knee"],
    target_rom_min: 5.0,
    target_rom_max: 65.0,
    target_reps: 12,
    target_sets: 3,
    rest_seconds: 30,
    camera_angle: "Side View (2.5m)",
    purpose: "Focuses on achieving the final 30 degrees of terminal knee extension and quad lockout.",
    instructions: [
      "Sit with back supported, knees bent at 90 degrees.",
      "Straighten the target knee fully until your leg is parallel to the ground.",
      "Hold the quad contraction for 2 seconds.",
      "Lower slowly back to 90 degrees."
    ],
    icon_name: "Maximize2"
  },
  {
    id: "sit-to-stand",
    name: "Sit-to-Stand Functional Transfer",
    category: "Functional Mobility",
    target_body_part: "Full Lower Chain & Core",
    difficulty: "Intermediate",
    target_joints: ["left_hip", "right_hip", "left_knee", "right_knee"],
    target_rom_min: 35.0,
    target_rom_max: 95.0,
    target_reps: 10,
    target_sets: 3,
    rest_seconds: 60,
    camera_angle: "Front / Diagonal (3m)",
    purpose: "Reinforces daily functional sit-to-stand biomechanics, hip drive, and symmetrical weight distribution.",
    instructions: [
      "Sit near the front edge of a sturdy chair with feet flat on the floor.",
      "Lean torso forward slightly from the hips (nose over toes).",
      "Stand up smoothly without using arm momentum if possible.",
      "Controlled descent back to chair touch."
    ],
    icon_name: "ArrowUpCircle"
  },
  {
    id: "leg-raise",
    name: "Straight Leg Raise",
    category: "Hip & Knee",
    target_body_part: "Iliopsoas, Rectus Femoris",
    difficulty: "Beginner",
    target_joints: ["left_hip", "right_hip", "left_knee"],
    target_rom_min: 10.0,
    target_rom_max: 50.0,
    target_reps: 10,
    target_sets: 3,
    rest_seconds: 45,
    camera_angle: "Side View Floor Level (2.5m)",
    purpose: "Builds quad strength and hip flexor capacity without joint compressive loads.",
    instructions: [
      "Lie flat on your back with unaffected knee bent.",
      "Lock the target knee completely straight.",
      "Raise leg smoothly to about 45 degrees.",
      "Lower under steady control without slamming."
    ],
    icon_name: "TrendingUp"
  },
  {
    id: "bicep-curl",
    name: "Bicep Rehabilitation Curl",
    category: "Elbow & Arm",
    target_body_part: "Biceps Brachii, Brachialis",
    difficulty: "Beginner",
    target_joints: ["left_elbow", "right_elbow"],
    target_rom_min: 30.0,
    target_rom_max: 145.0,
    target_reps: 10,
    target_sets: 3,
    rest_seconds: 30,
    camera_angle: "Front or Side View (2m)",
    purpose: "Restores elbow flexion kinematics, tendon gliding, and upper extremity coordination.",
    instructions: [
      "Stand upright with arms resting at sides.",
      "Curl hands upward toward shoulders, maintaining fixed elbows.",
      "Squeeze at peak flexion.",
      "Lower smoothly to full extension."
    ],
    icon_name: "Zap"
  },
  {
    id: "shoulder-raise",
    name: "Shoulder Abduction & Scapular Raise",
    category: "Shoulder",
    target_body_part: "Deltoids, Supraspinatus, Trapezius",
    difficulty: "Intermediate",
    target_joints: ["left_shoulder", "right_shoulder", "left_elbow", "right_elbow"],
    target_rom_min: 20.0,
    target_rom_max: 120.0,
    target_reps: 10,
    target_sets: 3,
    rest_seconds: 45,
    camera_angle: "Front View (2.5m)",
    purpose: "Enhances glenohumeral mobility, rotator cuff engagement, and scapulothoracic rhythm.",
    instructions: [
      "Stand tall with arms at sides.",
      "Raise arms laterally in the scapular plane up to shoulder height (90-110°).",
      "Maintain soft elbow bend and neck relaxation.",
      "Lower slowly over 3 seconds."
    ],
    icon_name: "MoveUp"
  },
  {
    id: "calf-raise",
    name: "Bilateral & Eccentric Calf Raise",
    category: "Ankle & Calf",
    target_body_part: "Gastrocnemius, Soleus, Achilles",
    difficulty: "Beginner",
    target_joints: ["left_ankle", "right_ankle", "left_knee", "right_knee"],
    target_rom_min: 15.0,
    target_rom_max: 45.0,
    target_reps: 15,
    target_sets: 3,
    rest_seconds: 30,
    camera_angle: "Front/Side Lower Body View (2.5m)",
    purpose: "Strengthens plantarflexors, stabilizes ankle mortise, and restores push-off power.",
    instructions: [
      "Stand balanced on both feet.",
      "Rise up onto the balls of your feet, lifting heels as high as comfortable.",
      "Pause for 1 second at peak height.",
      "Lower heels slowly over 2-3 seconds."
    ],
    icon_name: "ChevronsUp"
  },
  {
    id: "balance",
    name: "Single-Leg Balance & Proprioception",
    category: "Balance",
    target_body_part: "Ankle Stabilizers, Glute Medius",
    difficulty: "Intermediate",
    target_joints: ["left_hip", "right_hip", "left_knee", "right_knee"],
    target_rom_min: 0.0,
    target_rom_max: 20.0,
    target_reps: 5,
    target_sets: 3,
    rest_seconds: 45,
    camera_angle: "Full Body Front View (3m)",
    purpose: "Retrains vestibular, visual, and somatosensory balance pathways post-injury.",
    instructions: [
      "Stand near a support object for safety.",
      "Lift one foot off the ground slightly.",
      "Maintain upright pelvis and minimal sway for 20-30 seconds per repetition.",
      "Switch to contralateral limb."
    ],
    icon_name: "Compass"
  },
  {
    id: "posture-correction",
    name: "Thoracic Extension & Posture Realignment",
    category: "Posture & Spine",
    target_body_part: "Rhomboids, Middle Trapezius, Core",
    difficulty: "Beginner",
    target_joints: ["left_shoulder", "right_shoulder", "left_hip", "right_hip"],
    target_rom_min: 10.0,
    target_rom_max: 40.0,
    target_reps: 8,
    target_sets: 3,
    rest_seconds: 30,
    camera_angle: "Front or Side View (2.5m)",
    purpose: "Reduces forward head posture, opens chest, and aligns shoulder girdle with pelvis.",
    instructions: [
      "Stand or sit tall with neutral spine.",
      "Gently squeeze shoulder blades down and back.",
      "Tuck chin slightly to lengthen the back of the neck.",
      "Hold isometric contraction for 5 seconds and release smoothly."
    ],
    icon_name: "Smile"
  }
];

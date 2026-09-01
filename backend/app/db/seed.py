import os
from datetime import datetime, timedelta
from .database import SessionLocal, engine, Base
from ..api.auth import hash_password
from .models import (
    User, Patient, Therapist, Exercise, RehabPlan, PlanExercise,
    Session, SessionRepetition, Notification, Report, AIMessage
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Exercise).count() > 0:
        print("[*] Database already populated. Skipping seed.")
        db.close()
        return

    print("[*] Seeding database with clinical rehabilitation data...")

    # 1. Seed Exercises (10 Clinical Exercises)
    exercises_data = [
        {
            "id": "squat-rehab",
            "name": "Squat Rehabilitation",
            "category": "Knee & Hip",
            "target_body_part": "Quadriceps, Glutes, Hamstrings",
            "difficulty": "Beginner",
            "target_joints": ["left_knee", "right_knee", "left_hip", "right_hip"],
            "target_rom_min": 40.0,
            "target_rom_max": 105.0,
            "target_reps": 10,
            "target_sets": 3,
            "rest_seconds": 45,
            "camera_angle": "Front or 45° Side View (2.5m - 3m)",
            "purpose": "Restores closed-chain knee flexion, pelvic symmetry, and lower extremity eccentric load tolerance.",
            "instructions": [
                "Stand upright with feet shoulder-width apart and toes pointed slightly outward.",
                "Hinge at your hips and bend your knees slowly as if lowering onto a chair.",
                "Descend until your knees reach approximately 90-100 degrees of flexion.",
                "Drive through your mid-foot and heels to return smoothly to standing."
            ],
            "feedback_rules": [
                {"rule": "knee_valgus", "msg": "Avoid letting knees collapse inward during descent."},
                {"rule": "asymmetry", "msg": "Ensure weight is balanced evenly between both legs."}
            ],
            "icon_name": "Activity"
        },
        {
            "id": "knee-flexion",
            "name": "Active Knee Flexion",
            "category": "Knee",
            "target_body_part": "Hamstrings, Joint Capsule",
            "difficulty": "Beginner",
            "target_joints": ["left_knee", "right_knee"],
            "target_rom_min": 30.0,
            "target_rom_max": 120.0,
            "target_reps": 12,
            "target_sets": 3,
            "rest_seconds": 30,
            "camera_angle": "Side View (2.5m)",
            "purpose": "Isolates active hamstring contraction and increases passive-active knee flexion range post-surgery.",
            "instructions": [
                "Stand tall holding a sturdy surface for balance or sit tall in a chair.",
                "Slowly bend the target knee, bringing your heel up toward your glute.",
                "Pause for 1 second at maximum comfortable flexion.",
                "Lower your foot with smooth control to the floor."
            ],
            "icon_name": "RotateCcw"
        },
        {
            "id": "knee-extension",
            "name": "Terminal Knee Extension",
            "category": "Knee",
            "target_body_part": "Vastus Medialis Oblique (VMO)",
            "difficulty": "Beginner",
            "target_joints": ["left_knee", "right_knee"],
            "target_rom_min": 5.0,
            "target_rom_max": 65.0,
            "target_reps": 12,
            "target_sets": 3,
            "rest_seconds": 30,
            "camera_angle": "Side View (2.5m)",
            "purpose": "Focuses on achieving the final 30 degrees of terminal knee extension and quad lockout.",
            "instructions": [
                "Sit with back supported, knees bent at 90 degrees.",
                "Straighten the target knee fully until your leg is parallel to the ground.",
                "Hold the quad contraction for 2 seconds.",
                "Lower slowly back to 90 degrees."
            ],
            "icon_name": "Maximize2"
        },
        {
            "id": "sit-to-stand",
            "name": "Sit-to-Stand Functional Transfer",
            "category": "Functional Mobility",
            "target_body_part": "Full Lower Chain & Core",
            "difficulty": "Intermediate",
            "target_joints": ["left_hip", "right_hip", "left_knee", "right_knee"],
            "target_rom_min": 35.0,
            "target_rom_max": 95.0,
            "target_reps": 10,
            "target_sets": 3,
            "rest_seconds": 60,
            "camera_angle": "Front / Diagonal (3m)",
            "purpose": "Reinforces daily functional sit-to-stand biomechanics, hip drive, and symmetrical weight distribution.",
            "instructions": [
                "Sit near the front edge of a sturdy chair with feet flat on the floor.",
                "Lean torso forward slightly from the hips (nose over toes).",
                "Stand up smoothly without using arm momentum if possible.",
                "Controlled descent back to chair touch."
            ],
            "icon_name": "ArrowUpCircle"
        },
        {
            "id": "leg-raise",
            "name": "Straight Leg Raise",
            "category": "Hip & Knee",
            "target_body_part": "Iliopsoas, Rectus Femoris",
            "difficulty": "Beginner",
            "target_joints": ["left_hip", "right_hip", "left_knee"],
            "target_rom_min": 10.0,
            "target_rom_max": 50.0,
            "target_reps": 10,
            "target_sets": 3,
            "rest_seconds": 45,
            "camera_angle": "Side View Floor Level (2.5m)",
            "purpose": "Builds quad strength and hip flexor capacity without joint compressive loads.",
            "instructions": [
                "Lie flat on your back with unaffected knee bent.",
                "Lock the target knee completely straight.",
                "Raise leg smoothly to about 45 degrees.",
                "Lower under steady control without slamming."
            ],
            "icon_name": "TrendingUp"
        },
        {
            "id": "bicep-curl",
            "name": "Bicep Rehabilitation Curl",
            "category": "Elbow & Arm",
            "target_body_part": "Biceps Brachii, Brachialis",
            "difficulty": "Beginner",
            "target_joints": ["left_elbow", "right_elbow"],
            "target_rom_min": 30.0,
            "target_rom_max": 145.0,
            "target_reps": 10,
            "target_sets": 3,
            "rest_seconds": 30,
            "camera_angle": "Front or Side View (2m)",
            "purpose": "Restores elbow flexion kinematics, tendon gliding, and upper extremity coordination.",
            "instructions": [
                "Stand upright with arms resting at sides.",
                "Curl hands upward toward shoulders, maintaining fixed elbows.",
                "Squeeze at peak flexion.",
                "Lower smoothly to full extension."
            ],
            "icon_name": "Zap"
        },
        {
            "id": "shoulder-raise",
            "name": "Shoulder Abduction & Scapular Raise",
            "category": "Shoulder",
            "target_body_part": "Deltoids, Supraspinatus, Trapezius",
            "difficulty": "Intermediate",
            "target_joints": ["left_shoulder", "right_shoulder", "left_elbow", "right_elbow"],
            "target_rom_min": 20.0,
            "target_rom_max": 120.0,
            "target_reps": 10,
            "target_sets": 3,
            "rest_seconds": 45,
            "camera_angle": "Front View (2.5m)",
            "purpose": "Enhances glenohumeral mobility, rotator cuff engagement, and scapulothoracic rhythm.",
            "instructions": [
                "Stand tall with arms at sides.",
                "Raise arms laterally in the scapular plane up to shoulder height (90-110°).",
                "Maintain soft elbow bend and neck relaxation.",
                "Lower slowly over 3 seconds."
            ],
            "icon_name": "MoveUp"
        },
        {
            "id": "calf-raise",
            "name": "Bilateral & Eccentric Calf Raise",
            "category": "Ankle & Calf",
            "target_body_part": "Gastrocnemius, Soleus, Achilles",
            "difficulty": "Beginner",
            "target_joints": ["left_ankle", "right_ankle", "left_knee", "right_knee"],
            "target_rom_min": 15.0,
            "target_rom_max": 45.0,
            "target_reps": 15,
            "target_sets": 3,
            "rest_seconds": 30,
            "camera_angle": "Front/Side Lower Body View (2.5m)",
            "purpose": "Strengthens plantarflexors, stabilizes ankle mortise, and restores push-off power.",
            "instructions": [
                "Stand balanced on both feet.",
                "Rise up onto the balls of your feet, lifting heels as high as comfortable.",
                "Pause for 1 second at peak height.",
                "Lower heels slowly over 2-3 seconds."
            ],
            "icon_name": "ChevronsUp"
        },
        {
            "id": "balance",
            "name": "Single-Leg Balance & Proprioception",
            "category": "Balance",
            "target_body_part": "Ankle Stabilizers, Glute Medius",
            "difficulty": "Intermediate",
            "target_joints": ["left_hip", "right_hip", "left_knee", "right_knee"],
            "target_rom_min": 0.0,
            "target_rom_max": 20.0,
            "target_reps": 5,
            "target_sets": 3,
            "rest_seconds": 45,
            "camera_angle": "Full Body Front View (3m)",
            "purpose": "Retrains vestibular, visual, and somatosensory balance pathways post-injury.",
            "instructions": [
                "Stand near a support object for safety.",
                "Lift one foot off the ground slightly.",
                "Maintain upright pelvis and minimal sway for 20-30 seconds per repetition.",
                "Switch to contralateral limb."
            ],
            "icon_name": "Compass"
        },
        {
            "id": "posture-correction",
            "name": "Thoracic Extension & Posture Realignment",
            "category": "Posture & Spine",
            "target_body_part": "Rhomboids, Middle Trapezius, Core",
            "difficulty": "Beginner",
            "target_joints": ["left_shoulder", "right_shoulder", "left_hip", "right_hip"],
            "target_rom_min": 10.0,
            "target_rom_max": 40.0,
            "target_reps": 8,
            "target_sets": 3,
            "rest_seconds": 30,
            "camera_angle": "Front or Side View (2.5m)",
            "purpose": "Reduces forward head posture, opens chest, and aligns shoulder girdle with pelvis.",
            "instructions": [
                "Stand or sit tall with neutral spine.",
                "Gently squeeze shoulder blades down and back.",
                "Tuck chin slightly to lengthen the back of the neck.",
                "Hold isometric contraction for 5 seconds and release smoothly."
            ],
            "icon_name": "Smile"
        }
    ]

    for ex in exercises_data:
        db.add(Exercise(**ex))
    db.commit()

    # 2. Seed Users
    default_pw = hash_password("password123")
    
    therapist_user = User(
        email="therapist@rehabai.io",
        hashed_password=default_pw,
        full_name="Dr. Marcus Reynolds, DPT",
        role="therapist"
    )
    patient_user = User(
        email="patient@rehabai.io",
        hashed_password=default_pw,
        full_name="Eleanor Vance",
        role="patient"
    )
    admin_user = User(
        email="admin@rehabai.io",
        hashed_password=default_pw,
        full_name="Alex Rivera",
        role="admin"
    )
    db.add_all([therapist_user, patient_user, admin_user])
    db.commit()
    db.refresh(therapist_user)
    db.refresh(patient_user)

    # 3. Seed Therapist Profile
    therapist = Therapist(
        user_id=therapist_user.id,
        specialty="Orthopedic & Sports Rehabilitation",
        license_number="PT-CA-994821",
        clinic_name="Precision Kinetic Motion Center"
    )
    db.add(therapist)
    db.commit()
    db.refresh(therapist)

    # 4. Seed Patients
    patients_data = [
        {
            "patient_id_code": "PT-8821",
            "user_id": patient_user.id,
            "therapist_id": therapist.id,
            "name": "Eleanor Vance",
            "age": 29,
            "gender": "Female",
            "phone": "+1 (555) 234-5678",
            "email": "eleanor.vance@example.com",
            "condition": "Post-op ACL Reconstruction",
            "affected_side": "Right",
            "primary_goal": "Restore full knee flexion, eliminate valgus collapse, resume running",
            "status": "Improving",
            "overall_quality_score": 91.2,
            "symmetry_score": 93.4,
            "rom_achievement": 96.0,
            "adherence_rate": 96.5,
            "start_date": datetime.utcnow() - timedelta(days=24)
        },
        {
            "patient_id_code": "PT-8822",
            "therapist_id": therapist.id,
            "name": "Liam Chen",
            "age": 42,
            "gender": "Male",
            "phone": "+1 (555) 345-6789",
            "email": "liam.chen@example.com",
            "condition": "Subacromial Shoulder Impingement",
            "affected_side": "Left",
            "primary_goal": "Pain-free overhead reaching and scapular stability",
            "status": "Needs Review",
            "overall_quality_score": 76.5,
            "symmetry_score": 78.0,
            "rom_achievement": 74.0,
            "adherence_rate": 72.0,
            "start_date": datetime.utcnow() - timedelta(days=14)
        },
        {
            "patient_id_code": "PT-8823",
            "therapist_id": therapist.id,
            "name": "Sophia Rodriguez",
            "age": 35,
            "gender": "Female",
            "phone": "+1 (555) 456-7890",
            "email": "sophia.r@example.com",
            "condition": "Patellofemoral Pain Syndrome",
            "affected_side": "Bilateral",
            "primary_goal": "Quad strength & pain-free stair descent",
            "status": "Stable",
            "overall_quality_score": 84.0,
            "symmetry_score": 86.5,
            "rom_achievement": 88.0,
            "adherence_rate": 89.0,
            "start_date": datetime.utcnow() - timedelta(days=32)
        },
        {
            "patient_id_code": "PT-8824",
            "therapist_id": therapist.id,
            "name": "Arthur Pendelton",
            "age": 68,
            "gender": "Male",
            "phone": "+1 (555) 567-8901",
            "email": "arthur.p@example.com",
            "condition": "Total Knee Arthroplasty (TKA)",
            "affected_side": "Right",
            "primary_goal": "Sit-to-stand independence and gait velocity",
            "status": "Improving",
            "overall_quality_score": 88.0,
            "symmetry_score": 90.2,
            "rom_achievement": 91.5,
            "adherence_rate": 95.0,
            "start_date": datetime.utcnow() - timedelta(days=18)
        },
        {
            "patient_id_code": "PT-8825",
            "therapist_id": therapist.id,
            "name": "Maya Lin",
            "age": 24,
            "gender": "Female",
            "phone": "+1 (555) 678-9012",
            "email": "maya.lin@example.com",
            "condition": "Ankle Inversion Sprain Grade II",
            "affected_side": "Left",
            "primary_goal": "Single leg balance stability and return to soccer",
            "status": "Excellent",
            "overall_quality_score": 96.0,
            "symmetry_score": 95.5,
            "rom_achievement": 98.0,
            "adherence_rate": 100.0,
            "start_date": datetime.utcnow() - timedelta(days=40)
        }
    ]

    created_patients = []
    for p in patients_data:
        pat = Patient(**p)
        db.add(pat)
        created_patients.append(pat)
    db.commit()
    for pat in created_patients:
        db.refresh(pat)

    primary_patient = created_patients[0]

    # 5. Seed Rehab Plan
    plan = RehabPlan(
        patient_id=primary_patient.id,
        title="ACL Post-Operative Phase II Strengthening",
        description="Focus on progressive knee flexion ROM, hamstring co-contraction, and symmetrical squat mechanics.",
        frequency="3x per week"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    plan_exercises = [
        PlanExercise(plan_id=plan.id, exercise_id="squat-rehab", sets=3, reps=10, target_rom=100.0, target_quality=88.0, notes="Maintain upright chest, avoid valgus twitch"),
        PlanExercise(plan_id=plan.id, exercise_id="knee-flexion", sets=3, reps=12, target_rom=115.0, target_quality=90.0, notes="Smooth eccentric control"),
        PlanExercise(plan_id=plan.id, exercise_id="sit-to-stand", sets=3, reps=10, target_rom=95.0, target_quality=85.0, notes="Even weight distribution on heels"),
        PlanExercise(plan_id=plan.id, exercise_id="balance", sets=3, reps=5, target_rom=10.0, target_quality=90.0, notes="20s holds each side")
    ]
    db.add_all(plan_exercises)
    db.commit()

    # 6. Seed Realistic Past Sessions
    now = datetime.utcnow()
    for i in range(8):
        sess_date = now - timedelta(days=(7 - i) * 3)
        quality = 82.0 + (i * 1.8)
        symmetry = 84.0 + (i * 1.5)
        rom = 88.0 + (i * 2.2)
        
        session = Session(
            session_uid=f"SES-2026-{800 + i}",
            patient_id=primary_patient.id,
            exercise_id="squat-rehab" if i % 2 == 0 else "knee-flexion",
            date=sess_date,
            duration_seconds=180 + (i * 10),
            repetitions_completed=10,
            target_repetitions=10,
            sets_completed=3,
            target_sets=3,
            movement_quality_score=round(quality, 1),
            symmetry_score=round(symmetry, 1),
            min_rom_degrees=42.0,
            max_rom_degrees=round(rom, 1),
            avg_rom_degrees=round(rom - 8.0, 1),
            target_rom_degrees=105.0,
            average_confidence=0.94,
            average_tempo_seconds=2.4,
            ai_feedback_summary=f"Session {i+1}: Steady improvement in cadence and bilateral knee symmetry. Eccentric control has stabilized.",
            therapist_notes="Progressing nicely. Patient reported minimal discomfort (0/10 VAS).",
            completion_status="Completed"
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Repetitions
        for rep_num in range(1, 11):
            rep = SessionRepetition(
                session_id=session.id,
                rep_number=rep_num,
                quality_score=round(quality - 3.0 + (rep_num % 4), 1),
                rom_degrees=round(rom - 4.0 + (rep_num % 5), 1),
                symmetry_score=round(symmetry - 2.0 + (rep_num % 3), 1),
                duration_seconds=2.3 + ((rep_num % 3) * 0.1),
                peak_flexion_degrees=round(rom, 1),
                form_notes="Smooth eccentric descent, stable patellar tracking."
            )
            db.add(rep)
        db.commit()

    # 7. Seed Initial Notifications
    notifications = [
        Notification(title="Plan Assigned", message="Dr. Marcus Reynolds assigned 'ACL Post-Op Phase II Strengthening'.", type="info", is_read=False),
        Notification(title="Milestone Achieved", message="You reached 95% movement quality in your last squat session!", type="success", is_read=False),
        Notification(title="Session Reminder", message="Scheduled rehabilitation workout: Active Knee Flexion today at 5:00 PM.", type="info", is_read=True),
        Notification(title="AI Coach Observation", message="Nova noticed your right knee symmetry improved by +6.2° this week.", type="alert", is_read=False)
    ]
    db.add_all(notifications)

    # 8. Seed Initial Report
    report = Report(
        report_uid="RPT-2026-0801",
        patient_id=primary_patient.id,
        session_id=1,
        title="Bi-Weekly Kinematic Progress Evaluation",
        report_type="Progress Evaluation",
        therapist_notes="Eleanor has demonstrated consistent attendance and remarkable restoration of terminal knee extension."
    )
    db.add(report)

    # 9. Seed Initial AI Welcome Message
    ai_msg = AIMessage(
        patient_id=primary_patient.id,
        sender="nova",
        message="Hello Eleanor! I'm Nova, your RehabAI Clinical Coach. I've analyzed your recent sessions and see wonderful progress in your right knee symmetry (+6.2°). How are you feeling today?",
        session_context={"suggestions": ["Explain my movement symmetry", "How can I improve my ROM safely?", "Summarize today's plan"]}
    )
    db.add(ai_msg)

    db.commit()
    db.close()
    print("[SUCCESS] Database seeded successfully!")

if __name__ == "__main__":
    seed_database()

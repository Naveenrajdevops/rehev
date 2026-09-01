from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="patient")  # therapist, patient, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    therapist_profile = relationship("Therapist", back_populates="user", uselist=False)


class Therapist(Base):
    __tablename__ = "therapists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialty = Column(String, default="Orthopedic Physiotherapy")
    license_number = Column(String, nullable=True)
    clinic_name = Column(String, default="RehabAI Motion Clinic")
    phone = Column(String, nullable=True)

    user = relationship("User", back_populates="therapist_profile")
    patients = relationship("Patient", back_populates="therapist")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id_code = Column(String, unique=True, index=True)  # e.g., 'PT-8821'
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    therapist_id = Column(Integer, ForeignKey("therapists.id"), nullable=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    condition = Column(String, nullable=False)  # e.g., 'Post-op ACL Reconstruction'
    affected_side = Column(String, default="Right")  # Left, Right, Bilateral, None
    primary_goal = Column(String, default="Restore full extension and quad strength")
    status = Column(String, default="Improving")  # Needs Review, Improving, Stable, Excellent
    start_date = Column(DateTime, default=datetime.utcnow)
    overall_quality_score = Column(Float, default=85.0)
    symmetry_score = Column(Float, default=88.0)
    rom_achievement = Column(Float, default=92.0)
    adherence_rate = Column(Float, default=94.0)

    user = relationship("User", back_populates="patient_profile")
    therapist = relationship("Therapist", back_populates="patients")
    sessions = relationship("Session", back_populates="patient", cascade="all, delete-orphan")
    plans = relationship("RehabPlan", back_populates="patient")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String, primary_key=True, index=True)  # slug e.g. 'squat-rehab'
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Knee, Shoulder, Hip, Balance, Posture
    target_body_part = Column(String, nullable=False)
    difficulty = Column(String, default="Beginner")  # Beginner, Intermediate, Advanced
    target_joints = Column(JSON, nullable=False)  # ['left_knee', 'right_knee']
    target_rom_min = Column(Float, default=45.0)
    target_rom_max = Column(Float, default=110.0)
    target_reps = Column(Integer, default=10)
    target_sets = Column(Integer, default=3)
    rest_seconds = Column(Integer, default=60)
    camera_angle = Column(String, default="Front View (3m away)")
    purpose = Column(Text, nullable=True)
    instructions = Column(JSON, nullable=True)  # List of steps
    feedback_rules = Column(JSON, nullable=True)
    icon_name = Column(String, default="Activity")


class RehabPlan(Base):
    __tablename__ = "rehab_plans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(String, default="3x per week")
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="Active")  # Active, Completed, Paused

    patient = relationship("Patient", back_populates="plans")
    exercises = relationship("PlanExercise", back_populates="plan", cascade="all, delete-orphan")


class PlanExercise(Base):
    __tablename__ = "plan_exercises"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("rehab_plans.id"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    target_rom = Column(Float, default=90.0)
    target_quality = Column(Float, default=85.0)
    notes = Column(Text, nullable=True)

    plan = relationship("RehabPlan", back_populates="exercises")
    exercise = relationship("Exercise")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_uid = Column(String, unique=True, index=True)  # e.g., 'SES-2026-0814'
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    exercise_id = Column(String, ForeignKey("exercises.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer, default=0)
    repetitions_completed = Column(Integer, default=0)
    target_repetitions = Column(Integer, default=10)
    sets_completed = Column(Integer, default=1)
    target_sets = Column(Integer, default=3)
    
    # Core Biomechanics Scores
    movement_quality_score = Column(Float, default=0.0)
    symmetry_score = Column(Float, default=0.0)
    min_rom_degrees = Column(Float, default=0.0)
    max_rom_degrees = Column(Float, default=0.0)
    avg_rom_degrees = Column(Float, default=0.0)
    target_rom_degrees = Column(Float, default=0.0)
    average_confidence = Column(Float, default=0.9)
    average_tempo_seconds = Column(Float, default=2.5)
    
    # Clinical Notes & AI Feedback
    ai_feedback_summary = Column(Text, nullable=True)
    therapist_notes = Column(Text, nullable=True)
    completion_status = Column(String, default="Completed")  # Completed, Paused, Aborted

    patient = relationship("Patient", back_populates="sessions")
    exercise = relationship("Exercise")
    repetitions = relationship("SessionRepetition", back_populates="session", cascade="all, delete-orphan")
    metrics = relationship("SessionMetric", back_populates="session", cascade="all, delete-orphan")


class SessionRepetition(Base):
    __tablename__ = "session_repetitions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    rep_number = Column(Integer, nullable=False)
    quality_score = Column(Float, default=0.0)
    rom_degrees = Column(Float, default=0.0)
    symmetry_score = Column(Float, default=0.0)
    duration_seconds = Column(Float, default=0.0)
    peak_flexion_degrees = Column(Float, default=0.0)
    form_notes = Column(String, nullable=True)

    session = relationship("Session", back_populates="repetitions")


class SessionMetric(Base):
    __tablename__ = "session_metrics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    left_angle = Column(Float, nullable=True)
    right_angle = Column(Float, nullable=True)
    quality = Column(Float, nullable=True)
    symmetry_diff = Column(Float, nullable=True)

    session = relationship("Session", back_populates="metrics")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    sender = Column(String, default="user")  # user, nova
    message = Column(Text, nullable=False)
    session_context = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")  # info, warning, success, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_uid = Column(String, unique=True, index=True)  # e.g., 'RPT-8291'
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)
    title = Column(String, nullable=False)
    report_type = Column(String, default="Session Summary")  # Session Summary, Progress Evaluation
    generated_at = Column(DateTime, default=datetime.utcnow)
    data = Column(JSON, nullable=True)
    pdf_path = Column(String, nullable=True)
    therapist_notes = Column(Text, nullable=True)
    status = Column(String, default="Ready")


class UserSetting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    voice_feedback = Column(Boolean, default=True)
    audio_volume = Column(Float, default=0.8)
    camera_device_id = Column(String, default="default")
    theme_accent = Column(String, default="purple")  # purple, cyan, blue
    pose_confidence_threshold = Column(Float, default=0.65)
    spatial_3d_mode = Column(Boolean, default=True)
    privacy_local_only = Column(Boolean, default=True)

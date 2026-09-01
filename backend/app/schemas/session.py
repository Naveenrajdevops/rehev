from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RepetitionCreate(BaseModel):
    rep_number: int
    quality_score: float
    rom_degrees: float
    symmetry_score: float
    duration_seconds: float
    peak_flexion_degrees: Optional[float] = 0.0
    form_notes: Optional[str] = None

class RepetitionOut(RepetitionCreate):
    id: int
    session_id: int

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    session_uid: Optional[str] = None
    patient_id: int
    exercise_id: str
    duration_seconds: int
    repetitions_completed: int
    target_repetitions: int = 10
    sets_completed: int = 1
    target_sets: int = 3
    movement_quality_score: float
    symmetry_score: float
    min_rom_degrees: float
    max_rom_degrees: float
    avg_rom_degrees: float
    target_rom_degrees: float
    average_confidence: float = 0.9
    average_tempo_seconds: float = 2.5
    ai_feedback_summary: Optional[str] = None
    therapist_notes: Optional[str] = None
    completion_status: str = "Completed"
    repetitions: Optional[List[RepetitionCreate]] = []

class SessionOut(BaseModel):
    id: int
    session_uid: str
    patient_id: int
    exercise_id: str
    date: datetime
    duration_seconds: int
    repetitions_completed: int
    target_repetitions: int
    sets_completed: int
    target_sets: int
    movement_quality_score: float
    symmetry_score: float
    min_rom_degrees: float
    max_rom_degrees: float
    avg_rom_degrees: float
    target_rom_degrees: float
    average_confidence: float
    average_tempo_seconds: float
    ai_feedback_summary: Optional[str] = None
    therapist_notes: Optional[str] = None
    completion_status: str
    repetitions: Optional[List[RepetitionOut]] = []

    class Config:
        from_attributes = True

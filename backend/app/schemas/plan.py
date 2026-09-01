from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PlanExerciseBase(BaseModel):
    exercise_id: str
    sets: int = 3
    reps: int = 10
    target_rom: float = 90.0
    target_quality: float = 85.0
    notes: Optional[str] = None

class PlanExerciseCreate(PlanExerciseBase):
    pass

class PlanExerciseOut(PlanExerciseBase):
    id: int
    plan_id: int
    class Config:
        from_attributes = True

class RehabPlanCreate(BaseModel):
    patient_id: int
    title: str
    description: Optional[str] = None
    frequency: str = "3x per week"
    exercises: List[PlanExerciseCreate] = []

class RehabPlanOut(BaseModel):
    id: int
    patient_id: int
    title: str
    description: Optional[str] = None
    frequency: str
    start_date: datetime
    status: str
    exercises: List[PlanExerciseOut] = []

    class Config:
        from_attributes = True

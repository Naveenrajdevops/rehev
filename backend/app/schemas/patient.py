from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    condition: str
    affected_side: str = "Right"
    primary_goal: str = "Restore functional mobility"
    status: str = "Improving"

class PatientCreate(PatientBase):
    patient_id_code: Optional[str] = None
    therapist_id: Optional[int] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    condition: Optional[str] = None
    affected_side: Optional[str] = None
    primary_goal: Optional[str] = None
    status: Optional[str] = None
    overall_quality_score: Optional[float] = None
    symmetry_score: Optional[float] = None
    rom_achievement: Optional[float] = None
    adherence_rate: Optional[float] = None

class PatientOut(PatientBase):
    id: int
    patient_id_code: str
    overall_quality_score: float
    symmetry_score: float
    rom_achievement: float
    adherence_rate: float
    start_date: datetime

    class Config:
        from_attributes = True

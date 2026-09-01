from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ReportCreate(BaseModel):
    patient_id: int
    session_id: Optional[int] = None
    title: str
    report_type: str = "Session Summary"
    data: Optional[Dict[str, Any]] = None
    therapist_notes: Optional[str] = None

class ReportOut(BaseModel):
    id: int
    report_uid: str
    patient_id: int
    session_id: Optional[int] = None
    title: str
    report_type: str
    generated_at: datetime
    data: Optional[Dict[str, Any]] = None
    pdf_path: Optional[str] = None
    therapist_notes: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

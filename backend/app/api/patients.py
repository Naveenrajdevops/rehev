from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Patient, Session as DbSession
from ..schemas.patient import PatientCreate, PatientUpdate, PatientOut
from ..schemas.session import SessionOut

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientOut])
def list_patients(
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Patient)
    if search:
        query = query.filter(
            (Patient.name.ilike(f"%{search}%")) |
            (Patient.patient_id_code.ilike(f"%{search}%")) |
            (Patient.condition.ilike(f"%{search}%"))
        )
    if status and status != "All":
        query = query.filter(Patient.status == status)
    
    return query.order_by(Patient.name).all()

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("", response_model=PatientOut)
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    count = db.query(Patient).count()
    id_code = data.patient_id_code or f"PT-{8800 + count + 1}"
    
    new_patient = Patient(
        patient_id_code=id_code,
        name=data.name,
        age=data.age,
        gender=data.gender,
        phone=data.phone,
        email=data.email,
        condition=data.condition,
        affected_side=data.affected_side,
        primary_goal=data.primary_goal,
        status=data.status,
        therapist_id=data.therapist_id
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, data: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(patient, key, value)
        
    db.commit()
    db.refresh(patient)
    return patient

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

@router.get("/{patient_id}/sessions", response_model=List[SessionOut])
def get_patient_sessions(patient_id: int, db: Session = Depends(get_db)):
    sessions = db.query(DbSession).filter(DbSession.patient_id == patient_id).order_by(DbSession.date.desc()).all()
    return sessions

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import RehabPlan, PlanExercise, Patient
from ..schemas.plan import RehabPlanCreate, RehabPlanOut

router = APIRouter(prefix="/plans", tags=["Rehabilitation Plans"])

@router.get("", response_model=List[RehabPlanOut])
def list_plans(db: Session = Depends(get_db)):
    return db.query(RehabPlan).all()

@router.get("/patient/{patient_id}", response_model=List[RehabPlanOut])
def get_patient_plans(patient_id: int, db: Session = Depends(get_db)):
    return db.query(RehabPlan).filter(RehabPlan.patient_id == patient_id).all()

@router.post("", response_model=RehabPlanOut)
def create_plan(data: RehabPlanCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    plan = RehabPlan(
        patient_id=data.patient_id,
        title=data.title,
        description=data.description,
        frequency=data.frequency
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    for item in data.exercises:
        plan_ex = PlanExercise(
            plan_id=plan.id,
            exercise_id=item.exercise_id,
            sets=item.sets,
            reps=item.reps,
            target_rom=item.target_rom,
            target_quality=item.target_quality,
            notes=item.notes
        )
        db.add(plan_ex)

    db.commit()
    db.refresh(plan)
    return plan

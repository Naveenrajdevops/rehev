from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Session as DbSession, SessionRepetition, Patient, Notification
from ..schemas.session import SessionCreate, SessionOut

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.get("", response_model=List[SessionOut])
def list_sessions(
    patient_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(DbSession)
    if patient_id:
        query = query.filter(DbSession.patient_id == patient_id)
    return query.order_by(DbSession.date.desc()).limit(limit).all()

@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("", response_model=SessionOut)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    count = db.query(DbSession).count()
    uid = data.session_uid or f"SES-{datetime.utcnow().strftime('%Y%m%d')}-{count + 1:03d}"

    # Auto-generate AI summary if empty
    ai_summary = data.ai_feedback_summary or (
        f"Completed {data.repetitions_completed} repetitions of {data.exercise_id}. "
        f"Overall movement quality achieved was {data.movement_quality_score:.1f}% with "
        f"symmetry score of {data.symmetry_score:.1f}%. "
        f"Peak ROM reached {data.max_rom_degrees:.1f}°."
    )

    new_session = DbSession(
        session_uid=uid,
        patient_id=data.patient_id,
        exercise_id=data.exercise_id,
        duration_seconds=data.duration_seconds,
        repetitions_completed=data.repetitions_completed,
        target_repetitions=data.target_repetitions,
        sets_completed=data.sets_completed,
        target_sets=data.target_sets,
        movement_quality_score=data.movement_quality_score,
        symmetry_score=data.symmetry_score,
        min_rom_degrees=data.min_rom_degrees,
        max_rom_degrees=data.max_rom_degrees,
        avg_rom_degrees=data.avg_rom_degrees,
        target_rom_degrees=data.target_rom_degrees,
        average_confidence=data.average_confidence,
        average_tempo_seconds=data.average_tempo_seconds,
        ai_feedback_summary=ai_summary,
        therapist_notes=data.therapist_notes,
        completion_status=data.completion_status
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Insert repetitions if provided
    if data.repetitions:
        for rep in data.repetitions:
            rep_entry = SessionRepetition(
                session_id=new_session.id,
                rep_number=rep.rep_number,
                quality_score=rep.quality_score,
                rom_degrees=rep.rom_degrees,
                symmetry_score=rep.symmetry_score,
                duration_seconds=rep.duration_seconds,
                peak_flexion_degrees=rep.peak_flexion_degrees,
                form_notes=rep.form_notes
            )
            db.add(rep_entry)
        db.commit()

    # Update patient dynamic recovery stats
    patient.overall_quality_score = round((patient.overall_quality_score * 0.7) + (data.movement_quality_score * 0.3), 1)
    patient.symmetry_score = round((patient.symmetry_score * 0.7) + (data.symmetry_score * 0.3), 1)
    if data.target_rom_degrees > 0:
        patient.rom_achievement = round(min(100.0, (data.max_rom_degrees / data.target_rom_degrees) * 100.0), 1)
    
    # Create notification
    notif = Notification(
        title="Session Completed",
        message=f"{patient.name} completed {data.repetitions_completed} reps ({data.movement_quality_score:.0f}% quality).",
        type="success"
    )
    db.add(notif)
    db.commit()
    db.refresh(new_session)

    return new_session

@router.put("/{session_id}/notes", response_model=SessionOut)
def update_therapist_notes(session_id: int, notes: str = Query(..., description="Therapist clinical notes"), db: Session = Depends(get_db)):
    session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.therapist_notes = notes
    db.commit()
    db.refresh(session)
    return session

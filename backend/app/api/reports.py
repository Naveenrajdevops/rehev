from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Report, Session as DbSession, Patient, Therapist
from ..schemas.report import ReportCreate, ReportOut
from ..services.report_service import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportOut])
def list_reports(patient_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if patient_id:
        query = query.filter(Report.patient_id == patient_id)
    return query.order_by(Report.generated_at.desc()).all()

@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("", response_model=ReportOut)
def create_report(data: ReportCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    count = db.query(Report).count()
    uid = f"RPT-{datetime.utcnow().strftime('%Y%m')}-{count + 1:04d}"

    report = Report(
        report_uid=uid,
        patient_id=data.patient_id,
        session_id=data.session_id,
        title=data.title,
        report_type=data.report_type,
        data=data.data,
        therapist_notes=data.therapist_notes
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/pdf/session/{session_id}")
def download_session_pdf(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    patient = db.query(Patient).filter(Patient.id == session.patient_id).first()
    therapist = db.query(Therapist).first()

    report_payload = {
        "report_uid": f"RPT-{session.session_uid}",
        "patient_name": patient.name if patient else "Patient",
        "patient_id_code": patient.patient_id_code if patient else "PT-0001",
        "condition": patient.condition if patient else "General Rehab",
        "therapist_name": therapist.user.full_name if therapist and therapist.user else "Dr. Marcus Reynolds, DPT",
        "exercise_name": session.exercise_id.replace('-', ' ').title(),
        "duration_seconds": session.duration_seconds,
        "movement_quality_score": session.movement_quality_score,
        "symmetry_score": session.symmetry_score,
        "max_rom_degrees": session.max_rom_degrees,
        "target_rom_degrees": session.target_rom_degrees,
        "repetitions_completed": session.repetitions_completed,
        "target_repetitions": session.target_repetitions,
        "average_tempo_seconds": session.average_tempo_seconds,
        "average_confidence": session.average_confidence,
        "ai_feedback_summary": session.ai_feedback_summary,
        "therapist_notes": session.therapist_notes,
        "repetitions": [
            {
                "rep_number": r.rep_number,
                "quality_score": r.quality_score,
                "rom_degrees": r.rom_degrees,
                "symmetry_score": r.symmetry_score,
                "duration_seconds": r.duration_seconds,
                "form_notes": r.form_notes
            }
            for r in session.repetitions
        ]
    }

    pdf_bytes = generate_pdf_report(report_payload)
    filename = f"RehabAI_Report_{session.session_uid}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import AIMessage, Patient
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.ai_service import generate_nova_response

router = APIRouter(prefix="/chat", tags=["AI Coach"])

@router.post("", response_model=ChatResponse)
def chat_with_nova(request: ChatRequest, db: Session = Depends(get_db)):
    patient_info = None
    if request.patient_id:
        patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
        if patient:
            patient_info = {
                "name": patient.name,
                "condition": patient.condition,
                "affected_side": patient.affected_side,
                "primary_goal": patient.primary_goal,
                "quality_score": patient.overall_quality_score
            }

    # Save user message to database
    user_msg = AIMessage(
        patient_id=request.patient_id,
        sender="user",
        message=request.message,
        session_context=request.session_context
    )
    db.add(user_msg)
    db.commit()

    # Generate response
    response_data = generate_nova_response(
        message=request.message,
        patient_info=patient_info,
        session_context=request.session_context
    )

    # Save Nova response to database
    nova_msg = AIMessage(
        patient_id=request.patient_id,
        sender="nova",
        message=response_data["message"],
        session_context={"suggestions": response_data.get("suggestions", [])}
    )
    db.add(nova_msg)
    db.commit()

    return response_data

@router.get("/history")
def get_chat_history(patient_id: Optional[int] = None, limit: int = 30, db: Session = Depends(get_db)):
    query = db.query(AIMessage)
    if patient_id:
        query = query.filter(AIMessage.patient_id == patient_id)
    messages = query.order_by(AIMessage.created_at.asc()).limit(limit).all()
    return [
        {
            "id": m.id,
            "sender": m.sender,
            "message": m.message,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in messages
    ]

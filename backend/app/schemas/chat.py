from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[int] = None
    session_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    suggestions: List[str] = []
    sender: str = "nova"

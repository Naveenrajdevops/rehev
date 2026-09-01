from pydantic import BaseModel
from typing import List, Optional, Any

class ExerciseBase(BaseModel):
    id: str
    name: str
    category: str
    target_body_part: str
    difficulty: str = "Beginner"
    target_joints: List[str]
    target_rom_min: float
    target_rom_max: float
    target_reps: int = 10
    target_sets: int = 3
    rest_seconds: int = 60
    camera_angle: str = "Front View (3m away)"
    purpose: Optional[str] = None
    instructions: Optional[List[str]] = None
    feedback_rules: Optional[List[dict]] = None
    icon_name: str = "Activity"

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseOut(ExerciseBase):
    class Config:
        from_attributes = True

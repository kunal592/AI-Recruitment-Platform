from pydantic import BaseModel, Field

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class AIPreferences(BaseModel):
    auto_apply: bool = False
    optimization_level: str = "Balanced" # "Minimal", "Balanced", "Aggressive"
    match_threshold: int = 90

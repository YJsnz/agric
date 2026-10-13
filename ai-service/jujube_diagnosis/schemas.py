from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field

class Task(str, Enum):
    leaf = 'leaf'
    fruit_bruise = 'fruit_bruise'
    fruit_freshness = 'fruit_freshness'

class Score(BaseModel):
    class_name: str = Field(alias='class')
    label_zh: str
    confidence: float = Field(ge=0, le=1)

class Prediction(Score):
    topk: list[Score]

class RiskSemantics(BaseModel):
    type: Literal['leaf visual symptom evidence', 'postharvest visual risk evidence']
    is_diagnosis: Literal[False] = False

class AnalyzeResponse(BaseModel):
    success: Literal[True] = True
    crop: Literal['jujube'] = 'jujube'
    task: Task
    model_name: str
    model_version: str
    prediction: Prediction
    risk_semantics: RiskSemantics
    disclaimer: str

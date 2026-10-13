from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class Schema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, allow_inf_nan=False)


class WheatLeafObservation(Schema):
    model: str
    type: Literal['leaf_symptom'] = 'leaf_symptom'
    visual_class: Literal['healthy', 'rust', 'leaf_spot_blight', 'nitrogen_deficiency'] = Field(alias='class')
    label_zh: str
    score: float = Field(ge=0, le=1)
    raw_scores: dict[str, float]


class WheatCanopyObservation(Schema):
    model: str
    type: Literal['canopy_water_stress_visual'] = 'canopy_water_stress_visual'
    visual_class: Literal['normal', 'water_stress'] = Field(alias='class')
    label_zh: str
    visual_score: float = Field(ge=0, le=1)
    threshold: Literal[0.37] = 0.37
    raw_scores: dict[str, float]
    interpretation: str
    weak_supervision: Literal[True] = True


class HeadBox(Schema):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float = Field(ge=0, le=1)


class WheatHeadObservation(Schema):
    model: str
    type: Literal['wheat_head_detection'] = 'wheat_head_detection'
    visual_class: Literal['wheat_head'] = Field(default='wheat_head', alias='class')
    wheat_head_count: int = Field(ge=0)
    mean_confidence: float | None = Field(default=None, ge=0, le=1)
    confidence_threshold: Literal[0.25] = 0.25
    boxes: list[HeadBox]
    image_width: int
    image_height: int


class WheatEnvironmentalContext(Schema):
    growth_stage: str | None = Field(default=None, max_length=100)
    soil_moisture: float | None = Field(default=None, ge=0)
    soil_salinity: float | None = Field(default=None, ge=0)
    temperature: float | None = None
    humidity: float | None = Field(default=None, ge=0, le=100)
    region: str | None = Field(default=None, max_length=200)
    leaf_position: Literal['lower', 'upper', 'both', 'unknown'] | None = None
    field_distribution: Literal['scattered', 'patches', 'widespread', 'unknown'] | None = None
    recent_operations: str | None = Field(default=None, max_length=500)
    progression: Literal['stable', 'spreading', 'unknown'] | None = None

    @field_validator('growth_stage', 'region', 'recent_operations', mode='before')
    @classmethod
    def trim(cls, value):
        return (value.strip() or None) if isinstance(value, str) else value


class WheatDiagnosisRequest(Schema):
    """Typed context; the multipart router handles optional binary image fields."""
    environment_context: WheatEnvironmentalContext = Field(default_factory=WheatEnvironmentalContext)


class VisualObservations(Schema):
    leaf: WheatLeafObservation | None = None
    canopy: WheatCanopyObservation | None = None
    head: WheatHeadObservation | None = None


class WheatDiagnosisResponse(Schema):
    decision_support: dict = Field(default_factory=dict)
    crop: str = '黄骅旱碱麦'
    visual_observations: VisualObservations
    environment_context: WheatEnvironmentalContext
    candidate_signals: list[dict]
    knowledge: dict
    status: str = 'visual_only'
    assessment: str | dict | None = None
    recommendations: list[dict] = Field(default_factory=list)
    candidate_risks: list[dict] = Field(default_factory=list)
    grounding_status: str = 'not_requested'
    grounding: dict | None = None
    generation_called: bool = False
    citations: list[dict] = Field(default_factory=list)
    limitations: list[str]
    warnings: list[dict] = Field(default_factory=list)

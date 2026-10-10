from fastapi import APIRouter,HTTPException
from pydantic import BaseModel,Field,ConfigDict
from typing import Literal
from .context import QingxianContext
from .graphrag_adapter import run_qingxian_graphrag

router=APIRouter()
class AskRequest(BaseModel):
    model_config=ConfigDict(allow_inf_nan=False)
    question:str=Field(min_length=1,max_length=500)
    region:str|None=Field(default=None,max_length=120)
    crop:Literal['黄瓜','番茄']|None=None
    organ:Literal['leaf','fruit','stem','root']|None=None
    scene:str|None=Field(default=None,max_length=50)
    growth_stage:str|None=Field(default=None,max_length=50)
    season:str|None=Field(default=None,max_length=50)
    temperature:float|None=Field(default=None,ge=-60,le=80)
    humidity:float|None=Field(default=None,ge=0,le=100)
    light:float|None=Field(default=None,ge=0)
    soil_moisture:float|None=Field(default=None,ge=0,le=100)
    ec:float|None=Field(default=None,ge=0)
    ph:float|None=Field(default=None,ge=0,le=14)

@router.post('/api/qingxian/ask')
def ask(body:AskRequest):
    if not body.question.strip():raise HTTPException(422,'问题不能为空')
    context=QingxianContext(**body.model_dump(exclude={'question'}))
    return run_qingxian_graphrag(environment_context=context,question=body.question)

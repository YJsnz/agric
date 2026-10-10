from fastapi import APIRouter
from pydantic import BaseModel,Field
from .service import ask

router=APIRouter()
class WheatQuestion(BaseModel):
    question:str=Field(min_length=1,max_length=500)

@router.post('/api/wheat/ask')
def ask_wheat(body:WheatQuestion):
    return ask(body.question)

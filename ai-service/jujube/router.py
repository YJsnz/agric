from fastapi import APIRouter
from pydantic import BaseModel, Field
from .service import ask

router=APIRouter()

class Question(BaseModel):
    question: str = Field(min_length=1,max_length=500)
    region: str | None = Field(default=None,max_length=150)

@router.post('/api/jujube/ask')
def jujube_ask(body:Question):
    return ask(body.question,body.region)

from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import ValidationError
from .schemas import WheatDiagnosisRequest, WheatEnvironmentalContext, WheatDiagnosisResponse
from .service import get_service
from .exceptions import WheatDiagnosisError
from .image_input import read_upload

router = APIRouter(prefix='/api/wheat', tags=['旱碱麦视觉诊断'])


@router.get('/models/status')
def models_status(service=Depends(get_service)):
    return service.status()


@router.post('/diagnose', response_model=WheatDiagnosisResponse)
def diagnose(
    leaf_image: Annotated[UploadFile | None, File()] = None,
    canopy_image: Annotated[UploadFile | None, File()] = None,
    head_image: Annotated[UploadFile | None, File()] = None,
    growth_stage: Annotated[str | None, Form(max_length=100)] = None,
    soil_moisture: Annotated[float | None, Form(ge=0, allow_inf_nan=False)] = None,
    soil_salinity: Annotated[float | None, Form(ge=0, allow_inf_nan=False)] = None,
    temperature: Annotated[float | None, Form(allow_inf_nan=False)] = None,
    humidity: Annotated[float | None, Form(ge=0,le=100, allow_inf_nan=False)] = None,
    region: Annotated[str | None, Form(max_length=200)] = None,
    leaf_position: Annotated[str | None, Form()] = None,
    field_distribution: Annotated[str | None, Form()] = None,
    recent_operations: Annotated[str | None, Form(max_length=500)] = None,
    progression: Annotated[str | None, Form()] = None,
    knowledge_enabled: Annotated[bool, Form()] = True,
    service=Depends(get_service),
):
    try:
        request = WheatDiagnosisRequest(environment_context=WheatEnvironmentalContext(
            growth_stage=growth_stage,soil_moisture=soil_moisture,soil_salinity=soil_salinity,
            temperature=temperature,humidity=humidity,region=region,
            leaf_position=leaf_position,field_distribution=field_distribution,
            recent_operations=recent_operations,progression=progression))
    except ValidationError as error:
        raise HTTPException(422,'环境参数格式无效') from error
    uploads = {'leaf':leaf_image,'canopy':canopy_image,'head':head_image}
    if not any(v is not None for v in uploads.values()) and not any(v is not None for v in request.environment_context.model_dump().values()):
        raise HTTPException(400,'至少需要提供视觉输入或环境上下文。')
    images = {}
    for name, upload in uploads.items():
        if upload is not None:
            try:
                images[name] = read_upload(upload)
            except WheatDiagnosisError as error:
                images[name] = error
    try:
        return service.diagnose(images,request.environment_context,knowledge_enabled=knowledge_enabled)
    except WheatDiagnosisError as error:
        raise HTTPException(500,str(error)) from error

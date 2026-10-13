"""调用者明确提供的上下文；缺失值不根据视觉类别推断。"""
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class PearDiagnosisContext:
    crop: str | None = None
    organ: str | None = None
    region: str | None = None
    scene: str | None = None
    growth_stage: str | None = None
    temperature: float | None = None
    humidity: float | None = None
    rainfall: float | None = None

    def to_dict(self) -> dict:
        return asdict(self)

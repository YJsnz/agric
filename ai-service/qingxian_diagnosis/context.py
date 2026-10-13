from dataclasses import dataclass,asdict

@dataclass
class QingxianContext:
    region: str | None=None
    scene: str | None=None
    crop: str | None=None
    organ: str | None=None
    growth_stage: str | None=None
    temperature: float | None=None
    humidity: float | None=None
    light: float | None=None
    soil_moisture: float | None=None
    ec: float | None=None
    ph: float | None=None
    season: str | None=None

    def to_dict(self):return asdict(self)

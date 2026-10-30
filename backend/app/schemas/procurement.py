from pydantic import BaseModel, Field
from typing import Optional

class CoverageSchema(BaseModel):
    total_target_intervals: int
    matched_intervals: int
    missing_forecasts: int
    missing_actuals: int

class MetricsSummarySchema(BaseModel):
    total_actual_mwh: float
    total_forecast_mwh: float
    total_absolute_error_mwh: float
    avg_actual_mw: Optional[float] = None
    avg_forecast_mw: Optional[float] = None
    mae_mw: Optional[float] = None
    rmse_mw: Optional[float] = None
    bias_mw: Optional[float] = None
    wape_pct: Optional[float] = None
    coverage: CoverageSchema

class IntervalEvaluationSchema(BaseModel):
    settlement_period: int
    start_time: str
    end_time: str
    publish_time: Optional[str] = None
    lead_time_hours: Optional[float] = None
    actual_mw: Optional[float] = None
    actual_mwh: Optional[float] = None
    forecast_mw: Optional[float] = None
    forecast_mwh: Optional[float] = None
    error_mw: Optional[float] = None
    abs_error_mw: Optional[float] = None
    status: str
    resolution_mode: Optional[str] = None

class DayEvaluationResponse(BaseModel):
    target_date: str
    decision_cutoff: Optional[str] = None
    cutoff_preset: str
    cutoff_description: str
    summary: MetricsSummarySchema
    intervals: list[IntervalEvaluationSchema]

class VintageItemSchema(BaseModel):
    start_time: str
    publish_time: str
    forecast_mw: float
    forecast_mwh: float
    lead_time_hours: float

class VintageHistoryResponse(BaseModel):
    start_time: str
    vintages: list[VintageItemSchema]

class SyncStatusItem(BaseModel):
    dataset: str
    last_synced_at: str
    records_count: int
    details: Optional[str] = None

class SystemStatusResponse(BaseModel):
    status: str
    database_records: dict[str, int]
    sync_status: list[SyncStatusItem]
    default_date: str


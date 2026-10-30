import csv
import io
from fastapi import APIRouter, Query, HTTPException, Response
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.domain.vintage import evaluate_day_procurement, get_forecast_vintages_for_interval
from app.domain.metrics import calculate_metrics
from app.schemas.procurement import (
    DayEvaluationResponse,
    VintageHistoryResponse,
    SystemStatusResponse,
    MetricsSummarySchema,
    CoverageSchema
)

router = APIRouter(prefix="/api/procurement", tags=["procurement"])

@router.get("/evaluation", response_model=DayEvaluationResponse)
def get_evaluation(
    date: str = Query("2026-01-10", pattern=r"^\d{4}-\d{2}-\d{2}$", description="Target delivery date (YYYY-MM-DD)"),
    cutoff_preset: str = Query("day_ahead_11am", description="Preset cutoff rule"),
    custom_cutoff: str | None = Query(None, description="Custom ISO cutoff string if preset is 'custom'")
):
    with get_db() as conn:
        eval_result = evaluate_day_procurement(
            conn=conn,
            target_date_str=date,
            cutoff_preset=cutoff_preset,
            custom_cutoff=custom_cutoff
        )
        metrics = calculate_metrics(eval_result["intervals"])
        
        coverage = CoverageSchema(
            total_target_intervals=metrics["total_intervals"],
            matched_intervals=metrics["matched_intervals"],
            missing_forecasts=metrics["missing_forecasts"],
            missing_actuals=metrics["missing_actuals"]
        )
        
        summary = MetricsSummarySchema(
            total_actual_mwh=metrics["total_actual_mwh"],
            total_forecast_mwh=metrics["total_forecast_mwh"],
            total_absolute_error_mwh=metrics["total_absolute_error_mwh"],
            avg_actual_mw=metrics["avg_actual_mw"],
            avg_forecast_mw=metrics["avg_forecast_mw"],
            mae_mw=metrics["mae_mw"],
            rmse_mw=metrics["rmse_mw"],
            bias_mw=metrics["bias_mw"],
            wape_pct=metrics["wape_pct"],
            coverage=coverage
        )
        
        return DayEvaluationResponse(
            target_date=eval_result["target_date"],
            decision_cutoff=eval_result["decision_cutoff"],
            cutoff_preset=eval_result["cutoff_preset"],
            cutoff_description=eval_result["cutoff_description"],
            summary=summary,
            intervals=eval_result["intervals"]
        )

@router.get("/vintages", response_model=VintageHistoryResponse)
def get_vintages(start_time: str = Query(..., description="Target delivery interval ISO 8601 string")):
    with get_db() as conn:
        records = get_forecast_vintages_for_interval(conn, start_time)
        return VintageHistoryResponse(
            start_time=start_time,
            vintages=records
        )

@router.get("/export")
def export_csv(
    date: str = Query("2026-01-10", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    cutoff_preset: str = Query("day_ahead_11am"),
    custom_cutoff: str | None = Query(None)
):
    with get_db() as conn:
        eval_result = evaluate_day_procurement(
            conn=conn,
            target_date_str=date,
            cutoff_preset=cutoff_preset,
            custom_cutoff=custom_cutoff
        )
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Settlement Period",
            "Interval Start (UTC)",
            "Interval End (UTC)",
            "Forecast Publication Time (UTC)",
            "Lead Time (Hours)",
            "Forecast Generation (MW)",
            "Forecast Energy (MWh)",
            "Actual Generation (MW)",
            "Actual Energy (MWh)",
            "Signed Error (MW)",
            "Absolute Error (MW)",
            "Status"
        ])
        
        for it in eval_result["intervals"]:
            writer.writerow([
                it["settlement_period"],
                it["start_time"],
                it["end_time"],
                it["publish_time"] or "N/A",
                it["lead_time_hours"] if it["lead_time_hours"] is not None else "N/A",
                it["forecast_mw"] if it["forecast_mw"] is not None else "N/A",
                it["forecast_mwh"] if it["forecast_mwh"] is not None else "N/A",
                it["actual_mw"] if it["actual_mw"] is not None else "N/A",
                it["actual_mwh"] if it["actual_mwh"] is not None else "N/A",
                it["error_mw"] if it["error_mw"] is not None else "N/A",
                it["abs_error_mw"] if it["abs_error_mw"] is not None else "N/A",
                it["status"]
            ])
            
        output.seek(0)
        filename = f"aerovanta_procurement_{date}_{cutoff_preset}.csv"
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

@router.get("/status", response_model=SystemStatusResponse)
def get_system_status():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT count(*) as c FROM actual_wind")
        act_count = cur.fetchone()["c"]
        cur.execute("SELECT count(*) as c FROM forecast_vintages")
        fc_count = cur.fetchone()["c"]
        cur.execute("SELECT * FROM sync_status")
        statuses = [dict(r) for r in cur.fetchall()]
        
        return SystemStatusResponse(
            status="operational",
            database_records={
                "actual_wind": act_count,
                "forecast_vintages": fc_count
            },
            sync_status=statuses,
            default_date="2026-01-10"
        )

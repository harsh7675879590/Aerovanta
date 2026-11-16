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
    custom_cutoff: str | None = Query(None, description="Custom ISO cutoff string if preset is 'custom'"),
    zone: str = Query("GB_NATIONAL", description="Grid Market Zone"),
    weighting: str = Query("capacity_wind", description="Weighting dispatch model")
):
    with get_db() as conn:
        eval_result = evaluate_day_procurement(
            conn=conn,
            target_date_str=date,
            cutoff_preset=cutoff_preset,
            custom_cutoff=custom_cutoff
        )

        intervals = eval_result["intervals"]
        if zone != "GB_NATIONAL" or weighting != "capacity_wind":
            ZONE_FACTORS = {
                "GB_NATIONAL": 1.0,
                "SCOTLAND": 0.26,
                "ENGLAND_NORTH": 0.32,
                "ENGLAND_SOUTH": 0.19,
                "WALES_IRISH_SEA": 0.14
            }
            z_mult = ZONE_FACTORS.get(zone, 1.0)
            is_curtail = weighting == "curtailment_adj"
            is_unweighted = weighting == "unweighted"
            w_mult = 1.06 if is_unweighted else 1.0
            
            b6_ceiling = None
            if is_curtail:
                if zone == "SCOTLAND":
                    b6_ceiling = 2100.0
                elif zone == "GB_NATIONAL":
                    b6_ceiling = 9500.0

            scaled_intervals = []
            for it in intervals:
                it_copy = dict(it)
                act = it_copy.get("actual_mw")
                fc = it_copy.get("forecast_mw")
                
                if act is not None:
                    act_scaled = act * z_mult * w_mult
                    if b6_ceiling is not None and act_scaled > b6_ceiling:
                        act_scaled = b6_ceiling
                    it_copy["actual_mw"] = round(act_scaled, 2)
                    it_copy["actual_mwh"] = round(act_scaled * 0.5, 2)
                    
                if fc is not None:
                    fc_scaled = fc * z_mult * w_mult
                    if b6_ceiling is not None and fc_scaled > b6_ceiling:
                        fc_scaled = b6_ceiling
                    it_copy["forecast_mw"] = round(fc_scaled, 2)
                    it_copy["forecast_mwh"] = round(fc_scaled * 0.5, 2)
                    
                if it_copy.get("actual_mw") is not None and it_copy.get("forecast_mw") is not None:
                    it_copy["error_mw"] = round(it_copy["forecast_mw"] - it_copy["actual_mw"], 2)
                    it_copy["abs_error_mw"] = round(abs(it_copy["error_mw"]), 2)
                    
                scaled_intervals.append(it_copy)
            intervals = scaled_intervals

        metrics = calculate_metrics(intervals)
        
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
            intervals=intervals
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

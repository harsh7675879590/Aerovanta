import math
from typing import Any

def calculate_metrics(intervals: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Calculate forecast accuracy metrics over matched half-hour intervals.
    Guarantees no division by zero and preserves sample counts.
    """
    matched = [it for it in intervals if it.get("status") == "matched" and it.get("forecast_mw") is not None and it.get("actual_mw") is not None]
    n = len(matched)
    
    if n == 0:
        return {
            "total_intervals": len(intervals),
            "matched_intervals": 0,
            "missing_forecasts": sum(1 for it in intervals if it.get("forecast_mw") is None),
            "missing_actuals": sum(1 for it in intervals if it.get("actual_mw") is None),
            "total_actual_mwh": 0.0,
            "total_forecast_mwh": 0.0,
            "avg_actual_mw": None,
            "avg_forecast_mw": None,
            "mae_mw": None,
            "rmse_mw": None,
            "bias_mw": None,
            "wape_pct": None,
            "total_absolute_error_mwh": 0.0
        }
    
    errors = [it["forecast_mw"] - it["actual_mw"] for it in matched]
    abs_errors = [abs(e) for e in errors]
    squared_errors = [e ** 2 for e in errors]
    
    actual_vals = [it["actual_mw"] for it in matched]
    forecast_vals = [it["forecast_mw"] for it in matched]
    
    sum_actual_mw = sum(actual_vals)
    sum_forecast_mw = sum(forecast_vals)
    sum_abs_errors = sum(abs_errors)
    
    # In GB 30-minute intervals: MWh = MW * 0.5
    total_actual_mwh = round(sum(it.get("actual_mwh", it["actual_mw"] * 0.5) for it in matched), 2)
    total_forecast_mwh = round(sum(it.get("forecast_mwh", it["forecast_mw"] * 0.5) for it in matched), 2)
    total_abs_error_mwh = round(sum_abs_errors * 0.5, 2)
    
    mae = round(sum_abs_errors / n, 2)
    rmse = round(math.sqrt(sum(squared_errors) / n), 2)
    bias = round(sum(errors) / n, 2)
    
    # WAPE calculation with zero-denominator safety
    if sum_actual_mw > 0:
        wape_pct = round((sum_abs_errors / sum_actual_mw) * 100, 2)
    else:
        wape_pct = None

    return {
        "total_intervals": len(intervals),
        "matched_intervals": n,
        "missing_forecasts": sum(1 for it in intervals if it.get("forecast_mw") is None),
        "missing_actuals": sum(1 for it in intervals if it.get("actual_mw") is None),
        "total_actual_mwh": total_actual_mwh,
        "total_forecast_mwh": total_forecast_mwh,
        "avg_actual_mw": round(sum_actual_mw / n, 2),
        "avg_forecast_mw": round(sum_forecast_mw / n, 2),
        "mae_mw": mae,
        "rmse_mw": rmse,
        "bias_mw": bias,
        "wape_pct": wape_pct,
        "total_absolute_error_mwh": total_abs_error_mwh
    }


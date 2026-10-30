import math
from app.domain.metrics import calculate_metrics

def test_calculate_metrics_standard():
    # Construct 4 matched intervals
    intervals = [
        {"status": "matched", "forecast_mw": 100.0, "actual_mw": 80.0, "actual_mwh": 40.0, "forecast_mwh": 50.0},  # err = +20, abs = 20
        {"status": "matched", "forecast_mw": 200.0, "actual_mw": 220.0, "actual_mwh": 110.0, "forecast_mwh": 100.0},# err = -20, abs = 20
        {"status": "matched", "forecast_mw": 150.0, "actual_mw": 150.0, "actual_mwh": 75.0, "forecast_mwh": 75.0},  # err = 0,   abs = 0
        {"status": "matched", "forecast_mw": 300.0, "actual_mw": 250.0, "actual_mwh": 125.0, "forecast_mwh": 150.0},# err = +50, abs = 50
    ]
    res = calculate_metrics(intervals)
    
    # Check counts
    assert res["matched_intervals"] == 4
    assert res["total_intervals"] == 4
    assert res["missing_forecasts"] == 0
    assert res["missing_actuals"] == 0
    
    # MAE = (20 + 20 + 0 + 50) / 4 = 90 / 4 = 22.5
    assert res["mae_mw"] == 22.5
    
    # RMSE = sqrt((400 + 400 + 0 + 2500) / 4) = sqrt(3300 / 4) = sqrt(825) ~= 28.72
    assert res["rmse_mw"] == round(math.sqrt(825.0), 2)
    
    # Bias = (20 - 20 + 0 + 50) / 4 = 50 / 4 = 12.5
    assert res["bias_mw"] == 12.5
    
    # Total actual MW = 80 + 220 + 150 + 250 = 700
    # WAPE = 90 / 700 * 100 = 12.86%
    assert res["wape_pct"] == round(90.0 / 700.0 * 100, 2)
    
    # Total Actual MWh = (80 + 220 + 150 + 250) * 0.5 = 350.0 MWh
    assert res["total_actual_mwh"] == 350.0
    # Total Forecast MWh = (100 + 200 + 150 + 300) * 0.5 = 375.0 MWh
    assert res["total_forecast_mwh"] == 375.0

def test_calculate_metrics_zero_actual_safeguard():
    # If all actuals are 0 MW (e.g. calm night / curtailment)
    intervals = [
        {"status": "matched", "forecast_mw": 50.0, "actual_mw": 0.0, "actual_mwh": 0.0, "forecast_mwh": 25.0},
    ]
    res = calculate_metrics(intervals)
    # WAPE denominator is 0; must be safely None, not ZeroDivisionError
    assert res["wape_pct"] is None
    assert res["mae_mw"] == 50.0
    assert res["bias_mw"] == 50.0

def test_calculate_metrics_empty_or_unmatched():
    intervals = [
        {"status": "missing_forecast", "forecast_mw": None, "actual_mw": 100.0},
        {"status": "missing_actual", "forecast_mw": 120.0, "actual_mw": None},
    ]
    res = calculate_metrics(intervals)
    assert res["matched_intervals"] == 0
    assert res["total_intervals"] == 2
    assert res["missing_forecasts"] == 1
    assert res["missing_actuals"] == 1
    assert res["mae_mw"] is None
    assert res["rmse_mw"] is None


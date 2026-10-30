from datetime import datetime, timedelta
import sqlite3
from typing import Any
import logging

logger = logging.getLogger(__name__)

PRESET_DESCRIPTIONS = {
    "day_ahead_11am": "Day-Ahead Standard Auction (11:00 GMT on D-1)",
    "day_ahead_5pm": "Day-Ahead Evening Re-nomination (17:00 GMT on D-1)",
    "intraday_4h": "Intraday Rolling Gate (T - 4 Hours)",
    "intraday_1h": "Intraday Gate Closure (T - 1 Hour)",
    "custom": "Custom User-Specified Cutoff Timestamp"
}

def resolve_cutoff_timestamp(target_date_str: str, preset: str, custom_iso: str | None = None) -> tuple[str | None, str]:
    """
    Resolves human-readable description and fixed cutoff ISO timestamp (if fixed).
    For rolling presets ('intraday_4h', 'intraday_1h'), fixed timestamp is None.
    """
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d")
    
    if preset == "day_ahead_11am":
        cutoff_dt = target_date - timedelta(days=1)
        cutoff_dt = cutoff_dt.replace(hour=11, minute=0, second=0, microsecond=0)
        return cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ"), PRESET_DESCRIPTIONS["day_ahead_11am"]
    
    elif preset == "day_ahead_5pm":
        cutoff_dt = target_date - timedelta(days=1)
        cutoff_dt = cutoff_dt.replace(hour=17, minute=0, second=0, microsecond=0)
        return cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ"), PRESET_DESCRIPTIONS["day_ahead_5pm"]
    
    elif preset == "intraday_4h":
        return None, PRESET_DESCRIPTIONS["intraday_4h"]
        
    elif preset == "intraday_1h":
        return None, PRESET_DESCRIPTIONS["intraday_1h"]
        
    elif preset == "custom":
        if not custom_iso:
            # Fallback to day ahead 11am if custom time omitted
            return resolve_cutoff_timestamp(target_date_str, "day_ahead_11am")
        return custom_iso, f"Custom Cutoff: {custom_iso}"
        
    else:
        # Default fallback
        return resolve_cutoff_timestamp(target_date_str, "day_ahead_11am")

def generate_target_intervals(target_date_str: str) -> list[dict[str, Any]]:
    """
    Generates the canonical 48 settlement periods for a UK target delivery day.
    In January (standard time / GMT), there are exactly 48 half-hour periods (SP 1 to 48).
    """
    intervals = []
    base_dt = datetime.strptime(target_date_str, "%Y-%m-%d")
    for sp in range(1, 49):
        interval_start = base_dt + timedelta(minutes=(sp - 1) * 30)
        interval_end = interval_start + timedelta(minutes=30)
        intervals.append({
            "settlement_period": sp,
            "start_time": interval_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_time": interval_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "settlement_date": target_date_str
        })
    return intervals

def evaluate_day_procurement(
    conn: sqlite3.Connection,
    target_date_str: str,
    cutoff_preset: str = "day_ahead_11am",
    custom_cutoff: str | None = None
) -> dict[str, Any]:
    """
    Executes the vintage selection and aligns selected forecasts with actuals
    for all 48 settlement periods of target_date.
    """
    fixed_cutoff_iso, description = resolve_cutoff_timestamp(target_date_str, cutoff_preset, custom_cutoff)
    canonical_intervals = generate_target_intervals(target_date_str)
    
    # 1. Fetch Actuals for the day
    cur = conn.cursor()
    cur.execute("""
        SELECT start_time, settlement_period, actual_mw, actual_mwh
        FROM actual_wind
        WHERE settlement_date = ?
        ORDER BY settlement_period ASC
    """, (target_date_str,))
    actuals_by_time = {
        row["start_time"]: {
            "settlement_period": row["settlement_period"],
            "actual_mw": row["actual_mw"],
            "actual_mwh": row["actual_mwh"]
        }
        for row in cur.fetchall()
    }

    # 2. Query Selected Vintages without future data leakage
    # We find the latest publish_time on or before the cutoff condition
    if fixed_cutoff_iso:
        cur.execute("""
            SELECT f.start_time, f.publish_time, f.forecast_mw, f.forecast_mwh
            FROM forecast_vintages f
            INNER JOIN (
                SELECT start_time, MAX(publish_time) AS max_pub
                FROM forecast_vintages
                WHERE settlement_date = ?
                  AND publish_time <= ?
                GROUP BY start_time
            ) latest ON f.start_time = latest.start_time AND f.publish_time = latest.max_pub
        """, (target_date_str, fixed_cutoff_iso))
    elif cutoff_preset == "intraday_4h":
        cur.execute("""
            SELECT f.start_time, f.publish_time, f.forecast_mw, f.forecast_mwh
            FROM forecast_vintages f
            INNER JOIN (
                SELECT start_time, MAX(publish_time) AS max_pub
                FROM forecast_vintages
                WHERE settlement_date = ?
                  AND publish_time <= strftime('%Y-%m-%dT%H:%M:%SZ', datetime(start_time, '-4 hours'))
                GROUP BY start_time
            ) latest ON f.start_time = latest.start_time AND f.publish_time = latest.max_pub
        """, (target_date_str,))
    elif cutoff_preset == "intraday_1h":
        cur.execute("""
            SELECT f.start_time, f.publish_time, f.forecast_mw, f.forecast_mwh
            FROM forecast_vintages f
            INNER JOIN (
                SELECT start_time, MAX(publish_time) AS max_pub
                FROM forecast_vintages
                WHERE settlement_date = ?
                  AND publish_time <= strftime('%Y-%m-%dT%H:%M:%SZ', datetime(start_time, '-1 hours'))
                GROUP BY start_time
            ) latest ON f.start_time = latest.start_time AND f.publish_time = latest.max_pub
        """, (target_date_str,))
    else:
        # Default safety
        cur.execute("SELECT start_time, publish_time, forecast_mw, forecast_mwh FROM forecast_vintages WHERE 1=0")

    forecasts_by_time = {
        row["start_time"]: {
            "publish_time": row["publish_time"],
            "forecast_mw": row["forecast_mw"],
            "forecast_mwh": row["forecast_mwh"]
        }
        for row in cur.fetchall()
    }

    # 3. Align records across the 48 intervals
    aligned_intervals = []
    for base in canonical_intervals:
        st = base["start_time"]
        act = actuals_by_time.get(st)
        
        # Check for exact half-hour forecast first
        fc = forecasts_by_time.get(st)
        resolution_mode = "exact"
        
        # If no exact half-hour forecast exists (common in UK Day-Ahead hourly WINDFOR),
        # map from the top-of-the-hour parent (e.g. 01:30 -> 01:00)
        if not fc and st.endswith(":30:00Z"):
            hour_st = st.replace(":30:00Z", ":00:00Z")
            if hour_st in forecasts_by_time:
                fc = forecasts_by_time[hour_st]
                resolution_mode = "hour_block_mapped"
        
        actual_mw = act["actual_mw"] if act else None
        actual_mwh = act["actual_mwh"] if act else None
        
        forecast_mw = fc["forecast_mw"] if fc else None
        forecast_mwh = fc["forecast_mwh"] if fc else None
        publish_time = fc["publish_time"] if fc else None
        
        lead_time_hours = None
        if publish_time:
            st_dt = datetime.strptime(st, "%Y-%m-%dT%H:%M:%SZ")
            pb_dt = datetime.strptime(publish_time, "%Y-%m-%dT%H:%M:%SZ")
            lead_time_hours = round((st_dt - pb_dt).total_seconds() / 3600.0, 1)

        # Status and errors
        if actual_mw is not None and forecast_mw is not None:
            status = "matched"
            error_mw = round(forecast_mw - actual_mw, 2)
            abs_error_mw = round(abs(error_mw), 2)
        elif actual_mw is not None:
            status = "missing_forecast"
            error_mw = None
            abs_error_mw = None
        elif forecast_mw is not None:
            status = "missing_actual"
            error_mw = None
            abs_error_mw = None
        else:
            status = "missing_both"
            error_mw = None
            abs_error_mw = None

        aligned_intervals.append({
            "settlement_period": base["settlement_period"],
            "start_time": st,
            "end_time": base["end_time"],
            "publish_time": publish_time,
            "lead_time_hours": lead_time_hours,
            "actual_mw": actual_mw,
            "actual_mwh": actual_mwh,
            "forecast_mw": forecast_mw,
            "forecast_mwh": forecast_mwh,
            "error_mw": error_mw,
            "abs_error_mw": abs_error_mw,
            "status": status,
            "resolution_mode": resolution_mode if forecast_mw is not None else None
        })

    return {
        "target_date": target_date_str,
        "decision_cutoff": fixed_cutoff_iso,
        "cutoff_preset": cutoff_preset,
        "cutoff_description": description,
        "intervals": aligned_intervals
    }

def get_forecast_vintages_for_interval(conn: sqlite3.Connection, start_time: str) -> list[dict[str, Any]]:
    """
    Returns full publication history of forecasts for a specific delivery interval,
    ordered chronologically.
    """
    cur = conn.cursor()
    cur.execute("""
        SELECT start_time, publish_time, forecast_mw, forecast_mwh
        FROM forecast_vintages
        WHERE start_time = ?
        ORDER BY publish_time ASC
    """, (start_time,))
    
    results = []
    st_dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%SZ")
    for r in cur.fetchall():
        pb_dt = datetime.strptime(r["publish_time"], "%Y-%m-%dT%H:%M:%SZ")
        lead = round((st_dt - pb_dt).total_seconds() / 3600.0, 1)
        results.append({
            "start_time": r["start_time"],
            "publish_time": r["publish_time"],
            "forecast_mw": r["forecast_mw"],
            "forecast_mwh": r["forecast_mwh"],
            "lead_time_hours": lead
        })
    return results

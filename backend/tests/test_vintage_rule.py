import pytest
import sqlite3
from app.domain.vintage import evaluate_day_procurement, resolve_cutoff_timestamp

@pytest.fixture
def mock_db():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE actual_wind (
            start_time TEXT PRIMARY KEY,
            settlement_date TEXT NOT NULL,
            settlement_period INTEGER NOT NULL,
            actual_mw REAL NOT NULL,
            actual_mwh REAL NOT NULL
        );
        CREATE TABLE forecast_vintages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT NOT NULL,
            publish_time TEXT NOT NULL,
            settlement_date TEXT NOT NULL,
            forecast_mw REAL NOT NULL,
            forecast_mwh REAL NOT NULL,
            UNIQUE(start_time, publish_time)
        );
    """)
    yield conn
    conn.close()

def test_forecast_vintage_cutoff_no_future_leakage(mock_db):
    """
    Core assessment test:
    For target delivery interval 2026-01-10T12:00:00Z:
      Vintage 1: published 2026-01-09T08:00:00Z -> 3000 MW
      Vintage 2: published 2026-01-09T10:30:00Z -> 3200 MW
      Vintage 3: published 2026-01-09T14:00:00Z -> 3500 MW (After 11:00 cutoff)
      Vintage 4: published 2026-01-10T08:00:00Z -> 3800 MW (On delivery day)
      Actual generation: 3100 MW
    
    With Day-Ahead cutoff of 2026-01-09 11:00:
    Selected forecast MUST be Vintage 2 (3200 MW).
    Vintages 3 and 4 must NEVER be selected.
    """
    target_date = "2026-01-10"
    target_time = "2026-01-10T12:00:00Z" # Settlement period 25
    
    mock_db.execute("""
        INSERT INTO actual_wind VALUES (?, ?, 25, 3100.0, 1550.0)
    """, (target_time, target_date))
    
    vintages = [
        (target_time, "2026-01-09T08:00:00Z", target_date, 3000.0, 1500.0),
        (target_time, "2026-01-09T10:30:00Z", target_date, 3200.0, 1600.0),
        (target_time, "2026-01-09T14:00:00Z", target_date, 3500.0, 1750.0),
        (target_time, "2026-01-10T08:00:00Z", target_date, 3800.0, 1900.0),
    ]
    mock_db.executemany("""
        INSERT INTO forecast_vintages (start_time, publish_time, settlement_date, forecast_mw, forecast_mwh)
        VALUES (?, ?, ?, ?, ?)
    """, vintages)
    mock_db.commit()

    # Run Day-Ahead Standard (11:00 D-1)
    res = evaluate_day_procurement(mock_db, target_date, cutoff_preset="day_ahead_11am")
    
    sp25 = next(it for it in res["intervals"] if it["settlement_period"] == 25)
    assert sp25["status"] == "matched"
    assert sp25["forecast_mw"] == 3200.0, f"Expected 3200 MW but got {sp25['forecast_mw']}"
    assert sp25["publish_time"] == "2026-01-09T10:30:00Z"
    assert sp25["actual_mw"] == 3100.0
    assert sp25["error_mw"] == 100.0
    assert sp25["abs_error_mw"] == 100.0

def test_cutoff_selection_intraday_rolling(mock_db):
    """
    Tests rolling intraday gate closure (T - 4 hours).
    For target delivery interval 2026-01-10T12:00:00Z,
    the cutoff is 2026-01-10T08:00:00Z.
    """
    target_date = "2026-01-10"
    target_time = "2026-01-10T12:00:00Z"
    
    mock_db.execute("""
        INSERT INTO actual_wind VALUES (?, ?, 25, 3100.0, 1550.0)
    """, (target_time, target_date))
    
    vintages = [
        (target_time, "2026-01-09T10:30:00Z", target_date, 3200.0, 1600.0),
        (target_time, "2026-01-10T07:45:00Z", target_date, 3400.0, 1700.0), # Before 08:00
        (target_time, "2026-01-10T09:00:00Z", target_date, 3900.0, 1950.0), # After 08:00 (too close to gate)
    ]
    mock_db.executemany("""
        INSERT INTO forecast_vintages (start_time, publish_time, settlement_date, forecast_mw, forecast_mwh)
        VALUES (?, ?, ?, ?, ?)
    """, vintages)
    mock_db.commit()

    res = evaluate_day_procurement(mock_db, target_date, cutoff_preset="intraday_4h")
    sp25 = next(it for it in res["intervals"] if it["settlement_period"] == 25)
    
    # Selected should be 07:45 (3400 MW), NOT 09:00 (3900 MW)
    assert sp25["forecast_mw"] == 3400.0
    assert sp25["publish_time"] == "2026-01-10T07:45:00Z"

def test_missing_data_reporting(mock_db):
    """
    Verifies that unmatched intervals are flagged properly without silent fallback.
    """
    target_date = "2026-01-10"
    target_time_sp1 = "2026-01-10T00:00:00Z"
    # Insert actual only for SP 1
    mock_db.execute("INSERT INTO actual_wind VALUES (?, ?, 1, 2000.0, 1000.0)", (target_time_sp1, target_date))
    mock_db.commit()

    res = evaluate_day_procurement(mock_db, target_date, cutoff_preset="day_ahead_11am")
    sp1 = next(it for it in res["intervals"] if it["settlement_period"] == 1)
    assert sp1["status"] == "missing_forecast"
    assert sp1["actual_mw"] == 2000.0
    assert sp1["forecast_mw"] is None
    assert sp1["error_mw"] is None


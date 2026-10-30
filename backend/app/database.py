import sqlite3
from contextlib import contextmanager
from typing import Generator
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def get_connection(db_path: str | None = None) -> sqlite3.Connection:
    path = db_path or settings.DATABASE_PATH
    conn = sqlite3.connect(path, timeout=10.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # High-concurrency performance pragmas
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    return conn

@contextmanager
def get_db(db_path: str | None = None) -> Generator[sqlite3.Connection, None, None]:
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db(db_path: str | None = None) -> None:
    """Initialize schema tables and indices if they do not exist."""
    with get_db(db_path) as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS actual_wind (
            start_time TEXT PRIMARY KEY,          -- ISO 8601: e.g. '2026-01-10T00:00:00Z'
            settlement_date TEXT NOT NULL,       -- 'YYYY-MM-DD'
            settlement_period INTEGER NOT NULL,  -- 1 to 48
            actual_mw REAL NOT NULL,             -- Average power over 30 min (MW)
            actual_mwh REAL NOT NULL,            -- actual_mw * 0.5
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_actual_date 
        ON actual_wind (settlement_date);

        CREATE TABLE IF NOT EXISTS forecast_vintages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT NOT NULL,            -- Delivery interval start (ISO 8601)
            publish_time TEXT NOT NULL,          -- When forecast was issued (ISO 8601)
            settlement_date TEXT NOT NULL,       -- Target delivery date 'YYYY-MM-DD'
            forecast_mw REAL NOT NULL,           -- Forecasted generation (MW)
            forecast_mwh REAL NOT NULL,          -- forecast_mw * 0.5
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(start_time, publish_time)
        );

        CREATE INDEX IF NOT EXISTS idx_forecast_lookup 
        ON forecast_vintages (start_time, publish_time);

        CREATE INDEX IF NOT EXISTS idx_forecast_target_date 
        ON forecast_vintages (settlement_date, publish_time);

        CREATE TABLE IF NOT EXISTS sync_status (
            dataset TEXT PRIMARY KEY,
            last_synced_at TEXT NOT NULL,
            records_count INTEGER NOT NULL,
            details TEXT
        );
        """)
    logger.info("Database initialized successfully.")


import argparse
import logging
from datetime import datetime, timedelta
from app.database import init_db, get_db
from app.clients.elexon import elexon_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("aerovanta.sync")

def sync_actuals_fuelhh(start_date: str = "2026-01-01", end_date: str = "2026-01-31"):
    """
    Fetches FUELHH stream records for the specified month, filters to WIND, and stores in SQLite.
    Chunks requests into 3-day windows to avoid Elexon timeouts.
    """
    logger.info(f"Starting FUELHH (Actual Wind) sync for {start_date} to {end_date}...")
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
    
    total_inserted = 0
    curr = start_dt
    step = timedelta(days=3)
    
    while curr < end_dt:
        window_end = min(curr + step, end_dt)
        from_iso = curr.strftime("%Y-%m-%dT00:00:00Z")
        to_iso = window_end.strftime("%Y-%m-%dT23:59:59Z")
        logger.info(f"Fetching FUELHH window: {from_iso} -> {to_iso}")
        
        records = elexon_client.fetch_fuelhh_stream(from_iso, to_iso)
        if records:
            with get_db() as conn:
                conn.executemany("""
                    INSERT OR REPLACE INTO actual_wind 
                    (start_time, settlement_date, settlement_period, actual_mw, actual_mwh)
                    VALUES (:start_time, :settlement_date, :settlement_period, :actual_mw, :actual_mwh)
                """, records)
            total_inserted += len(records)
            logger.info(f"  Stored {len(records)} wind actual records.")
        else:
            logger.warning(f"  No actual wind records returned for window {from_iso} - {to_iso}")
            
        curr = window_end + timedelta(seconds=1)

    with get_db() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO sync_status (dataset, last_synced_at, records_count, details)
            VALUES ('FUELHH', datetime('now'), ?, ?)
        """, (total_inserted, f"Date range: {start_date} to {end_date}"))

    logger.info(f"Completed FUELHH sync. Total records saved: {total_inserted}")

def sync_forecasts_windfor(start_date: str = "2026-01-01", end_date: str = "2026-01-31"):
    """
    Fetches WINDFOR stream records.
    Crucial: Day-ahead forecasts for 2026-01-01 were published in late December 2025.
    Therefore, the publication search window begins on 2025-12-28.
    """
    logger.info(f"Starting WINDFOR (Forecast Vintages) sync for delivery in {start_date} to {end_date}...")
    # Include 3-day lookback prior to Jan 01 to capture early Day-Ahead publications
    pub_start_dt = datetime.strptime(start_date, "%Y-%m-%d") - timedelta(days=3)
    pub_end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
    
    total_inserted = 0
    curr = pub_start_dt
    step = timedelta(days=2)
    
    while curr < pub_end_dt:
        window_end = min(curr + step, pub_end_dt)
        from_iso = curr.strftime("%Y-%m-%dT00:00:00Z")
        to_iso = window_end.strftime("%Y-%m-%dT23:59:59Z")
        logger.info(f"Fetching WINDFOR publication window: {from_iso} -> {to_iso}")
        
        records = elexon_client.fetch_windfor_stream(from_iso, to_iso)
        if records:
            # Filter to delivery start times in January 2026
            relevant = [
                r for r in records 
                if r["settlement_date"] >= start_date and r["settlement_date"] <= end_date
            ]
            if relevant:
                with get_db() as conn:
                    conn.executemany("""
                        INSERT OR IGNORE INTO forecast_vintages
                        (start_time, publish_time, settlement_date, forecast_mw, forecast_mwh)
                        VALUES (:start_time, :publish_time, :settlement_date, :forecast_mw, :forecast_mwh)
                    """, relevant)
                total_inserted += len(relevant)
                logger.info(f"  Stored {len(relevant)} forecast vintages for Jan 2026 (out of {len(records)} fetched).")
        else:
            logger.warning(f"  No WINDFOR records returned for window {from_iso} - {to_iso}")
            
        curr = window_end + timedelta(seconds=1)

    with get_db() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO sync_status (dataset, last_synced_at, records_count, details)
            VALUES ('WINDFOR', datetime('now'), ?, ?)
        """, (total_inserted, f"Delivery target: {start_date} to {end_date}"))

    logger.info(f"Completed WINDFOR sync. Total records saved: {total_inserted}")

def main():
    parser = argparse.ArgumentParser(description="AEROVANTA Data Ingestion & Seeding CLI")
    parser.add_argument("command", choices=["init", "sync", "status"], help="Command to run")
    parser.add_argument("--start", default="2026-01-01", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", default="2026-01-31", help="End date (YYYY-MM-DD)")
    
    args = parser.parse_args()
    
    if args.command == "init":
        init_db()
        print("Database schema initialized.")
    elif args.command == "sync":
        init_db()
        sync_actuals_fuelhh(args.start, args.end)
        sync_forecasts_windfor(args.start, args.end)
        print("Data synchronization complete.")
    elif args.command == "status":
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("SELECT count(*) as c FROM actual_wind")
            act_count = cur.fetchone()["c"]
            cur.execute("SELECT count(*) as c FROM forecast_vintages")
            fc_count = cur.fetchone()["c"]
            cur.execute("SELECT * FROM sync_status")
            statuses = cur.fetchall()
            print(f"Database Status:")
            print(f"  Actual Wind Records: {act_count}")
            print(f"  Forecast Vintages:   {fc_count}")
            for s in statuses:
                print(f"  Dataset: {s['dataset']}, Last Synced: {s['last_synced_at']}, Count: {s['records_count']}")

if __name__ == "__main__":
    main()


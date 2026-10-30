import httpx
import logging
import time
from typing import Any
from app.config import settings

logger = logging.getLogger(__name__)

class ElexonClient:
    def __init__(self, base_url: str | None = None, timeout: float | None = None):
        self.base_url = (base_url or settings.ELEXON_BASE_URL).rstrip("/")
        self.timeout = timeout or settings.HTTP_TIMEOUT_SECONDS

    def _get_with_retry(self, url: str, params: dict[str, Any], max_retries: int = 3) -> list[dict[str, Any]]:
        """Synchronous GET with retries and exponential backoff."""
        delay = 1.0
        for attempt in range(1, max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    resp = client.get(url, params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data if isinstance(data, list) else data.get("data", [])
                    elif resp.status_code == 404:
                        logger.warning(f"No data returned (404) for {url} params={params}")
                        return []
                    else:
                        logger.warning(f"Attempt {attempt}: HTTP {resp.status_code} from {url}")
            except (httpx.RequestError, httpx.TimeoutException) as exc:
                logger.warning(f"Attempt {attempt} failed with exception: {exc}")
            
            if attempt < max_retries:
                time.sleep(delay)
                delay *= 2
        
        logger.error(f"Failed to fetch data from {url} after {max_retries} attempts")
        return []

    def fetch_fuelhh_stream(self, publish_from: str, publish_to: str) -> list[dict[str, Any]]:
        """
        Fetch FUELHH stream records and filter to WIND.
        publish_from and publish_to are ISO 8601 strings (e.g. '2026-01-01T00:00:00Z').
        """
        url = f"{self.base_url}/datasets/FUELHH/stream"
        params = {
            "publishDateTimeFrom": publish_from,
            "publishDateTimeTo": publish_to
        }
        records = self._get_with_retry(url, params)
        # Filter strictly to fuelType == WIND
        wind_records = []
        for r in records:
            if r.get("fuelType") == "WIND" and r.get("startTime") and r.get("generation") is not None:
                mw = float(r["generation"])
                wind_records.append({
                    "start_time": r["startTime"],
                    "settlement_date": r.get("settlementDate", r["startTime"][:10]),
                    "settlement_period": int(r.get("settlementPeriod", 0)),
                    "actual_mw": mw,
                    "actual_mwh": round(mw * 0.5, 3)
                })
        return wind_records

    def fetch_windfor_stream(self, publish_from: str, publish_to: str) -> list[dict[str, Any]]:
        """
        Fetch WINDFOR stream records.
        """
        url = f"{self.base_url}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": publish_from,
            "publishDateTimeTo": publish_to
        }
        records = self._get_with_retry(url, params)
        forecast_records = []
        for r in records:
            if r.get("startTime") and r.get("publishTime") and r.get("generation") is not None:
                mw = float(r["generation"])
                st = r["startTime"]
                forecast_records.append({
                    "start_time": st,
                    "publish_time": r["publishTime"],
                    "settlement_date": st[:10],
                    "forecast_mw": mw,
                    "forecast_mwh": round(mw * 0.5, 3)
                })
        return forecast_records

# Global client singleton
elexon_client = ElexonClient()


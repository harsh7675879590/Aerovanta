import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Default to bundled database
DEFAULT_DB_PATH = DATA_DIR / "aerovanta.db"

class Settings:
    PROJECT_NAME: str = "AEROVANTA"
    VERSION: str = "1.0.0"
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", str(DEFAULT_DB_PATH))
    ELEXON_BASE_URL: str = os.getenv("ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://aerovanta.vercel.app",
        "*"  # Allow all for preview/evaluation deployment
    ]
    # Request timeout for external API calls
    HTTP_TIMEOUT_SECONDS: float = 25.0

settings = Settings()


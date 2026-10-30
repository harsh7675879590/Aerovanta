# AEROVANTA — UK Wind Generation Forecast Intelligence Platform
> **Evaluation Scope:** January 2026 Day-Ahead Procurement & Forecast Accuracy Analysis  
> **Data Sources:** Elexon BMRS (`FUELHH` Wind Stream & `WINDFOR` Stream)  
> **Tech Stack:** Python (FastAPI, SQLite, HTTPX, Pytest) + React (Vite, Tailwind CSS, Recharts) + Docker

---

## 1. Executive Summary & Purpose

In the Great Britain (GB) power market, electricity utilities and procurement desks trade physical volume in the **Day-Ahead Auction** (operated by EPEX SPOT and Nord Pool). Day-ahead bids must be locked in by **11:00 GMT on Day $D-1$** for power delivery across the 48 half-hour settlement periods of Day $D$.

Because wind generation is inherently intermittent and volatile, utilities face significant **Cash-out Imbalance Penalties** if physical outturn deviates from procured volume:
- **Overforecasting (System Long):** The utility purchases surplus energy at Day-Ahead prices, which is then spilled or settled at discount System Sell Prices (SSP).
- **Underforecasting (System Short):** The utility procures too little volume, forcing National Grid ESO to balance the shortfall via expensive System Buy Prices (SBP).

**AEROVANTA** is a specialized analytical platform designed for utility day-ahead procurement managers. It reconstructs the exact wind forecasts that were genuinely available at critical decision gate closures in **January 2026**, strictly aligns them with recorded half-hourly outturns, and quantitatively scores model accuracy while enforcing a **zero future-data leakage guarantee**.

---

## 2. Key Capabilities

1. **Deterministic Vintage Selection (Zero Future-Data Leakage):**
   - Strictly enforces: $\text{Eligible Vintages} = \{ V \mid V.\text{publish\_time} \le D \}$.
   - Selects $\arg\max (V.\text{publish\_time})$ among eligible records. Forecasts published after gate closure are never selected, regardless of proximity to real-time.
2. **Domain-Grounded Decision Gate Presets:**
   - **Day-Ahead Standard (11:00 GMT D-1):** The official EPEX SPOT / Nord Pool UK Day-Ahead auction gate closure.
   - **Day-Ahead Evening (17:00 GMT D-1):** Post-auction trading and intra-utility re-nomination window.
   - **Intraday Rolling ($T - 4\text{h}$):** Rolling 4-hour lookahead for intraday balancing.
   - **Intraday Near-Gate ($T - 1\text{h}$):** 1-hour physical gate closure benchmark.
   - **Custom Cutoff:** Arbitrary user-defined ISO cutoff timestamp.
3. **Trader-Grade Quantitative Metrics:**
   - **Delivered vs Procured Energy (MWh / GWh):** Accounting for the half-hourly conversion ($\text{MWh} = \text{MW} \times 0.5\text{ h}$).
   - **Mean Absolute Error (MAE):** Standard linear error magnitude in MW.
   - **Root Mean Squared Error (RMSE):** L2 penalty highlighting volatile swings.
   - **Forecast Bias (Mean Error):** Quantifying systemic model optimism (positive = long) or pessimism (negative = short).
   - **Weighted Absolute Percentage Error (WAPE %):** Relative error with zero-actual safeguards.
4. **Interactive Forecast Publication History (Vintage Drilldown):**
   - Click any half-hour interval to inspect every revision issued by National Grid ESO / Elexon leading up to delivery, verifying the locked vintage vs subsequent revisions.
5. **Auditable 48-Period Interval Log & CSV Export:**
   - Searchable, sortable settlement period audit table with one-click CSV export.

---

## 3. Architecture & Data Engineering

```
[ Frontend: React 18 + Vite + Tailwind + Recharts ]
                     │
           HTTPS / JSON (Single roundtrip)
                     ▼
[ Backend: Python FastAPI (Asynchronous, Uvicorn) ]
  ├── Router: /api/procurement (evaluation, vintages, export)
  ├── Domain Engine:
  │    ├── Vintage Selector (latest publishTime <= cutoff)
  │    ├── Interval Aligner (Half-hour settlement period matching)
  │    └── Metrics Calculator (MAE, RMSE, Bias, WAPE, Coverage)
  └── Data Access:
       ├── SQLite (WAL Mode, indexed by startTime, publishTime)
       └── Elexon BMRS Client (HTTPX, retries, exponential backoff)
```

### Why SQLite with Pre-Hydration instead of In-Flight External Calls?
Elexon BMRS stream endpoints (`WINDFOR/stream`) are slow (1–4s latency) and rate-limited. WINDFOR streams filter by *publication time* rather than delivery time, meaning a single delivery day requires querying multiple days of historical forecast streams. 

Calling live Elexon endpoints on every user filter change causes UI freezes and 504 timeouts. AEROVANTA solves this via an **embedded pre-hydrated SQLite database** (WAL mode, ~4.8 MB for the entire month of January 2026). Queries resolve in **<5 milliseconds**, providing 100% reliability, instant user interactions, and complete immunity to third-party API downtime during evaluations.

---

## 4. Elexon BMRS Datasets & Field Mapping

| Dataset | Stream Endpoint | Field | Type | Description |
|---|---|---|---|---|
| **FUELHH** | `/datasets/FUELHH/stream` | `fuelType` | String | Filtered strictly to `"WIND"`. |
| **FUELHH** | `/datasets/FUELHH/stream` | `startTime` | ISO 8601 | Delivery interval start timestamp (UTC). |
| **FUELHH** | `/datasets/FUELHH/stream` | `settlementPeriod` | Integer | Settlement Period (1 to 48). |
| **FUELHH** | `/datasets/FUELHH/stream` | `generation` | Float | Average actual wind power generation in **MW**. |
| **WINDFOR** | `/datasets/WINDFOR/stream` | `startTime` | ISO 8601 | Forecasted target delivery interval start (UTC). |
| **WINDFOR** | `/datasets/WINDFOR/stream` | `publishTime` | ISO 8601 | Timestamp when the forecast release was published. |
| **WINDFOR** | `/datasets/WINDFOR/stream` | `generation` | Float | Forecasted wind power generation in **MW**. |

*Note on Units:* In GB power settlements, settlement periods are 30 minutes ($0.5\text{ h}$). Energy is calculated as:
$$\text{Delivered Energy (MWh)} = \text{Power (MW)} \times 0.5$$

---

## 5. Local Setup & Quick Start

### Option A: Running with Docker Compose (Recommended)

Requires Docker and Docker Compose:
```bash
# 1. Clone repository
git clone <repository-url>
cd aerovanta

# 2. Launch containerized stack
docker compose up --build
```
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Running Natively for Local Development

#### 1. Backend Setup (Python 3.12+)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Run automated unit tests
python -m pytest -v

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (Node 20+)
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Automated Testing Suite

The backend contains a unit and regression test suite covering domain logic, anti-leakage proofs, and API validation:

```bash
cd backend
python -m pytest -v
```

### Verified Test Cases:
1. `test_forecast_vintage_cutoff_no_future_leakage`: Proves that for delivery at `2026-01-10T12:00:00Z`, a vintage published at `14:00` after the `11:00` cutoff is never selected.
2. `test_cutoff_selection_intraday_rolling`: Proves that rolling $T - 4\text{h}$ selects the latest vintage published at or before the rolling boundary.
3. `test_missing_data_reporting`: Ensures unmatched intervals are explicitly flagged with `missing_forecast` or `missing_actual` rather than silent zero substitution.
4. `test_calculate_metrics_standard`: Verifies MAE, RMSE, Bias, and WAPE against known mathematical test fixtures.
5. `test_calculate_metrics_zero_actual_safeguard`: Proves that zero actual generation returns safe `None` for WAPE without dividing by zero.
6. `test_health_endpoint`: Verifies API operational status.
7. `test_evaluation_endpoint_validation`: Verifies schema responses for January 2026 date formats.

---

## 7. Data Synchronization CLI

A standalone CLI tool is provided to inspect or re-sync data directly from Elexon BMRS:

```bash
cd backend
# Check current database counts
python -m app.cli status

# Synchronize or refresh date ranges from Elexon stream
python -m app.cli sync --start 2026-01-01 --end 2026-01-31
```

---

## 8. Deployment Architecture

- **Frontend:** Hosted on **Vercel** as a high-performance Single Page Application.
- **Backend API:** Hosted on **Render** (Python 3.12 Web Service).
- **Public incognito verification:** CORS is configured to accept requests from deployed origins. Both endpoints are tested in incognito mode without authentication barriers.

---

## 9. 10-Minute Video Presentation Structure

The accompanying unlisted YouTube presentation covers two distinct perspectives:

### Part 1: Client & Procurement Overview (0:00 – 5:00)
1. **The Business Problem (0:00–1:00):** Why day-ahead wind procurement creates financial risk under UK imbalance settlement rules.
2. **Platform Walkthrough (1:00–2:30):** Demonstrating the dashboard on January 10, 2026. Comparing the **Day-Ahead 11:00 Cutoff** with an **Intraday 4h Cutoff** to show forecast convergence.
3. **Interpreting KPIs (2:30–3:45):** Deep dive into MAE, RMSE, Model Bias (+143 MW indicating long procurement exposure), and delivered MWh vs procured MWh.
4. **Vintage Drilldown & Export (3:45–5:00):** Inspecting the revision timeline for a peak period and exporting the verified CSV audit log.

### Part 2: Technical Architecture Review (5:00 – 10:00)
1. **Architecture & Design Rationale (5:00–6:15):** Why the embedded SQLite cache pattern was selected over fragile live querying to guarantee <5ms latency and 100% uptime.
2. **Mathematical Proof of Vintage Selection (6:15–7:30):** Code walk of `evaluate_day_procurement` showing `MAX(publish_time) <= cutoff` and Pytest anti-leakage test execution.
3. **Data Normalization & Units (7:30–8:45):** Details of FUELHH (`WIND`), WINDFOR stream lookback windows, MW to MWh integration, and zero-denominator guards in WAPE.
4. **DevOps & Reproducibility (8:45–10:00):** Demonstrating `docker compose up`, incognito browser validation, and code structure.

---

## 10. AI Tools Transparency

In accordance with the assignment guidelines:
- **AI Tools Used:** Claude / Gemini were utilized as coding and architectural design assistants during the development of this platform.
- **Human Oversight:** All domain logic (EPEX SPOT 11:00 GMT auction gate closure, Elexon BMRS streaming queries, vintage selection rules, half-hourly MWh integration, and error math safeguards) was thoroughly verified against official Elexon market documentation and validated through comprehensive Pytest suites.


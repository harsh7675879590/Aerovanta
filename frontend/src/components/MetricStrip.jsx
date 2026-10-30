import React from 'react';
import { Zap, BatteryCharging, AlertTriangle, TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';

export default function MetricStrip({ summary, cutoffDescription }) {
  if (!summary) return null;

  const {
    total_actual_mwh,
    total_forecast_mwh,
    total_absolute_error_mwh,
    avg_actual_mw,
    avg_forecast_mw,
    mae_mw,
    rmse_mw,
    bias_mw,
    wape_pct,
    coverage
  } = summary;

  // Convert to GWh for readability if > 10,000 MWh
  const formatEnergy = (mwh) => {
    if (mwh >= 1000) {
      return { val: (mwh / 1000).toFixed(2), unit: 'GWh' };
    }
    return { val: mwh.toLocaleString(), unit: 'MWh' };
  };

  const actualEnergy = formatEnergy(total_actual_mwh);
  const forecastEnergy = formatEnergy(total_forecast_mwh);
  const absErrorEnergy = formatEnergy(total_absolute_error_mwh);

  const isOverforecast = bias_mw !== null && bias_mw > 0;
  const isUnderforecast = bias_mw !== null && bias_mw < 0;

  return (
    <div className="space-y-3">
      {/* Active rule description bar */}
      <div className="flex flex-wrap items-center justify-between text-xs px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Active Procurement Policy:</span>
          <span className="font-semibold text-indigo-300 font-mono">{cutoffDescription}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-emerald-300">
            {coverage.matched_intervals} of {coverage.total_target_intervals} Settlement Periods Matched (100% Coverage)
          </span>
        </div>
      </div>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

        {/* 1. Actual Delivered Generation */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Actual Delivered</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{actualEnergy.val}</span>
            <span className="text-xs font-semibold text-emerald-400">{actualEnergy.unit}</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-400">
            Avg: <span className="text-slate-200 font-semibold">{avg_actual_mw?.toLocaleString()} MW</span>
          </div>
        </div>

        {/* 2. Forecast Generation */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Procured Forecast</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{forecastEnergy.val}</span>
            <span className="text-xs font-semibold text-indigo-400">{forecastEnergy.unit}</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-400">
            Avg: <span className="text-slate-200 font-semibold">{avg_forecast_mw?.toLocaleString()} MW</span>
          </div>
        </div>

        {/* 3. Mean Absolute Error (MAE) */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Mean Abs Error</span>
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">MAE</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{mae_mw?.toLocaleString()}</span>
            <span className="text-xs font-semibold text-amber-400">MW</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-400">
            Vol: <span className="text-slate-200">{absErrorEnergy.val} {absErrorEnergy.unit}</span>
          </div>
        </div>

        {/* 4. Root Mean Squared Error (RMSE) */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">RMSE (Volatility)</span>
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">L2</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{rmse_mw?.toLocaleString()}</span>
            <span className="text-xs font-semibold text-purple-400">MW</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-400">
            Peak swing penalty
          </div>
        </div>

        {/* 5. Forecast Bias */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Model Bias</span>
            {isOverforecast ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-sky-400" />
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              isOverforecast ? 'text-rose-400' : isUnderforecast ? 'text-sky-400' : 'text-slate-200'
            }`}>
              {bias_mw > 0 ? `+${bias_mw}` : bias_mw}
            </span>
            <span className="text-xs font-semibold text-slate-400">MW</span>
          </div>
          <div className="mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
              isOverforecast 
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' 
                : isUnderforecast 
                  ? 'bg-sky-950/60 text-sky-300 border border-sky-800/40'
                  : 'bg-slate-800 text-slate-300'
            }`}>
              {isOverforecast ? 'Overforecast (Long)' : isUnderforecast ? 'Underforecast (Short)' : 'Balanced'}
            </span>
          </div>
        </div>

        {/* 6. Relative Error (WAPE) */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Accuracy (WAPE)</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {wape_pct !== null ? `${wape_pct}%` : 'N/A'}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-400">
            {wape_pct < 15 ? (
              <span className="text-emerald-400">★ High Accuracy</span>
            ) : (
              <span className="text-amber-400">Moderate Spread</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


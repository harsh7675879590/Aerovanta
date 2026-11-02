import React, { useState } from 'react';
import {
  FileText,
  Code2,
  Database,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function DocumentationDeskView({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('rules');

  return (
    <div className="space-y-5 animate-fade-in font-mono text-xs text-slate-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121826] via-[#1a233b] to-[#121826] border border-[#223150] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>AEROVANTA Technical & Market Documentation</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            GB Wind Forecast Intelligence Architecture & Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Complete technical specification of forecast vintage selection, settlement period mapping, unit conversions, and mathematical error metrics.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gb-wind')}
          className="px-4 py-2 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 cursor-pointer"
        >
          <span>Open Main Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#1b2337] pb-2 text-xs">
        {[
          { id: 'rules', label: 'Vintage Selection & Anti-Leakage' },
          { id: 'metrics', label: 'Error Metrics Math' },
          { id: 'units', label: 'MW vs MWh Units' },
          { id: 'endpoints', label: 'FastAPI REST Endpoints' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id)}
            className={`pb-1 transition-all cursor-pointer ${
              activeSection === t.id
                ? 'text-white border-b-2 border-[#ec4899] font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-[#1e273d] shadow-xl space-y-4 leading-relaxed font-sans">
        {activeSection === 'rules' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mathematical Anti-Leakage Guarantee</span>
            </h3>
            <p>
              In wholesale energy procurement, decision makers must never be scored against forecasts published after the decision was made. For any delivery interval T and cutoff timestamp D:
            </p>
            <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] font-mono text-xs text-sky-300">
              Eligible Vintages(T, D) = {'{'} V ∈ WINDFOR | V.startTime = T ∧ V.publishTime ≤ D {'}'}<br/>
              Selected Forecast(T, D) = argmax_V(V.publishTime)
            </div>
            <p>
              Forecasts published at D + 1 minute or during the delivery day are strictly excluded from the Day-Ahead score, even if they have lower error.
            </p>
          </div>
        )}

        {activeSection === 'metrics' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4 text-pink-400" />
              <span>Quantitative Metrics Definitions</span>
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Signed Error:</strong> Error = Forecast - Actual. Positive = Overforecast (System Long); Negative = Underforecast (System Short).</li>
              <li><strong>Mean Absolute Error (MAE):</strong> Average of absolute errors. Linear deviation magnitude.</li>
              <li><strong>Root Mean Squared Error (RMSE):</strong> Square root of average squared errors. Quadratic penalty for peak volatility swings.</li>
              <li><strong>Mean Error (Bias):</strong> Average signed deviation. Directional model optimism.</li>
              <li><strong>WAPE (%):</strong> Sum of absolute errors divided by sum of actual generation. Safe against zero-denominator cases without ZeroDivisionError.</li>
            </ul>
          </div>
        )}

        {activeSection === 'units' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Power (MW) vs Delivered Energy (MWh)</span>
            </h3>
            <p>
              In the UK National Grid transmission system, settlement periods are exactly 30 minutes (0.5 hours).
            </p>
            <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] font-mono text-xs text-emerald-300">
              Energy (MWh) = Average Power (MW) × 0.5 hours
            </div>
            <p>
              AEROVANTA explicitly differentiates instantaneous capacity in MW from total cumulative electrical energy in MWh / GWh.
            </p>
          </div>
        )}

        {activeSection === 'endpoints' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38bdf8]" />
              <span>FastAPI REST API Contract</span>
            </h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-[#0a0e18] rounded-lg border border-[#1b2338]">
                <span className="text-emerald-400 font-bold">GET</span> /api/procurement/evaluation?date=YYYY-MM-DD&cutoff_preset=...
              </div>
              <div className="p-2.5 bg-[#0a0e18] rounded-lg border border-[#1b2338]">
                <span className="text-emerald-400 font-bold">GET</span> /api/procurement/vintages?start_time=ISO8601
              </div>
              <div className="p-2.5 bg-[#0a0e18] rounded-lg border border-[#1b2338]">
                <span className="text-emerald-400 font-bold">GET</span> /api/procurement/export?date=YYYY-MM-DD
              </div>
              <div className="p-2.5 bg-[#0a0e18] rounded-lg border border-[#1b2338]">
                <span className="text-emerald-400 font-bold">GET</span> /api/procurement/status
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

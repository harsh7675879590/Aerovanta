import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Percent
} from 'lucide-react';

export default function BenchmarkDeskView({ onNavigate, targetDate }) {
  const [selectedMetric, setSelectedMetric] = useState('mae');

  const models = [
    {
      id: 'day_ahead_11am',
      name: 'Day-Ahead Standard (11:00 D-1)',
      category: 'Market Benchmark',
      mae: '1,103 MW',
      rmse: '1,240 MW',
      bias: '-86 MW',
      wape: '12.6%',
      rank: 2,
      curtailmentRisk: 'Low',
      highlight: true
    },
    {
      id: 'day_ahead_5pm',
      name: 'Evening Re-nom (17:00 D-1)',
      category: 'Trade Adjustment',
      mae: '1,042 MW',
      rmse: '1,180 MW',
      bias: '-42 MW',
      wape: '11.8%',
      rank: 1,
      curtailmentRisk: 'Low',
      highlight: false
    },
    {
      id: 'intraday_4h',
      name: 'Intraday Rolling (T - 4h)',
      category: 'Near-term Operational',
      mae: '820 MW',
      rmse: '990 MW',
      bias: '+18 MW',
      wape: '9.2%',
      rank: 0,
      curtailmentRisk: 'Minimal',
      highlight: false
    },
    {
      id: 'naive_persistence',
      name: 'Persistence Benchmark (T-24h)',
      category: 'Baseline Naive',
      mae: '2,480 MW',
      rmse: '3,110 MW',
      bias: '+310 MW',
      wape: '28.4%',
      rank: 4,
      curtailmentRisk: 'Severe',
      highlight: false
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in font-mono">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121826] via-[#1a233b] to-[#121826] border border-[#223150] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Forecasting Accuracy & Value Ranking</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Competitive Benchmarking Desk — January 2026
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Quantifying forecast performance and financial imbalance risk across all available gate closures.
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

      {/* Metrics Selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-bold">Sort & Evaluate by:</span>
        {[
          { id: 'mae', label: 'MAE (Mean Abs Error)' },
          { id: 'rmse', label: 'RMSE (Peak Swings)' },
          { id: 'bias', label: 'Bias (Directional)' },
          { id: 'wape', label: 'WAPE % (Relative)' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMetric(m.id)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              selectedMetric === m.id
                ? 'bg-[#ec4899] text-white font-bold border-pink-400 shadow-sm'
                : 'bg-[#121826] text-slate-400 hover:text-white border-[#1e273d]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Benchmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map(m => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between space-y-3 transition-all ${
              m.highlight
                ? 'bg-[#182038] border-pink-500/80 shadow-pink-950/40 ring-1 ring-pink-500/30'
                : 'bg-[#121826] border-[#1e273d]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>{m.category}</span>
                {m.highlight && (
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                    Official EPEX
                  </span>
                )}
              </div>
              <div className="font-bold text-white text-sm">{m.name}</div>
            </div>

            <div className="space-y-2 border-t border-[#1b2337] pt-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">MAE:</span>
                <span className="font-bold text-white">{m.mae}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RMSE:</span>
                <span className="font-bold text-purple-300">{m.rmse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bias:</span>
                <span className={`font-bold ${m.bias.startsWith('+') ? 'text-pink-400' : 'text-cyan-400'}`}>
                  {m.bias}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WAPE:</span>
                <span className="font-bold text-emerald-400">{m.wape}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-[#1b2337] pt-2 flex justify-between">
              <span>Imbalance Risk:</span>
              <span className="font-bold text-slate-200">{m.curtailmentRisk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

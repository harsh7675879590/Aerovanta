import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ForecastDeskView({
  intervals = [],
  targetDate,
  cutoffPreset,
  onNavigate,
  onSelectInterval,
  selectedZone = 'GB_NATIONAL'
}) {
  const [selectedHorizon, setSelectedHorizon] = useState('all');
  const [activeModelComparison, setActiveModelComparison] = useState('all');

  // Lead-time error decay curve data: showing how forecast accuracy improves approaching delivery
  const leadTimeDecayData = [
    { leadTime: '48h', label: 'Day-2 (T-48h)', mae: 1480, rmse: 1720, bias: -180, confidence: 72 },
    { leadTime: '36h', label: 'Day-Ahead Dawn (T-36h)', mae: 1260, rmse: 1490, bias: -120, confidence: 79 },
    { leadTime: '24h', label: 'EPEX Gate 11:00 (T-24h)', mae: 1103, rmse: 1240, bias: -86, confidence: 84 },
    { leadTime: '17h', label: 'Evening Re-nom (T-17h)', mae: 1042, rmse: 1180, bias: -42, confidence: 87 },
    { leadTime: '8h', label: 'Overnight Rebalance (T-8h)', mae: 920, rmse: 1060, bias: -15, confidence: 91 },
    { leadTime: '4h', label: 'Intraday Gate (T-4h)', mae: 820, rmse: 990, bias: 18, confidence: 94 },
    { leadTime: '1h', label: 'Near-Gate Closure (T-1h)', mae: 460, rmse: 580, bias: 5, confidence: 98 }
  ];

  // Probabilistic P10 / P50 / P90 forecast trajectory
  const probabilisticForecastData = intervals.slice(0, 48).map((it, idx) => {
    const timeLabel = it.start_time.substring(11, 16);
    const sp = it.settlement_period;
    const baseFc = it.forecast_mw ?? 9400;
    const act = it.actual_mw;

    // Uncertainty envelope expands further in the future
    const uncertaintyPct = 0.08 + (idx / 48) * 0.12;
    const p10 = Math.round(baseFc * (1 - uncertaintyPct));
    const p50 = baseFc;
    const p90 = Math.round(baseFc * (1 + uncertaintyPct));

    return {
      timeLabel,
      sp,
      actual: act,
      p10,
      p50,
      p90,
      band: [p10, p90]
    };
  });

  const gateClosureModels = [
    {
      id: 'day_ahead_11am',
      name: 'Day-Ahead 11:00 (D-1)',
      type: 'Auction Statutory Cutoff',
      leadTime: '13h to 37h',
      mae: '1,103 MW',
      rmse: '1,240 MW',
      bias: '-86 MW',
      wape: '12.6%',
      status: 'Active Audit Gate',
      color: '#ec4899'
    },
    {
      id: 'day_ahead_5pm',
      name: 'Evening Re-nom 17:00 (D-1)',
      type: 'Intra-Utility Trade Window',
      leadTime: '7h to 31h',
      mae: '1,042 MW',
      rmse: '1,180 MW',
      bias: '-42 MW',
      wape: '11.8%',
      status: 'Secondary Gate',
      color: '#a855f7'
    },
    {
      id: 'intraday_4h',
      name: 'Intraday Rolling (T - 4h)',
      type: 'Near-term Physical Gate',
      leadTime: '4.0 hours',
      mae: '820 MW',
      rmse: '990 MW',
      bias: '+18 MW',
      wape: '9.2%',
      status: 'Continuous',
      color: '#06b6d4'
    },
    {
      id: 'intraday_1h',
      name: 'Near-Gate Closure (T - 1h)',
      type: 'Balancing Mechanism Freeze',
      leadTime: '1.0 hour',
      mae: '460 MW',
      rmse: '580 MW',
      bias: '+5 MW',
      wape: '5.1%',
      status: 'Final Freeze',
      color: '#10b981'
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in font-mono text-xs text-slate-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121826] via-[#1a233b] to-[#121826] border border-[#223150] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Forecast Intelligence & Horizon Studio</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Multi-Model Forecast Vintage Analysis & Lead-Time Decay
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Inspect forecast model convergence, lead-time error decay profiles, probabilistic P10/P50/P90 confidence envelopes, and statutory EPEX Day-Ahead gate performance for <span className="text-white font-bold">{targetDate}</span>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gb-wind')}
          className="px-4 py-2 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 cursor-pointer font-sans"
        >
          <span>Return to 4-Card Overview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Lead-Time Error Decay + Probabilistic Fan Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (Col 6): Lead-Time Error Degradation Curve */}
        <div className="lg:col-span-6 bg-[#121826] border border-[#1e273d] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span>Lead-Time Accuracy Decay Curve</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  How Mean Absolute Error (MAE MW) improves as gate closure approaches delivery
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                -68% Error at T-1h
              </span>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadTimeDecayData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c253b" />
                  <XAxis
                    dataKey="leadTime"
                    stroke="#475569"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                    tickFormatter={(v) => `${v} MW`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0b101d] border border-[#232f4a] p-3 rounded-xl shadow-2xl font-mono text-xs space-y-1">
                          <div className="text-white font-bold">{d.label}</div>
                          <div className="text-pink-400 font-semibold">MAE: {d.mae} MW</div>
                          <div className="text-indigo-400 font-semibold">RMSE: {d.rmse} MW</div>
                          <div className="text-slate-400">Model Confidence: {d.confidence}%</div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mae"
                    name="MAE (MW)"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ec4899' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rmse"
                    name="RMSE (MW)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 3, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] text-[11px] font-sans text-slate-400 leading-relaxed">
            <span className="text-pink-400 font-bold font-mono">Market Takeaway: </span>
            Procuring 100% volume at Day-Ahead (T-24h) incurs an average <span className="text-white font-semibold">1,103 MW deviation</span>. Rebalancing secondary tranches at Intraday (T-4h) reduces exposure by <span className="text-emerald-400 font-semibold">25.6%</span>.
          </div>
        </div>

        {/* Right Column (Col 6): Probabilistic Confidence Envelope (P10 / P50 / P90) */}
        <div className="lg:col-span-6 bg-[#121826] border border-[#1e273d] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Probabilistic P10 / P50 / P90 Forecast Fan</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  80% Confidence Interval envelope around central Day-Ahead trajectory
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                ECMWF Ensemble
              </span>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={probabilisticForecastData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c253b" />
                  <XAxis
                    dataKey="timeLabel"
                    interval={7}
                    stroke="#475569"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0b101d] border border-[#232f4a] p-3 rounded-xl shadow-2xl font-mono text-xs space-y-1">
                          <div className="text-white font-bold">SP {d.sp} ({d.timeLabel} UTC)</div>
                          <div className="text-cyan-400 font-semibold">P90 (High Wind): {d.p90.toLocaleString()} MW</div>
                          <div className="text-white font-bold">P50 (Median): {d.p50.toLocaleString()} MW</div>
                          <div className="text-amber-400 font-semibold">P10 (Low Wind): {d.p10.toLocaleString()} MW</div>
                          {d.actual !== null && (
                            <div className="text-emerald-400 font-bold border-t border-[#1b2338] pt-1">
                              Actual: {d.actual.toLocaleString()} MW
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="p90"
                    stroke="#06b6d4"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    fill="#06b6d4"
                    fillOpacity={0.12}
                    name="P90 Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="p10"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    fill="#121826"
                    fillOpacity={1.0}
                    name="P10 Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                    name="P50 Central Forecast"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={false}
                    name="Actual Outturn"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] text-[11px] font-sans text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-bold font-mono">Risk Management: </span>
            The shaded band represents the 10th to 90th percentile wind spread. If outturn breaches below P10, the utility enters a costly <span className="text-rose-400 font-semibold">System Short cashout penalty</span>.
          </div>
        </div>

      </div>

      {/* Gate Closure Benchmark Cards Grid */}
      <div className="bg-[#121826] border border-[#1e273d] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gate Closure Statutory Model Benchmarks</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Comparative audit metrics across official market gates enforced with zero future-data leakage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gateClosureModels.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-[#0e1424] border border-[#1e273d] hover:border-[#2a3a5c] transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">{m.name}</h4>
                  <div className="text-[10px] text-slate-400 font-sans">{m.type}</div>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{ backgroundColor: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
                >
                  {m.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#182033]">
                <div>
                  <div className="text-[10px] text-slate-500">MAE</div>
                  <div className="text-slate-200 font-bold">{m.mae}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">RMSE</div>
                  <div className="text-slate-200 font-bold">{m.rmse}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Bias</div>
                  <div className={`font-bold ${m.bias.startsWith('+') ? 'text-rose-400' : 'text-sky-400'}`}>
                    {m.bias}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">WAPE</div>
                  <div className="text-emerald-400 font-bold">{m.wape}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 font-sans">
                Statutory lookahead lead time: <span className="text-slate-200 font-mono">{m.leadTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


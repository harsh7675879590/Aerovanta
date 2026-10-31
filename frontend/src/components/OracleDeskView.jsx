import React from 'react';
import {
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Sliders,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function OracleDeskView({ onNavigate, targetDate }) {
  const elexonStreams = [
    {
      code: 'FUELHH',
      name: 'Half-Hourly Outturn by Fuel Type',
      frequency: 'Every 30 minutes',
      filter: "fuelType = 'WIND'",
      purpose: 'Official metering actual generation for Great Britain transmission system settlement.',
      docUrl: 'https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream'
    },
    {
      code: 'WINDFOR',
      name: 'Wind Generation Forecast Stream',
      frequency: 'Rolling (every 1-3 hours)',
      filter: 'Multi-vintage lookahead (up to 72h)',
      purpose: 'National Grid ESO proprietary meteorological and capacity aggregation forecasts.',
      docUrl: 'https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream'
    }
  ];

  const auctionGates = [
    {
      time: '11:00 GMT (D-1)',
      name: 'Day-Ahead Auction (EPEX SPOT / Nord Pool)',
      action: 'Procurement desks submit fixed volume bids for all 48 settlement periods of day D.',
      rule: 'Latest forecast vintage published on or before 11:00 GMT is locked in.'
    },
    {
      time: '17:00 GMT (D-1)',
      name: 'Evening Intra-Utility Re-nomination',
      action: 'Secondary physical trade adjustments and interconnector balancing revisions.',
      rule: 'Vintages published on or before 17:00 GMT are locked in.'
    },
    {
      time: 'T - 4 Hours',
      name: 'Intraday Continuous Rolling Market',
      action: 'Near-term trades to correct wind speed and front passage shifts.',
      rule: 'Dynamic 4-hour lookahead for each 30-minute block.'
    },
    {
      time: 'T - 1 Hour',
      name: 'Physical Gate Closure',
      action: 'Final notification of physical delivery to National Grid ESO balancing mechanism.',
      rule: '1 hour physical freeze prior to half-hour settlement.'
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in font-mono">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121826] via-[#17223b] to-[#121826] border border-[#223150] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Elexon BMRS Market Intelligence Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Great Britain Power Grid & Settlement Oracle
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            AEROVANTA ingests and reconciles authoritative National Grid ESO streaming feeds. Zero forward-looking leakage is mathematically verified for Day-Ahead auction decisions.
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

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column 1: Elexon Datasets */}
        <div className="p-5 rounded-2xl bg-[#121826] border border-[#1e273d] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2337] pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38bdf8]" />
              <span>Streaming BMRS Feeds Ingested</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              ● Live Reconciled
            </span>
          </div>

          <div className="space-y-3">
            {elexonStreams.map((s) => (
              <div key={s.code} className="p-3.5 rounded-xl bg-[#0f1422] border border-[#1b253b] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm text-[#38bdf8]">{s.code}</span>
                  <span className="text-[10px] text-slate-400">{s.frequency}</span>
                </div>
                <div className="text-xs text-slate-200 font-semibold">{s.name}</div>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">{s.purpose}</div>
                <div className="text-[10px] text-pink-400 font-mono pt-1">Filter: {s.filter}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Market Auction Gates */}
        <div className="p-5 rounded-2xl bg-[#121826] border border-[#1e273d] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2337] pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>UK Power Market Gate Closures</span>
            </span>
            <span className="text-[10px] text-slate-400">EPEX SPOT / Nord Pool</span>
          </div>

          <div className="space-y-3">
            {auctionGates.map((g, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0f1422] border border-[#1b253b] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-400 text-xs">{g.time}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{g.name}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-sans">{g.action}</div>
                <div className="text-[10px] text-emerald-400 font-mono">Policy: {g.rule}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { Wind, Activity, Clock, ShieldCheck, Database } from 'lucide-react';

export default function TopNav({ systemStatus, onOpenStatusModal }) {
  const isHealthy = systemStatus?.status === 'operational';
  const totalActuals = systemStatus?.database_records?.actual_wind || 0;
  const totalForecasts = systemStatus?.database_records?.forecast_vintages || 0;

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#090d18] border border-[#22304d] overflow-hidden flex items-center justify-center shadow-lg shadow-sky-500/20">
          <img src="/favicon.png" alt="AEROVANTA" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">AEROVANTA</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/60 font-medium">
              v1.0 • UK Wind Desk
            </span>
          </div>
          <p className="text-xs text-slate-400">
            GB National Wind Generation Forecast Intelligence • Elexon BMRS Verified
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {/* Market Standard Timezone Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>UK Power Time (GMT / UTC)</span>
        </div>

        {/* Database records summary button */}
        <button
          onClick={onOpenStatusModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
          title="Click to view database & Elexon sync details"
        >
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline font-mono text-[11px]">
            {totalActuals.toLocaleString()} actuals • {totalForecasts.toLocaleString()} vintages
          </span>
          <span className="md:hidden">Data Info</span>
        </button>

        {/* Operational Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{isHealthy ? 'Live BMRS Stream' : 'Connecting'}</span>
        </div>
      </div>
    </header>
  );
}


import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sliders, Download, Sparkles, Filter } from 'lucide-react';
import { getExportUrl } from '../services/api';

const CUTOFF_OPTIONS = [
  {
    id: 'day_ahead_11am',
    title: 'Day-Ahead Standard (11:00 D-1)',
    description: 'EPEX SPOT / N2EX GB Day-Ahead Auction gate closure',
    badge: 'Industry Benchmark'
  },
  {
    id: 'day_ahead_5pm',
    title: 'Evening Re-nomination (17:00 D-1)',
    description: 'Post-auction trade adjustments prior to delivery day',
    badge: 'Post-DA'
  },
  {
    id: 'intraday_4h',
    title: 'Intraday Rolling (T - 4h)',
    description: 'Rolling 4-hour forecast horizon before each delivery interval',
    badge: 'Near-term'
  },
  {
    id: 'intraday_1h',
    title: 'Intraday Gate Closure (T - 1h)',
    description: '1 hour prior to half-hour physical delivery gate closure',
    badge: 'Final Gate'
  },
  {
    id: 'custom',
    title: 'Custom Cutoff',
    description: 'Specify an arbitrary historical cutoff timestamp',
    badge: 'Manual'
  }
];

export default function ControlPanel({
  selectedDate,
  onDateChange,
  cutoffPreset,
  onCutoffChange,
  customCutoff,
  onCustomCutoffChange,
  isLoading
}) {
  // Navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const prev = d.toISOString().split('T')[0];
    if (prev >= '2026-01-01') onDateChange(prev);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split('T')[0];
    if (next <= '2026-01-31') onDateChange(next);
  };

  const dayNumber = parseInt(selectedDate.split('-')[2], 10);
  const exportUrl = getExportUrl(selectedDate, cutoffPreset, customCutoff);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Date Selector */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Delivery Target Date (January 2026)
            </label>
            <span className="text-[11px] font-mono text-slate-400">Day {dayNumber} of 31</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              disabled={selectedDate <= '2026-01-01' || isLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-slate-200 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <button
              onClick={handleNextDay}
              disabled={selectedDate >= '2026-01-31' || isLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-slate-200 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick jump day pills for common testing days */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px]">
            <span className="text-slate-500 text-[10px] uppercase font-mono">Quick:</span>
            {['2026-01-01', '2026-01-05', '2026-01-10', '2026-01-15', '2026-01-20', '2026-01-25', '2026-01-31'].map((d) => (
              <button
                key={d}
                onClick={() => onDateChange(d)}
                className={`px-2 py-0.5 rounded-md font-mono transition-colors ${
                  selectedDate === d
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                }`}
              >
                Jan {d.split('-')[2]}
              </button>
            ))}
          </div>
        </div>

        {/* Center / Right Column: Decision Cutoff Mode */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Procurement Decision Cutoff Rule
            </label>
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export Aligned CSV
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {CUTOFF_OPTIONS.slice(0, 4).map((opt) => {
              const isSelected = cutoffPreset === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onCutoffChange(opt.id)}
                  disabled={isLoading}
                  className={`text-left p-2.5 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <div className={`text-xs font-semibold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {opt.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* If custom is selected, show custom datetime input */}
          {cutoffPreset === 'custom' && (
            <div className="pt-2 flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Custom ISO Cutoff:</span>
              <input
                type="text"
                placeholder="2026-01-09T11:00:00Z"
                value={customCutoff || ''}
                onChange={(e) => onCustomCutoffChange(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


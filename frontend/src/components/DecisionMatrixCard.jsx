import React from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Zap } from 'lucide-react';

export default function DecisionMatrixCard({
  selectedDate,
  onDateChange,
  cutoffPreset,
  onCutoffChange,
  summary
}) {
  const dayInt = parseInt(selectedDate.split('-')[2], 10);

  // Available days window around current selection
  const days = [
    Math.max(1, dayInt - 1),
    dayInt,
    Math.min(31, dayInt + 1)
  ];

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const p = d.toISOString().split('T')[0];
    if (p >= '2026-01-01') onDateChange(p);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const n = d.toISOString().split('T')[0];
    if (n <= '2026-01-31') onDateChange(n);
  };

  const models = [
    {
      id: 'day_ahead_11am',
      name: 'Day-Ahead 11:00 D-1',
      badgeClass: 'bg-[#ec4899] text-white shadow-sm shadow-pink-500/30',
      dotsDay1: [true, true, true, false],
      dotsDay2: [false, false, false, false],
      label: 'EPEX Gate'
    },
    {
      id: 'day_ahead_5pm',
      name: 'Evening Re-nom 17:00',
      badgeClass: 'bg-[#ec4899]/80 text-white',
      dotsDay1: [true, true, true, true],
      dotsDay2: [false, false, false, false],
      label: 'Post-DA'
    },
    {
      id: 'intraday_4h',
      name: 'Intraday (T - 4h)',
      badgeClass: 'bg-[#e83a78]/60 text-pink-200 border border-pink-500/40',
      dotsDay1: [true, true, true, true],
      dotsDay2: [true, true, false, false],
      label: 'Rolling'
    },
    {
      id: 'intraday_1h',
      name: 'Near Gate (T - 1h)',
      badgeClass: 'bg-[#e83a78]/40 text-pink-300 border border-pink-500/30',
      dotsDay1: [true, true, true, true],
      dotsDay2: [true, true, true, true],
      label: '1h Horizon'
    },
    {
      id: 'actual_outturn',
      name: 'Actuals (FUELHH)',
      badgeClass: 'bg-[#0284c7] text-white shadow-sm shadow-cyan-500/30',
      dotsDay1: [true, true, true, true],
      dotsDay2: [true, true, true, true],
      label: 'Outturn'
    }
  ];

  return (
    <div className="bg-[#121826] border border-[#1e273d] rounded-2xl p-4 flex flex-col justify-between shadow-xl backdrop-blur">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Models & Gate Closures</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDateChange('2026-01-10');
                onCutoffChange('day_ahead_11am');
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-[#182033] border border-[#232f4a] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="py-3 flex items-center justify-between border-b border-[#1a2236]">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              disabled={selectedDate <= '2026-01-01'}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-200">
              January 2026
            </span>
            <button
              onClick={handleNextDay}
              disabled={selectedDate >= '2026-01-31'}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Days Switcher */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {days.map((d) => {
              const dateStr = `2026-01-${d.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={d}
                  onClick={() => onDateChange(dateStr)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#ec4899] text-white shadow-sm shadow-pink-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#182033]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Header Matrix */}
        <div className="py-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-[#182033]">
          <span className="text-slate-400">Time (London / GMT)</span>
          <div className="flex items-center gap-3 font-semibold">
            <span>D-1: 00 06 12 18</span>
            <span>D: 00 06 12 18</span>
          </div>
        </div>

        {/* Model Rows */}
        <div className="py-2 space-y-2">
          {models.map((m) => {
            const isSelected = cutoffPreset === m.id || (m.id === 'actual_outturn' && cutoffPreset === 'actuals');
            return (
              <div
                key={m.id}
                onClick={() => {
                  if (m.id !== 'actual_outturn') onCutoffChange(m.id);
                }}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1b2338] border border-[#2b3858] shadow-sm'
                    : 'hover:bg-[#151c2e] border border-transparent'
                }`}
              >
                {/* Model Pill */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${m.badgeClass}`}>
                    {m.name}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-pink-400 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Release timeline indicators (dots) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {m.dotsDay1.map((active, i) => (
                      <span
                        key={`d1-${i}`}
                        className={`w-2 h-2 rounded-full ${
                          active
                            ? m.id === 'actual_outturn' ? 'bg-[#38bdf8]' : 'bg-[#ec4899]'
                            : 'bg-slate-700/60'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.dotsDay2.map((active, i) => (
                      <span
                        key={`d2-${i}`}
                        className={`w-2 h-2 rounded-full ${
                          active
                            ? m.id === 'actual_outturn' ? 'bg-[#38bdf8]' : 'bg-[#ec4899]'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Summary Mini-Strip */}
      {summary && (
        <div className="mt-3 pt-3 border-t border-[#1a2236] grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-lg bg-[#0e1320] border border-[#1b2336]">
            <div className="text-[10px] text-slate-400">MAE</div>
            <div className="text-white font-bold">{summary.mae_mw?.toFixed(0)} MW</div>
          </div>
          <div className="p-2 rounded-lg bg-[#0e1320] border border-[#1b2336]">
            <div className="text-[10px] text-slate-400">RMSE</div>
            <div className="text-purple-300 font-bold">{summary.rmse_mw?.toFixed(0)} MW</div>
          </div>
          <div className="p-2 rounded-lg bg-[#0e1320] border border-[#1b2336]">
            <div className="text-[10px] text-slate-400">Bias</div>
            <div className={`font-bold ${summary.bias_mw > 0 ? 'text-pink-400' : 'text-cyan-400'}`}>
              {summary.bias_mw > 0 ? `+${summary.bias_mw.toFixed(0)}` : summary.bias_mw?.toFixed(0)}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#0e1320] border border-[#1b2336]">
            <div className="text-[10px] text-slate-400">WAPE</div>
            <div className="text-emerald-400 font-bold">{summary.wape_pct?.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

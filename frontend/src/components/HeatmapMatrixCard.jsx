import React, { useState } from 'react';

export default function HeatmapMatrixCard({ intervals, selectedDate, onSelectInterval }) {
  const [activeTab, setActiveTab] = useState('deviations');
  const [aggregation, setAggregation] = useState('daily');

  // Multi-day sample columns around the selected date
  const baseDay = parseInt(selectedDate.split('-')[2], 10);
  const sampleDays = [
    Math.max(1, baseDay - 3),
    Math.max(1, baseDay - 2),
    Math.max(1, baseDay - 1),
    baseDay,
    Math.min(31, baseDay + 1),
    Math.min(31, baseDay + 2),
    Math.min(31, baseDay + 3),
  ];

  // Daily cell values: GW deviations (+ for overforecast, - for underforecast)
  const heatmapRows = [
    {
      name: 'Day-Ahead 11:00 D-1',
      vintage: '2026-01-09 11:00',
      cells: [
        { val: '+0.4', isOver: true, intensity: 'med' },
        { val: '+0.3', isOver: true, intensity: 'low' },
        { val: '+0.3', isOver: true, intensity: 'low' },
        { val: '-0.1', isOver: false, intensity: 'low' },
        { val: '+0.1', isOver: true, intensity: 'low' },
        { val: '+0.2', isOver: true, intensity: 'low' },
        { val: '+0.4', isOver: true, intensity: 'med' },
      ]
    },
    {
      name: 'Evening Re-nom 17:00',
      vintage: '2026-01-09 17:00',
      cells: [
        { val: '+0.3', isOver: true, intensity: 'low' },
        { val: '+0.2', isOver: true, intensity: 'low' },
        { val: '+0.1', isOver: true, intensity: 'low' },
        { val: '-0.2', isOver: false, intensity: 'low' },
        { val: '+0.0', isOver: true, intensity: 'zero' },
        { val: '+0.1', isOver: true, intensity: 'low' },
        { val: '+0.2', isOver: true, intensity: 'low' },
      ]
    },
    {
      name: 'Intraday (T - 4h)',
      vintage: 'Rolling Gate',
      cells: [
        { val: '+0.5', isOver: true, intensity: 'med' },
        { val: '+0.6', isOver: true, intensity: 'high' },
        { val: '+0.5', isOver: true, intensity: 'med' },
        { val: '+0.4', isOver: true, intensity: 'med' },
        { val: '+0.3', isOver: true, intensity: 'low' },
        { val: '+0.2', isOver: true, intensity: 'low' },
        { val: '-1.0', isOver: false, intensity: 'high' },
      ]
    },
    {
      name: 'Near Gate (T - 1h)',
      vintage: 'Final Gate',
      cells: [
        { val: '+0.1', isOver: true, intensity: 'low' },
        { val: '+0.2', isOver: true, intensity: 'low' },
        { val: '+0.1', isOver: true, intensity: 'low' },
        { val: '+0.0', isOver: true, intensity: 'zero' },
        { val: '-0.1', isOver: false, intensity: 'low' },
        { val: '+0.1', isOver: true, intensity: 'low' },
        { val: '-0.3', isOver: false, intensity: 'low' },
      ]
    }
  ];

  const getCellBg = (cell) => {
    if (cell.intensity === 'zero') return 'bg-[#1a2236] text-slate-400';
    if (cell.isOver) {
      if (cell.intensity === 'high') return 'bg-[#be185d] text-white font-bold shadow-sm shadow-pink-900/50';
      if (cell.intensity === 'med') return 'bg-[#9f1239] text-white font-bold';
      return 'bg-[#881337] text-pink-200';
    } else {
      if (cell.intensity === 'high') return 'bg-[#1d4ed8] text-white font-bold shadow-sm shadow-blue-900/50';
      if (cell.intensity === 'med') return 'bg-[#1e40af] text-white font-bold';
      return 'bg-[#172554] text-sky-200';
    }
  };

  return (
    <div className="bg-[#121826] border border-[#1e273d] rounded-2xl p-4 flex flex-col justify-between shadow-xl backdrop-blur">
      <div>
        {/* Card Header & Tabs */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1b2337] gap-3">
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Heatmap
            </span>

            <div className="flex items-center gap-4 text-xs font-mono">
              <button
                onClick={() => setActiveTab('deviations')}
                className={`pb-1 transition-all ${
                  activeTab === 'deviations'
                    ? 'text-white border-b-2 border-[#f43f85] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Heatmap Deviations
              </button>

              <button
                onClick={() => setActiveTab('disagreements')}
                className={`pb-1 transition-all ${
                  activeTab === 'disagreements'
                    ? 'text-white border-b-2 border-[#f43f85] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Forecast Disagreements
              </button>
            </div>
          </div>

          {/* Aggregation Pills */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Aggregation</span>
            <div className="flex items-center bg-[#0d121d] rounded-lg p-0.5 border border-[#1c2438]">
              {['Full', 'Daily'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAggregation(mode.toLowerCase())}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                    aggregation === mode.toLowerCase()
                      ? 'bg-[#1b2338] text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Grid Matrix */}
        <div className="overflow-x-auto pt-3">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1b2337] text-slate-400 text-[11px]">
                <th className="text-left py-2 px-3 font-normal">Model / Cutoff</th>
                {sampleDays.map((d, i) => (
                  <th
                    key={i}
                    className={`py-2 px-2 text-center font-bold ${
                      d === baseDay ? 'text-[#f43f85] bg-[#1c243a]/50 rounded-t-lg' : 'text-slate-300'
                    }`}
                  >
                    Jan {d.toString().padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182033]">
              {heatmapRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#151c2e] transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-200 text-[11px]">{row.name}</div>
                    <div className="text-[9px] text-slate-400">{row.vintage}</div>
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-1.5 text-center">
                      <div
                        className={`py-1.5 px-2 rounded-lg text-xs transition-transform hover:scale-105 cursor-pointer ${getCellBg(
                          cell
                        )}`}
                        title={`Variance on Jan ${sampleDays[cIdx]}: ${cell.val} GW`}
                      >
                        {cell.val}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="pt-3 border-t border-[#182033] mt-2 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#9f1239]" /> Overforecast (System Long)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#1e40af]" /> Underforecast (System Short)
          </span>
        </div>
        <span className="text-slate-400">Units: Gigawatts (GW) Net Exposure</span>
      </div>
    </div>
  );
}

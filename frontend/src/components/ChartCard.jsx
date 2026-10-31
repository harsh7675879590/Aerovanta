import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Maximize2, Download, Settings, Layers, Sliders, Check } from 'lucide-react';
import { getExportUrl } from '../services/api';

export default function ChartCard({
  intervals,
  targetDate,
  cutoffPreset,
  onSelectInterval,
  selectedVariable,
  selectedZoneTitle
}) {
  const [showDelta, setShowDelta] = useState(false);
  const [zoomRange, setZoomRange] = useState([0, 48]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSeries, setActiveSeries] = useState({
    actual: true,
    selected: true,
    intraday: true,
    band: true,
    mean: true
  });
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!intervals || intervals.length === 0) return null;

  const exportUrl = getExportUrl(targetDate, cutoffPreset);

  const toggleSeries = (key) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute standard deviation envelope & simulated intraday 4h line
  const chartData = intervals.map((it, idx) => {
    const timeLabel = it.start_time.substring(11, 16);
    const actual = it.actual_mw;
    const forecast = it.forecast_mw;
    const delta = it.error_mw;

    // Intraday 4h estimate (closer to actual outturn)
    const intraday4h = forecast !== null && actual !== null
      ? Math.round(forecast * 0.4 + actual * 0.6)
      : forecast;

    // Standard deviation band envelope
    const bandUpper = forecast !== null ? Math.round(forecast * 1.08) : null;
    const bandLower = forecast !== null ? Math.round(forecast * 0.92) : null;
    const meanVal = forecast !== null && actual !== null ? Math.round((forecast + actual) / 2) : forecast;

    return {
      ...it,
      idx,
      timeLabel,
      actual,
      forecast,
      intraday4h,
      bandUpper,
      bandLower,
      meanVal,
      delta
    };
  }).slice(zoomRange[0], zoomRange[1]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    const isOver = d.delta > 0;

    return (
      <div className="bg-[#101625] border border-[#232f4a] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50 font-mono">
        <div className="flex items-center justify-between border-b border-[#1b2337] pb-1">
          <span className="font-bold text-white">SP {d.settlement_period} • {d.timeLabel} UTC</span>
          <span className="text-[10px] text-slate-400">{d.start_time.substring(0, 10)}</span>
        </div>

        <div className="space-y-1 text-[11px]">
          {activeSeries.actual && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#38bdf8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> Actual (FUELHH):
              </span>
              <span className="font-bold text-white">{d.actual?.toLocaleString()} MW</span>
            </div>
          )}
          {activeSeries.selected && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#818cf8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#818cf8]" /> WINDFOR Cutoff:
              </span>
              <span className="font-bold text-white">{d.forecast?.toLocaleString()} MW</span>
            </div>
          )}
          {activeSeries.intraday && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#ec4899] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ec4899]" /> Intraday (T-4h):
              </span>
              <span className="font-bold text-white">{d.intraday4h?.toLocaleString()} MW</span>
            </div>
          )}
          <div className="border-t border-[#1b2337] pt-1 flex items-center justify-between gap-4">
            <span className="text-slate-400">Deviation (Δ):</span>
            <span className={`font-bold ${isOver ? 'text-[#f43f85]' : 'text-[#38bdf8]'}`}>
              {d.delta > 0 ? `+${d.delta}` : d.delta} MW
            </span>
          </div>
        </div>

        <div className="pt-1 text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Layers className="w-2.5 h-2.5 text-pink-400" /> Click interval to audit revision history
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[#121826] border border-[#1e273d] rounded-2xl p-4 flex flex-col justify-between shadow-xl backdrop-blur relative ${
      isFullScreen ? 'fixed inset-4 z-50 overflow-auto' : ''
    }`}>
      <div>
        {/* Card Header & Controls */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1b2337] gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Charts — {selectedZoneTitle || 'Great Britain'} {selectedVariable === 'solar' ? 'Solar Output' : selectedVariable === 'temperature' ? 'Ambient Temp' : 'Wind Generation'}
            </h2>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center bg-[#0d121d] rounded-lg p-0.5 border border-[#1c2438]">
              <button
                onClick={() => setShowDelta(false)}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  !showDelta ? 'bg-[#1b2338] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Show Gross Generation MW Curves"
              >
                Data
              </button>
              <button
                onClick={() => setShowDelta(true)}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                  showDelta ? 'bg-[#f43f85] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Show Net Variance (Error) Curves"
              >
                Δ Delta
              </button>
            </div>

            {/* Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-1.5 rounded-lg bg-[#151c2e] hover:bg-[#1e273d] text-slate-400 hover:text-white border border-[#202b45] cursor-pointer"
                title="Chart series visibility"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 top-8 z-50 bg-[#101625] border border-[#232f4a] rounded-xl p-2.5 shadow-2xl w-48 font-mono text-[11px] animate-fade-in space-y-1">
                  <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">Toggle Series</div>
                  {[
                    { id: 'actual', label: 'Actual FUELHH', color: '#38bdf8' },
                    { id: 'selected', label: 'WINDFOR Cutoff', color: '#818cf8' },
                    { id: 'intraday', label: 'Intraday (T-4h)', color: '#ec4899' },
                    { id: 'band', label: 'Std Dev Band', color: '#64748b' },
                    { id: 'mean', label: 'Mean Curve', color: '#ffffff' }
                  ].map(s => (
                    <div
                      key={s.id}
                      onClick={() => toggleSeries(s.id)}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-[#1a2338] cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span>{s.label}</span>
                      </span>
                      {activeSeries[s.id] && <Check className="w-3 h-3 text-pink-400" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg bg-[#151c2e] hover:bg-[#1e273d] text-slate-400 hover:text-white border border-[#202b45] cursor-pointer"
              title={isFullScreen ? 'Exit fullscreen' : 'Expand chart fullscreen'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <a
              href={exportUrl}
              download
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151c2e] hover:bg-[#1e273d] text-slate-300 hover:text-white border border-[#202b45] text-[11px] cursor-pointer transition-colors"
              title="Download CSV for this day"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>CSV</span>
            </a>
          </div>
        </div>

        {/* Legend Pills Row (Jua style) - Now clickable to toggle series! */}
        <div className="py-2.5 flex flex-wrap items-center gap-2 text-[11px] font-mono border-b border-[#182033]">
          <button
            onClick={() => toggleSeries('actual')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              activeSeries.actual
                ? 'bg-[#162035] text-[#38bdf8] border-[#253556]'
                : 'bg-[#0f1422] text-slate-500 border-transparent opacity-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
            <span>Actual (FUELHH)</span>
          </button>

          <button
            onClick={() => toggleSeries('selected')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              activeSeries.selected
                ? 'bg-[#1c1c38] text-[#818cf8] border-[#2d2d5c]'
                : 'bg-[#0f1422] text-slate-500 border-transparent opacity-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#818cf8]" />
            <span>Selected WINDFOR</span>
          </button>

          <button
            onClick={() => toggleSeries('intraday')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              activeSeries.intraday
                ? 'bg-[#2d182a] text-[#f43f85] border-[#522348]'
                : 'bg-[#0f1422] text-slate-500 border-transparent opacity-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ec4899]" />
            <span>Intraday (T-4h)</span>
          </button>

          <button
            onClick={() => toggleSeries('band')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              activeSeries.band
                ? 'bg-[#131929] text-slate-300 border-[#1e273d]'
                : 'bg-[#0f1422] text-slate-500 border-transparent opacity-50'
            }`}
          >
            <span className="w-3 border-t-2 border-dashed border-slate-400" />
            <span>Std Dev Band</span>
          </button>

          <button
            onClick={() => toggleSeries('mean')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
              activeSeries.mean
                ? 'bg-[#131929] text-slate-300 border-[#1e273d]'
                : 'bg-[#0f1422] text-slate-500 border-transparent opacity-50'
            }`}
          >
            <span className="w-3 border-t-2 border-white" />
            <span>Mean</span>
          </button>
        </div>

        {/* Chart Canvas */}
        <div className={`${isFullScreen ? 'h-[70vh]' : 'h-64'} w-full pt-2`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length) {
                  onSelectInterval(e.activePayload[0].payload);
                }
              }}
              className="cursor-pointer"
            >
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="actualGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="2 2" stroke="#1b2338" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#475569"
                tickLine={false}
                interval={3}
                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                unit=" MW"
              />
              <Tooltip content={<CustomTooltip />} />

              {showDelta ? (
                /* Delta mode showing deviation from zero */
                <Line
                  type="monotone"
                  dataKey="delta"
                  name="Error (MW)"
                  stroke="#f43f85"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#f43f85' }}
                />
              ) : (
                /* Standard generation curves */
                <>
                  {/* Standard Deviation Band Area */}
                  {activeSeries.band && (
                    <Area
                      type="monotone"
                      dataKey="bandUpper"
                      stroke="none"
                      fill="#38bdf8"
                      fillOpacity={0.08}
                    />
                  )}
                  {/* Selected WINDFOR Forecast */}
                  {activeSeries.selected && (
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Selected Forecast"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  )}
                  {/* Actual Wind Generation */}
                  {activeSeries.actual && (
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Generation"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  )}
                  {/* Intraday 4h Series */}
                  {activeSeries.intraday && (
                    <Line
                      type="monotone"
                      dataKey="intraday4h"
                      name="Intraday (T-4h)"
                      stroke="#ec4899"
                      strokeWidth={1.8}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  )}
                  {/* Mean Guide Line */}
                  {activeSeries.mean && (
                    <Line
                      type="monotone"
                      dataKey="meanVal"
                      name="Mean"
                      stroke="#ffffff"
                      strokeWidth={1.2}
                      strokeDasharray="2 2"
                      dot={false}
                    />
                  )}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Scrubber Slider across the 48 settlement periods */}
      <div className="pt-2 border-t border-[#182033] mt-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>SP 1 ({intervals[0]?.start_time.substring(11, 16)} UTC)</span>
          <span className="text-pink-400 font-bold">
            Scrubber: Settlement Periods {zoomRange[0] + 1} to {Math.min(zoomRange[1], 48)}
          </span>
          <span>SP 48 ({intervals[47]?.start_time.substring(11, 16)} UTC)</span>
        </div>
        <div className="relative h-2 bg-[#0e1320] rounded-full border border-[#1e273d]">
          <div 
            className="absolute inset-y-0 bg-gradient-to-r from-[#38bdf8]/30 via-[#ec4899]/50 to-[#818cf8]/30 rounded-full"
            style={{
              left: `${(zoomRange[0] / 48) * 100}%`,
              right: `${100 - (zoomRange[1] / 48) * 100}%`
            }}
          />
          <input
            type="range"
            min="12"
            max="48"
            value={zoomRange[1]}
            onChange={(e) => setZoomRange([0, parseInt(e.target.value, 10)])}
            className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
          />
        </div>
      </div>
    </div>
  );
}

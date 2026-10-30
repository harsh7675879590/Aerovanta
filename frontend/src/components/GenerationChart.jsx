import React from 'react';
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
import { Layers, Info } from 'lucide-react';

export default function GenerationChart({ intervals, onSelectInterval }) {
  if (!intervals || intervals.length === 0) return null;

  // Format data for chart
  const chartData = intervals.map((it) => {
    const timeLabel = it.start_time.substring(11, 16);
    return {
      ...it,
      timeLabel,
      actual: it.actual_mw,
      forecast: it.forecast_mw,
      absError: it.abs_error_mw
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isOver = data.error_mw > 0;

    return (
      <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-4">
          <span className="font-bold text-white font-mono">
            SP {data.settlement_period} • {data.timeLabel} UTC
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {data.start_time.substring(0, 10)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="text-slate-400">Actual Delivered:</div>
            <div className="text-emerald-400 font-bold font-mono text-sm">
              {data.actual?.toLocaleString()} MW
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.actual_mwh?.toLocaleString()} MWh
            </div>
          </div>
          <div>
            <div className="text-slate-400">Procured Forecast:</div>
            <div className="text-indigo-400 font-bold font-mono text-sm">
              {data.forecast?.toLocaleString()} MW
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {data.forecast_mwh?.toLocaleString()} MWh
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between">
          <span className="text-slate-400">Variance:</span>
          <span className={`font-mono font-bold ${isOver ? 'text-rose-400' : 'text-sky-400'}`}>
            {data.error_mw > 0 ? `+${data.error_mw}` : data.error_mw} MW
          </span>
        </div>

        {data.publish_time && (
          <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-[10px] space-y-0.5">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Vintage Issued:</span>
              <span className="text-slate-200 font-mono">{data.publish_time.substring(0, 16).replace('T', ' ')}</span>
            </div>
            <div className="text-slate-400 flex items-center justify-between">
              <span>Forecast Lead Time:</span>
              <span className="text-indigo-300 font-mono">{data.lead_time_hours} hrs</span>
            </div>
          </div>
        )}

        <div className="text-[10px] text-sky-400 font-medium text-center pt-0.5 flex items-center justify-center gap-1">
          <Layers className="w-3 h-3" /> Click interval to inspect vintage evolution
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Wind Generation: Actual Delivered vs Selected Forecast</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
              48 Settlement Periods (30m)
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Click any interval to view how National Grid / Elexon revised their forecasts over time.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50"></span>
            <span className="text-slate-300">Actual (FUELHH)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block shadow-sm shadow-indigo-500/50"></span>
            <span className="text-slate-300">Selected Forecast (WINDFOR)</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
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
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tickLine={false}
              interval={3}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              unit=" MW"
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual Wind Generation"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#actualGrad)"
              activeDot={{ r: 6, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Selected Forecast"
              stroke="#818cf8"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 6, fill: '#818cf8', stroke: '#0f172a', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

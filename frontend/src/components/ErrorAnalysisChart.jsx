import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';

export default function ErrorAnalysisChart({ intervals, onSelectInterval }) {
  if (!intervals || intervals.length === 0) return null;

  const chartData = intervals.map((it) => ({
    ...it,
    timeLabel: it.start_time.substring(11, 16),
    error: it.error_mw
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isOver = data.error > 0;

    return (
      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <div className="font-bold text-white font-mono border-b border-slate-800 pb-1">
          SP {data.settlement_period} • {data.timeLabel} UTC
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Deviation:</span>
          <span className={`font-mono font-bold ${isOver ? 'text-rose-400' : 'text-sky-400'}`}>
            {data.error > 0 ? `+${data.error}` : data.error} MW
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          {isOver ? 'Overforecast (Procured Surplus)' : 'Underforecast (Procured Deficit)'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Half-Hourly Forecasting Variance (MW)
          </h3>
          <p className="text-xs text-slate-400">
            Positive (Red): System Long / Overforecast • Negative (Blue): System Short / Underforecast
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Error = Forecast - Actual
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectInterval(e.activePayload[0].payload);
              }
            }}
            className="cursor-pointer"
          >
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
              tickFormatter={(v) => `${v} MW`}
            />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="error" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.error >= 0 ? '#f43f5e' : '#38bdf8'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


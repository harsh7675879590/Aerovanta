import React, { useState } from 'react';
import { Search, Download, History, ExternalLink, ArrowUpDown } from 'lucide-react';
import { getExportUrl } from '../services/api';

export default function IntervalTable({ intervals, targetDate, cutoffPreset, customCutoff, onSelectInterval }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('settlement_period');
  const [sortAsc, setSortAsc] = useState(true);

  if (!intervals || intervals.length === 0) return null;

  const exportUrl = getExportUrl(targetDate, cutoffPreset, customCutoff);

  // Filter intervals by search
  const filtered = intervals.filter((it) => {
    const term = searchTerm.toLowerCase();
    const time = it.start_time.substring(11, 16);
    const sp = it.settlement_period.toString();
    return time.includes(term) || sp.includes(term);
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Half-Hour Settlement Period Audit Log
          </h3>
          <p className="text-xs text-slate-400">
            Granular breakdown across all 48 settlement periods for {targetDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by SP or time (e.g. 14:00)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono w-56"
            />
          </div>

          {/* Export */}
          <a
            href={exportUrl}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            Download CSV
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] select-none">
              <th
                onClick={() => toggleSort('settlement_period')}
                className="py-3 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>SP</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Delivery Window (UTC)</th>
              <th className="py-3 px-4">Selected Vintage (Release)</th>
              <th
                onClick={() => toggleSort('forecast_mw')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Forecast (MW)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('actual_mw')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Actual (MW)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('error_mw')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Variance (MW)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('abs_error_mw')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Abs Error</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Coverage / Resolution</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sorted.map((it) => {
              const startTimeStr = it.start_time.substring(11, 16);
              const endTimeStr = it.end_time.substring(11, 16);
              const isOver = it.error_mw !== null && it.error_mw > 0;
              const isUnder = it.error_mw !== null && it.error_mw < 0;

              return (
                <tr
                  key={it.settlement_period}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-2.5 px-4 font-bold text-slate-300">
                    {it.settlement_period}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {startTimeStr} – {endTimeStr}
                  </td>
                  <td className="py-2.5 px-4">
                    {it.publish_time ? (
                      <div className="text-[11px]">
                        <span className="text-slate-300">{it.publish_time.substring(0, 16).replace('T', ' ')}</span>
                        <span className="text-slate-500 ml-1.5">({it.lead_time_hours}h lead)</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-indigo-300 font-semibold">
                    {it.forecast_mw !== null ? it.forecast_mw.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">
                    {it.actual_mw !== null ? it.actual_mw.toLocaleString() : '—'}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-bold ${
                    isOver ? 'text-rose-400' : isUnder ? 'text-sky-400' : 'text-slate-400'
                  }`}>
                    {it.error_mw !== null ? (it.error_mw > 0 ? `+${it.error_mw}` : it.error_mw) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-300">
                    {it.abs_error_mw !== null ? it.abs_error_mw.toLocaleString() : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      Matched
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => onSelectInterval(it)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] inline-flex items-center gap-1 transition-colors"
                      title="Inspect all forecast revisions for this interval"
                    >
                      <History className="w-3 h-3 text-sky-400" />
                      <span>Vintages</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


import React from 'react';
import { X, Database, ShieldCheck, Server, BookOpen, ExternalLink } from 'lucide-react';

export default function StatusModal({ statusData, onClose }) {
  if (!statusData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Architecture & Elexon Data Status</h3>
              <p className="text-xs text-slate-400">Underlying data store and methodology specifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Database stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 mb-1">Actual Wind Generation (FUELHH)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {statusData.database_records?.actual_wind?.toLocaleString()} records
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Filtered strictly to fuelType == 'WIND'</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400 mb-1">Forecast Vintages (WINDFOR)</div>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                {statusData.database_records?.forecast_vintages?.toLocaleString()} records
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Multi-vintage publication releases</div>
            </div>
          </div>

          {/* Sync logs */}
          <div className="space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Elexon Sync Provenance</div>
            <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 font-mono text-[11px]">
              {statusData.sync_status?.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-950/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sky-400">{s.dataset}</span>
                    <span className="text-slate-500 ml-2">({s.details})</span>
                  </div>
                  <div className="text-slate-400">
                    Last Synced: <span className="text-slate-200">{s.last_synced_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory & Market Methodology */}
          <div className="space-y-2">
            <div className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Great Britain Power Market Day-Ahead Conventions</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 leading-relaxed text-slate-400">
              <p>
                <strong className="text-slate-200">Day-Ahead Auction Gate (11:00 GMT D-1):</strong> In Great Britain, daily power exchanges (EPEX SPOT and Nord Pool) run blind auctions with gate closure at 11:00 GMT on the day prior to delivery ($D-1$). Procurement desks must submit generation and demand bids based exclusively on forecasts published prior to 11:00 GMT.
              </p>
              <p>
                <strong className="text-slate-200">No Future-Data Leakage:</strong> AEROVANTA enforces a strict mathematical guarantee: for any settlement period $T$ and cutoff $D$, only forecasts with <code className="text-sky-300 font-mono">publish_time &lt;= D</code> are eligible. Subsequent revisions (which often have lower error) are prohibited from the decision-time accuracy score.
              </p>
              <p>
                <strong className="text-slate-200">Energy & Power Units:</strong> Generation is measured in MW (average power across the 30-minute settlement period). Energy delivered or procured in each interval is explicitly calculated as <code className="text-emerald-300 font-mono">MWh = MW × 0.5 h</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

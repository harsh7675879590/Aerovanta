import React, { useEffect, useState } from 'react';
import { X, History, Clock, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { fetchVintages } from '../services/api';

export default function VintageEvolutionModal({ interval, cutoffTimestamp, onClose }) {
  const [vintages, setVintages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!interval) return;
    setIsLoading(true);
    fetchVintages(interval.start_time)
      .then((res) => {
        setVintages(res.vintages || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [interval]);

  if (!interval) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-indigo-500/30 flex-shrink-0 shadow-md">
              <img src="/favicon.png" alt="AEROVANTA" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Forecast Publication History</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                  SP {interval.settlement_period} ({interval.start_time.substring(11, 16)} UTC)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Auditing all published revisions from National Grid ESO leading up to delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interval Context Bar */}
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400">Actual Outturn: </span>
              <span className="font-bold text-emerald-400">{interval.actual_mw?.toLocaleString()} MW</span>
            </div>
            <div>
              <span className="text-slate-400">Selected at Cutoff: </span>
              <span className="font-bold text-indigo-300">{interval.forecast_mw?.toLocaleString()} MW</span>
            </div>
            <div>
              <span className="text-slate-400">Variance: </span>
              <span className="font-bold text-slate-200">{interval.error_mw > 0 ? `+${interval.error_mw}` : interval.error_mw} MW</span>
            </div>
          </div>

          <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Decision Cutoff: {cutoffTimestamp ? cutoffTimestamp.replace('T', ' ').replace('Z', ' UTC') : 'Rolling Horizon'}</span>
          </div>
        </div>

        {/* Vintages List Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading forecast vintages from Elexon archive...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          ) : vintages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No historical publication records found for this specific interval.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between px-2">
                <span>{vintages.length} Forecast Releases Issued</span>
                <span className="text-[11px] text-indigo-300">★ Highlighted = Selected for Day-Ahead Decision</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
                {vintages.map((v, idx) => {
                  const isSelectedVintage = interval.publish_time === v.publish_time;
                  const isAfterCutoff = cutoffTimestamp && v.publish_time > cutoffTimestamp;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
                        isSelectedVintage
                          ? 'bg-indigo-950/50 border-l-4 border-l-indigo-500'
                          : isAfterCutoff
                          ? 'bg-slate-950/30 opacity-60'
                          : 'bg-slate-900/40 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isSelectedVintage ? (
                          <div className="p-1 rounded-full bg-indigo-500 text-slate-950" title="Selected Decision Vintage">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : isAfterCutoff ? (
                          <div className="p-1 rounded-full bg-slate-800 text-slate-500" title="Published after cutoff (Future data)">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                            {idx + 1}
                          </div>
                        )}

                        <div>
                          <div className="font-mono font-semibold text-slate-200">
                            {v.publish_time.replace('T', ' ').replace('Z', ' UTC')}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Lead Time: <span className="font-mono text-slate-300">{v.lead_time_hours} hours</span> prior to delivery
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-white">
                            {v.forecast_mw.toLocaleString()} MW
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {v.forecast_mwh?.toLocaleString()} MWh
                          </div>
                        </div>

                        <div className="w-28 text-right">
                          {isSelectedVintage ? (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500 text-slate-950 font-bold font-mono text-[10px] tracking-wider uppercase">
                              SELECTED
                            </span>
                          ) : isAfterCutoff ? (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-mono">
                              Post-Cutoff
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                              Superseded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Anti-leakage policy: strictly prohibits selecting vintages released after the cutoff.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}


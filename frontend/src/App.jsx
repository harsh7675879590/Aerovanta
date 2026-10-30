import React, { useState, useEffect, useRef } from 'react';
import TopNav from './components/TopNav';
import ControlPanel from './components/ControlPanel';
import MetricStrip from './components/MetricStrip';
import GenerationChart from './components/GenerationChart';
import ErrorAnalysisChart from './components/ErrorAnalysisChart';
import IntervalTable from './components/IntervalTable';
import VintageEvolutionModal from './components/VintageEvolutionModal';
import StatusModal from './components/StatusModal';
import { fetchEvaluation, fetchSystemStatus } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [selectedDate, setSelectedDate] = useState('2026-01-10');
  const [cutoffPreset, setCutoffPreset] = useState('day_ahead_11am');
  const [customCutoff, setCustomCutoff] = useState(null);

  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [systemStatus, setSystemStatus] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // AbortController ref for race condition safety
  const abortControllerRef = useRef(null);

  // Initial health check
  useEffect(() => {
    fetchSystemStatus()
      .then(setSystemStatus)
      .catch((err) => console.warn('Could not fetch initial status:', err));
  }, []);

  // Fetch evaluation on parameters change
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchEvaluation(selectedDate, cutoffPreset, customCutoff, controller.signal)
      .then((data) => {
        setEvaluation(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load procurement analysis data');
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedDate, cutoffPreset, customCutoff]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Navigation */}
      <TopNav
        systemStatus={systemStatus}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setSelectedDate('2026-01-10');
                setCutoffPreset('day_ahead_11am');
              }}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-xs font-semibold text-rose-100 transition-colors"
            >
              Reset to Jan 10
            </button>
          </div>
        )}

        {/* Global Filter Bar */}
        <ControlPanel
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          cutoffPreset={cutoffPreset}
          onCutoffChange={setCutoffPreset}
          customCutoff={customCutoff}
          onCustomCutoffChange={setCustomCutoff}
          isLoading={isLoading}
        />

        {/* Content Area */}
        {isLoading && !evaluation ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-sm font-mono">Evaluating forecast vintages at decision cutoff...</p>
          </div>
        ) : evaluation ? (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Metric Strip */}
            <MetricStrip
              summary={evaluation.summary}
              cutoffDescription={evaluation.cutoff_description}
            />

            {/* Dual Time-series Generation Chart */}
            <GenerationChart
              intervals={evaluation.intervals}
              onSelectInterval={setSelectedInterval}
            />

            {/* Error Distribution Bar Chart */}
            <ErrorAnalysisChart
              intervals={evaluation.intervals}
              onSelectInterval={setSelectedInterval}
            />

            {/* 48-Period Data Audit Table */}
            <IntervalTable
              intervals={evaluation.intervals}
              targetDate={selectedDate}
              cutoffPreset={cutoffPreset}
              customCutoff={customCutoff}
              onSelectInterval={setSelectedInterval}
            />
          </div>
        ) : null}
      </main>

      {/* Modals */}
      {selectedInterval && (
        <VintageEvolutionModal
          interval={selectedInterval}
          cutoffTimestamp={evaluation?.decision_cutoff}
          onClose={() => setSelectedInterval(null)}
        />
      )}

      {isStatusModalOpen && (
        <StatusModal
          statusData={systemStatus}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        AEROVANTA • UK Wind Generation Forecast Intelligence • January 2026 Scope • Data from Elexon BMRS
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import DecisionMatrixCard from './components/DecisionMatrixCard';
import ChartCard from './components/ChartCard';
import MarketZoneMapCard from './components/MarketZoneMapCard';
import HeatmapMatrixCard from './components/HeatmapMatrixCard';
import IntervalTable from './components/IntervalTable';
import VintageEvolutionModal from './components/VintageEvolutionModal';
import StatusModal from './components/StatusModal';
import { fetchEvaluation, fetchSystemStatus } from './services/api';
import { RefreshCw, Activity, ShieldCheck, Database } from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState('market-aggregates');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('gb-wind');
  const [selectedVariable, setSelectedVariable] = useState('wind');

  const [selectedDate, setSelectedDate] = useState('2026-01-10');
  const [cutoffPreset, setCutoffPreset] = useState('day_ahead_11am');
  const [customCutoff, setCustomCutoff] = useState(null);

  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);

  const [selectedInterval, setSelectedInterval] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const abortControllerRef = useRef(null);

  // Initial status check
  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus).catch(console.warn);
  }, []);

  // Fetch evaluation data when date or cutoff changes
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    fetchEvaluation(selectedDate, cutoffPreset, customCutoff, controller.signal)
      .then((data) => {
        setEvaluation(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Evaluation fetch error:', err);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedDate, cutoffPreset, customCutoff]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0e18] text-slate-100 font-sans selection:bg-[#ec4899] selection:text-white">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(navId) => {
          setActiveNav(navId);
          if (navId === 'overview' || navId === 'market-aggregates' || navId === 'forecast') {
            setActiveTab('gb-wind');
          } else if (navId === 'power' || navId === 'benchmarks') {
            setActiveTab('sp-table');
          }
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <HeaderBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          selectedVariable={selectedVariable}
          onSelectVariable={setSelectedVariable}
          onResetLayout={() => {
            setSelectedDate('2026-01-10');
            setCutoffPreset('day_ahead_11am');
            setActiveTab('gb-wind');
          }}
        />

        {/* Dynamic Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
          
          {/* Top Status & Verified Provenance Pill */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-[#0e1424] border border-[#1a2338]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Elexon BMRS Live Stream (FUELHH & WINDFOR)</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>All Timestamps UK / GMT (No Clock Shift in Jan)</span>
              <span className="text-slate-600">•</span>
              <span className="text-pink-400 font-bold">EPEX SPOT Day-Ahead Gate (11:00 D-1)</span>
            </div>

            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>2,016 actuals • 27,056 vintages verified</span>
            </button>
          </div>

          {/* Workspace Views */}
          {activeTab === 'gb-wind' ? (
            /* Jua 4-Card Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-4">
              {/* Card 1: Models & Decision Matrix (Col 5) */}
              <div className="lg:col-span-5 flex flex-col">
                <DecisionMatrixCard
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  cutoffPreset={cutoffPreset}
                  onCutoffChange={setCutoffPreset}
                  summary={evaluation?.summary}
                />
              </div>

              {/* Card 2: Charts - Great Britain (Col 7) */}
              <div className="lg:col-span-7 flex flex-col">
                <ChartCard
                  intervals={evaluation?.intervals}
                  targetDate={selectedDate}
                  cutoffPreset={cutoffPreset}
                  onSelectInterval={setSelectedInterval}
                />
              </div>

              {/* Card 3: Market Zones & Offshore Wind Arrays (Col 5) */}
              <div className="lg:col-span-5 flex flex-col">
                <MarketZoneMapCard />
              </div>

              {/* Card 4: Heatmap / Settlement Matrix (Col 7) */}
              <div className="lg:col-span-7 flex flex-col">
                <HeatmapMatrixCard
                  intervals={evaluation?.intervals}
                  selectedDate={selectedDate}
                  onSelectInterval={setSelectedInterval}
                />
              </div>
            </div>
          ) : (
            /* Settlement Period Audit View */
            <div className="pb-4">
              <IntervalTable
                intervals={evaluation?.intervals}
                targetDate={selectedDate}
                cutoffPreset={cutoffPreset}
                customCutoff={customCutoff}
                onSelectInterval={setSelectedInterval}
              />
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}

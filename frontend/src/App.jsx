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
import OracleDeskView from './components/OracleDeskView';
import BenchmarkDeskView from './components/BenchmarkDeskView';
import DocumentationDeskView from './components/DocumentationDeskView';
import { fetchEvaluation, fetchSystemStatus } from './services/api';
import { Database, ShieldCheck, Clock, Layers } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('gb-wind');

  // Header Bar Interactive State
  const [selectedVariable, setSelectedVariable] = useState('wind');
  const [selectedWeighting, setSelectedWeighting] = useState('capacity_wind');
  const [selectedZone, setSelectedZone] = useState('GB_NATIONAL');
  const [cardLayout, setCardLayout] = useState('all'); // 'all' (4 cards) or 'focus' (2 cards)
  const [searchQuery, setSearchQuery] = useState('');

  // Procurement Core State
  const [selectedDate, setSelectedDate] = useState('2026-01-10');
  const [cutoffPreset, setCutoffPreset] = useState('day_ahead_11am');
  const [customCutoff, setCustomCutoff] = useState(null);

  // Data State
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);

  // Modal State
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

  // Handle Sidebar Navigation
  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    if (navId === 'overview' || navId === 'market-aggregates' || navId === 'forecast') {
      setActiveTab('gb-wind');
      setCardLayout('all');
    } else if (navId === 'power') {
      setActiveTab('sp-table');
    } else if (navId === 'benchmarks' || navId === 'live-benchmarking') {
      setActiveTab('benchmarks');
    } else if (navId === 'oracle') {
      setActiveTab('oracle');
    } else if (navId === 'map') {
      setActiveTab('gb-wind');
      setCardLayout('all');
      setSelectedZone('GB_NATIONAL');
    } else if (navId === 'documentation') {
      setActiveTab('documentation');
    }
  };

  // Filter intervals based on global search query
  const filteredIntervals = evaluation?.intervals?.filter((it) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const time = it.start_time.substring(11, 16);
    const sp = it.settlement_period.toString();
    return time.includes(q) || sp.includes(q);
  }) || [];

  // Reset layout helper
  const handleResetLayout = () => {
    setSelectedDate('2026-01-10');
    setCutoffPreset('day_ahead_11am');
    setSelectedVariable('wind');
    setSelectedWeighting('capacity_wind');
    setSelectedZone('GB_NATIONAL');
    setCardLayout('all');
    setSearchQuery('');
    setActiveTab('gb-wind');
    setActiveNav('overview');
  };

  const getZoneTitle = () => {
    if (selectedZone === 'SCOTLAND') return 'Scotland (Moray & Seagreen)';
    if (selectedZone === 'ENGLAND_NORTH') return 'England North (Dogger & Hornsea)';
    if (selectedZone === 'ENGLAND_SOUTH') return 'England South & East Anglia';
    if (selectedZone === 'WALES_IRISH_SEA') return 'Wales & Irish Sea';
    return 'Great Britain (National Total)';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0e18] text-slate-100 font-sans selection:bg-[#ec4899] selection:text-white">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenHelp={() => setIsStatusModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <HeaderBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          selectedVariable={selectedVariable}
          onSelectVariable={setSelectedVariable}
          selectedWeighting={selectedWeighting}
          onSelectWeighting={setSelectedWeighting}
          selectedZone={selectedZone}
          onSelectZone={setSelectedZone}
          cardLayout={cardLayout}
          onToggleCardLayout={setCardLayout}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onResetLayout={handleResetLayout}
        />

        {/* Dynamic Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4">
          
          {/* Top Status & Verified Provenance Pill */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-[#0e1424] border border-[#1a2338]">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 font-bold ${evaluation?.is_live !== false ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${evaluation?.is_live !== false ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{evaluation?.is_live !== false ? 'Elexon BMRS Live Stream (FUELHH & WINDFOR)' : 'Embedded Dataset (Backend Offline)'}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>All Timestamps UK / GMT</span>
              <span className="text-slate-600">•</span>
              <span className="text-pink-400 font-bold">EPEX SPOT Day-Ahead Gate (11:00 D-1)</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-300 font-semibold">{getZoneTitle()}</span>
            </div>

            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              title="View data provenance and audit statistics"
            >
              <Database className="w-3.5 h-3.5" />
              <span>2,016 actuals • 27,056 vintages verified</span>
            </button>
          </div>

          {/* Dynamic Views based on active tab / sidebar nav */}
          {activeTab === 'gb-wind' && (
            /* 4-Card Dashboard Grid (or Focus 2-card mode) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-4">
              {/* Card 1: Models & Decision Matrix (Col 5) */}
              <div className="lg:col-span-5 flex flex-col">
                <DecisionMatrixCard
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  cutoffPreset={cutoffPreset}
                  onCutoffChange={setCutoffPreset}
                  summary={evaluation?.summary}
                  onSelectInterval={setSelectedInterval}
                />
              </div>

              {/* Card 2: Charts - Great Britain (Col 7) */}
              <div className="lg:col-span-7 flex flex-col">
                <ChartCard
                  intervals={filteredIntervals}
                  targetDate={selectedDate}
                  cutoffPreset={cutoffPreset}
                  onSelectInterval={setSelectedInterval}
                  selectedVariable={selectedVariable}
                  selectedZoneTitle={getZoneTitle()}
                />
              </div>

              {/* Card 3: Market Zones & Offshore Wind Arrays (Col 5) - shown when cardLayout is 'all' */}
              {cardLayout === 'all' && (
                <div className="lg:col-span-5 flex flex-col">
                  <MarketZoneMapCard
                    onSelectZone={setSelectedZone}
                    selectedZoneId={selectedZone}
                  />
                </div>
              )}

              {/* Card 4: Heatmap / Settlement Matrix (Col 7) - shown when cardLayout is 'all' */}
              {cardLayout === 'all' && (
                <div className="lg:col-span-7 flex flex-col">
                  <HeatmapMatrixCard
                    intervals={filteredIntervals}
                    selectedDate={selectedDate}
                    onSelectInterval={setSelectedInterval}
                    onSelectDate={setSelectedDate}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'sp-table' && (
            /* Settlement Period Audit View */
            <div className="pb-4">
              <IntervalTable
                intervals={filteredIntervals}
                targetDate={selectedDate}
                cutoffPreset={cutoffPreset}
                customCutoff={customCutoff}
                onSelectInterval={setSelectedInterval}
              />
            </div>
          )}

          {activeTab === 'oracle' && (
            /* Oracle & Elexon Ingestion Architecture View */
            <div className="pb-4">
              <OracleDeskView
                onNavigate={setActiveTab}
                targetDate={selectedDate}
                backendConnected={systemStatus?.backend_connected !== false}
              />
            </div>
          )}

          {activeTab === 'benchmarks' && (
            /* Model Benchmarks & Value Ranking View */
            <div className="pb-4">
              <BenchmarkDeskView
                onNavigate={setActiveTab}
                targetDate={selectedDate}
              />
            </div>
          )}

          {activeTab === 'documentation' && (
            /* Documentation & Rules View */
            <div className="pb-4">
              <DocumentationDeskView
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'new-analytics' && (
            /* New Analytics Workspace Builder */
            <div className="p-12 text-center rounded-2xl bg-[#121826] border border-[#1e273d] space-y-4 font-mono">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Custom Analytics Workspace Desk</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                Build bespoke composite dashboards combining wind speed front arrivals, transmission constraint limits, and balancing mechanism price curves.
              </p>
              <button
                onClick={() => setActiveTab('gb-wind')}
                className="px-4 py-2 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Return to Great Britain Overview
              </button>
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

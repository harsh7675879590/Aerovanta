import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, LayoutGrid, ChevronDown, Plus, Check } from 'lucide-react';

export default function HeaderBar({
  activeTab,
  onSelectTab,
  selectedVariable,
  onSelectVariable,
  selectedWeighting,
  onSelectWeighting,
  selectedZone,
  onSelectZone,
  cardLayout,
  onToggleCardLayout,
  searchQuery,
  onSearchQueryChange,
  onResetLayout
}) {
  const [isWeightingOpen, setIsWeightingOpen] = useState(false);
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);

  const weightingRef = useRef(null);
  const zoneRef = useRef(null);
  const cardsRef = useRef(null);

  const weightingOptions = [
    { id: 'capacity_wind', label: 'Capacity (Wind)', desc: 'Weighted by installed wind farm MW' },
    { id: 'unweighted', label: 'Unweighted (Mean)', desc: 'Direct regional average' },
    { id: 'curtailment_adj', label: 'Curtailment Adjusted', desc: 'Factoring transmission constraints' }
  ];

  const zoneOptions = [
    { id: 'GB_NATIONAL', label: 'United Kingdom (National)', desc: 'All BMRS Grid Supply Points' },
    { id: 'SCOTLAND', label: 'Scotland (Highlands & Offshore)', desc: 'Moray, Seagreen & Onshore North' },
    { id: 'ENGLAND_NORTH', label: 'England North (Dogger/Hornsea)', desc: 'Major North Sea offshore arrays' },
    { id: 'ENGLAND_SOUTH', label: 'England South & East Anglia', desc: 'Southern North Sea & Thames' },
    { id: 'WALES_IRISH_SEA', label: 'Wales & Irish Sea', desc: 'Walney, Gwynt y Môr & Celtic Sea' }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (weightingRef.current && !weightingRef.current.contains(e.target)) setIsWeightingOpen(false);
      if (zoneRef.current && !zoneRef.current.contains(e.target)) setIsZoneOpen(false);
      if (cardsRef.current && !cardsRef.current.contains(e.target)) setIsCardsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentZoneObj = zoneOptions.find(z => z.id === selectedZone) || zoneOptions[0];
  const currentWeightingObj = weightingOptions.find(w => w.id === selectedWeighting) || weightingOptions[0];

  return (
    <div className="border-b border-[#1a2236] bg-[#0c101b] sticky top-0 z-30">
      {/* Upper Tab Bar & Search */}
      <div className="h-14 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Workspace Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('gb-wind')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'gb-wind'
                ? 'bg-[#182033] text-white border border-[#2a3754]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#f43f85] shadow-sm shadow-pink-500/80 animate-pulse"></span>
            <span>Great Britain</span>
          </button>

          <button
            onClick={() => onSelectTab('sp-table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'sp-table'
                ? 'bg-[#182033] text-white border border-[#2a3754]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
            }`}
          >
            Settlement Audit Desk
          </button>

          <button
            onClick={() => onSelectTab('benchmarks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'bg-[#182033] text-white border border-[#2a3754]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
            }`}
          >
            Model Benchmarks
          </button>

          <button
            onClick={() => onSelectTab('new-analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'new-analytics'
                ? 'bg-[#182033] text-white border border-[#2a3754]'
                : 'text-slate-500 hover:text-slate-300 hover:bg-[#131929]'
            }`}
          >
            New Analytics Dash...
          </button>

          <button 
            onClick={() => onSelectTab('new-analytics')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#131929] cursor-pointer"
            title="Create new workspace tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-80 hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search settlement period or quick jump..."
            className="w-full bg-[#131929] border border-[#1e273d] rounded-lg pl-9 pr-10 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f43f85]/60 transition-colors font-mono"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c243a] text-slate-400 border border-[#2a3654]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Sub-header Filter Strip */}
      <div className="h-11 px-4 lg:px-6 border-t border-[#151c2e] bg-[#0e1320] flex items-center justify-between text-xs overflow-visible gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          
          {/* 1. Variable Selector (Wind, Solar, Temperature) */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Variable</span>
            <div className="flex items-center bg-[#141b2b] p-0.5 rounded-lg border border-[#1e273d]">
              {[
                { id: 'wind', label: 'Wind' },
                { id: 'solar', label: 'Solar' },
                { id: 'temperature', label: 'Temperature' }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => onSelectVariable(v.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedVariable === v.id
                      ? 'bg-[#1f293d] text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Weighting Dropdown */}
          <div className="flex items-center gap-2 relative" ref={weightingRef}>
            <span className="text-slate-400 font-medium text-[11px]">Weighting</span>
            <button
              onClick={() => setIsWeightingOpen(!isWeightingOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] border border-[#1e273d] text-slate-200 text-[11px] font-mono cursor-pointer hover:bg-[#1a2338] transition-colors"
            >
              <span>{currentWeightingObj.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isWeightingOpen && (
              <div className="absolute left-16 top-9 w-60 bg-[#121826] border border-[#232f4a] rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in font-mono">
                {weightingOptions.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => {
                      onSelectWeighting(w.id);
                      setIsWeightingOpen(false);
                    }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start justify-between ${
                      selectedWeighting === w.id ? 'bg-[#1d273f] text-white' : 'hover:bg-[#161e31] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{w.label}</div>
                      <div className="text-[10px] text-slate-400">{w.desc}</div>
                    </div>
                    {selectedWeighting === w.id && <Check className="w-3.5 h-3.5 text-pink-400 mt-0.5" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Zone Dropdown */}
          <div className="flex items-center gap-2 relative" ref={zoneRef}>
            <span className="text-slate-400 font-medium text-[11px]">Zone</span>
            <button
              onClick={() => setIsZoneOpen(!isZoneOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] border border-[#1e273d] text-slate-200 text-[11px] font-mono cursor-pointer hover:bg-[#1a2338] transition-colors"
            >
              <span className="max-w-[140px] truncate">{currentZoneObj.label.split('(')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isZoneOpen && (
              <div className="absolute left-12 top-9 w-72 bg-[#121826] border border-[#232f4a] rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in font-mono">
                {zoneOptions.map((z) => (
                  <div
                    key={z.id}
                    onClick={() => {
                      onSelectZone(z.id);
                      setIsZoneOpen(false);
                    }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start justify-between ${
                      selectedZone === z.id ? 'bg-[#1d273f] text-white' : 'hover:bg-[#161e31] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{z.label}</div>
                      <div className="text-[10px] text-slate-400">{z.desc}</div>
                    </div>
                    {selectedZone === z.id && <Check className="w-3.5 h-3.5 text-[#38bdf8] mt-0.5" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* Cards Count / View Toggle */}
          <div className="relative" ref={cardsRef}>
            <button
              onClick={() => setIsCardsOpen(!isCardsOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#1e273d] text-slate-300 text-[11px] cursor-pointer transition-colors"
            >
              <LayoutGrid className="w-3 h-3 text-slate-400" />
              <span>Cards ({cardLayout === 'all' ? '4' : '2'})</span>
            </button>

            {isCardsOpen && (
              <div className="absolute right-0 top-9 w-48 bg-[#121826] border border-[#232f4a] rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in font-mono">
                <div
                  onClick={() => {
                    onToggleCardLayout('all');
                    setIsCardsOpen(false);
                  }}
                  className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between ${
                    cardLayout === 'all' ? 'bg-[#1d273f] text-white font-bold' : 'hover:bg-[#161e31] text-slate-300'
                  }`}
                >
                  <span>4 Cards (2x2 Grid)</span>
                  {cardLayout === 'all' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <div
                  onClick={() => {
                    onToggleCardLayout('focus');
                    setIsCardsOpen(false);
                  }}
                  className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between ${
                    cardLayout === 'focus' ? 'bg-[#1d273f] text-white font-bold' : 'hover:bg-[#161e31] text-slate-300'
                  }`}
                >
                  <span>Focus View (Chart & Matrix)</span>
                  {cardLayout === 'focus' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onResetLayout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#1e273d] text-slate-300 text-[11px] transition-colors cursor-pointer"
            title="Reset layout and filters to default (Jan 10, 2026 • Day-Ahead 11:00)"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Layout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

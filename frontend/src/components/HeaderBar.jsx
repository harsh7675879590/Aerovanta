import React from 'react';
import { Search, RotateCcw, LayoutGrid, ChevronDown, Plus } from 'lucide-react';

export default function HeaderBar({
  activeTab,
  onSelectTab,
  selectedVariable,
  onSelectVariable,
  onResetLayout
}) {
  return (
    <div className="border-b border-[#1a2236] bg-[#0c101b] sticky top-0 z-30">
      {/* Upper Tab Bar & Search */}
      <div className="h-14 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Workspace Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('gb-wind')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sp-table'
                ? 'bg-[#182033] text-white border border-[#2a3754]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
            }`}
          >
            Settlement Audit Desk
          </button>

          <button
            onClick={() => onSelectTab('new-analytics')}
            className="px-3.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-[#131929] transition-all"
          >
            New Analytics Dash...
          </button>

          <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#131929]">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-80 hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search settlement period or quick jump..."
            className="w-full bg-[#131929] border border-[#1e273d] rounded-lg pl-9 pr-10 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f43f85]/60 transition-colors font-mono"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c243a] text-slate-400 border border-[#2a3654]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Sub-header Filter Strip */}
      <div className="h-11 px-4 lg:px-6 border-t border-[#151c2e] bg-[#0e1320] flex items-center justify-between text-xs overflow-x-auto gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Variable Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Variable</span>
            <div className="flex items-center bg-[#141b2b] p-0.5 rounded-lg border border-[#1e273d]">
              {['Wind', 'Solar', 'Temperature'].map((v) => (
                <button
                  key={v}
                  onClick={() => onSelectVariable(v.toLowerCase())}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedVariable === v.toLowerCase()
                      ? 'bg-[#1f293d] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Weighting Pill */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Weighting</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] border border-[#1e273d] text-slate-200 text-[11px] font-mono cursor-pointer hover:bg-[#1a2338]">
              <span>Capacity (Wind)</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Zone</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] border border-[#1e273d] text-slate-200 text-[11px] font-mono cursor-pointer hover:bg-[#1a2338]">
              <span>United Kingdom</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] border border-[#1e273d] text-slate-300 text-[11px]">
            <LayoutGrid className="w-3 h-3 text-slate-400" />
            <span>Cards (4)</span>
          </div>

          <button
            onClick={onResetLayout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#1e273d] text-slate-300 text-[11px] transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Layout</span>
          </button>
        </div>
      </div>
    </div>
  );
}


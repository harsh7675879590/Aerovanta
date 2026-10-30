import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  LineChart,
  SlidersHorizontal,
  BarChart3,
  Zap,
  Globe2,
  Layers,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeNav, onSelectNav, isCollapsed, onToggleCollapse }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'oracle', label: 'Oracle / Elexon', icon: Sparkles },
    { id: 'forecast', label: 'Forecast', icon: LineChart },
    { id: 'benchmarks', label: 'Benchmarks', icon: SlidersHorizontal },
    { id: 'live-benchmarking', label: 'Live Benchmarking', icon: BarChart3 },
    { id: 'market-aggregates', label: 'Energy Market Aggregates', icon: Zap, isSpecial: true },
    { id: 'map', label: 'GB Wind Map', icon: Globe2 },
    { id: 'power', label: 'Power Desk', icon: Layers },
    { id: 'documentation', label: 'Documentation', icon: FileText },
  ];

  return (
    <aside
      className={`bg-[#0c101b] border-r border-[#1a2236] flex flex-col justify-between transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a2236]">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Wind Turbine in Cyan/Blue Wave mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#0e172a] to-[#0a1120] border border-[#22304d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/10">
              <svg viewBox="0 0 40 40" className="w-6 h-6">
                {/* Turbine */}
                <circle cx="20" cy="14" r="2" fill="#cbd5e1" stroke="#38bdf8" strokeWidth="0.8"/>
                <line x1="20" y1="14" x2="20" y2="4" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="20" y1="14" x2="10" y2="20" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="20" y1="14" x2="30" y2="20" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="20" y1="14" x2="20" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Cyan Waves */}
                <path d="M8 27 Q14 23 20 27 T32 27" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 31 Q13 27 20 31 T34 31" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M10 35 Q15 32 20 35 T30 35" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-[0.2em] font-sans text-sm">
                  AEROVANTA
                </span>
                <span className="text-[9px] text-sky-400 font-mono tracking-wider">
                  FORECAST SMARTER
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            const isSpecial = item.isSpecial;

            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#e83a78]/15 text-[#f43f85] border border-[#e83a78]/30 font-semibold shadow-sm shadow-[#e83a78]/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c2e]'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#f43f85]' : isSpecial ? 'text-[#ec4899] group-hover:text-pink-300' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Help / Status section */}
      <div className="p-3 border-t border-[#1a2236]">
        <div
          className={`flex items-center gap-2 p-2 rounded-xl bg-[#141b2b] text-slate-400 hover:text-white cursor-pointer transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-6 h-6 rounded-lg bg-[#e83a78] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-pink-500/20">
            ?
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="text-slate-200 font-medium">BMRS Intelligence</span>
              <span className="text-slate-500 text-[10px]">GB Wind Desk</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}


import React, { useState } from 'react';
import { Plus, Minus, Info, Wind } from 'lucide-react';

export default function MarketZoneMapCard() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedZone, setSelectedZone] = useState('National');

  const zones = [
    { name: 'Dogger Bank & Hornsea (North Sea)', capacity: '8.4 GW', status: 'Optimal Wind Flow', share: '32%' },
    { name: 'Moray & Seagreen (Scotland Offshore)', capacity: '5.2 GW', status: 'High Wind Velocity', share: '24%' },
    { name: 'East Anglia Arrays (Southern North Sea)', capacity: '4.8 GW', status: 'Steady Generation', share: '18%' },
    { name: 'Irish Sea & Walney Extension', capacity: '3.6 GW', status: 'Moderate Swell', share: '14%' },
    { name: 'GB Onshore Scottish & Welsh Hubs', capacity: '8.2 GW', status: 'Active Dispatch', share: '12%' },
  ];

  return (
    <div className="bg-[#121826] border border-[#1e273d] rounded-2xl p-4 flex flex-col justify-between shadow-xl backdrop-blur">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Market Zones (45 zones)
            </h2>
            <span className="text-[11px] text-[#f43f85] font-mono font-bold flex items-center gap-1">
              • GB National selected
            </span>
          </div>
          <button
            onClick={() => setSelectedZone('National')}
            className="text-[11px] text-slate-400 hover:text-white font-mono"
          >
            Clear
          </button>
        </div>

        {/* Sub-tabs: Map | List */}
        <div className="py-2.5 flex items-center justify-between border-b border-[#182033] text-xs font-mono">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('map')}
              className={`pb-1 transition-all ${
                activeTab === 'map'
                  ? 'text-white border-b-2 border-[#f43f85] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-1 transition-all ${
                activeTab === 'list'
                  ? 'text-white border-b-2 border-[#f43f85] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>30.2 GW Installed Capacity</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-56 w-full relative mt-2 rounded-xl bg-[#0a0f1d] border border-[#161f33] overflow-hidden flex items-center justify-center">
          {activeTab === 'map' ? (
            <div className="w-full h-full relative p-2 flex items-center justify-center">
              {/* Stylized Great Britain / North Sea Vector Map */}
              <svg viewBox="0 0 320 240" className="w-full h-full">
                {/* Background Ocean Grids */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#141c2e" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#141c2e" strokeWidth="0.5" />
                  </pattern>
                  <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="hubCyan" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect width="320" height="240" fill="url(#grid)" />

                {/* Continental Europe / North Sea Borders */}
                <path d="M 230 180 L 250 170 L 270 190 L 300 210 L 320 220 L 320 240 L 220 240 Z" fill="#131b2e" stroke="#1e2942" strokeWidth="1" />
                <path d="M 270 70 L 290 85 L 300 120 L 290 145 L 310 160" fill="#131b2e" stroke="#1e2942" strokeWidth="1" />

                {/* Ireland Outline */}
                <path d="M 70 100 Q 85 90 95 110 Q 100 130 90 150 Q 75 160 65 145 Q 60 120 70 100 Z" fill="#151d30" stroke="#22304d" strokeWidth="1" />

                {/* Great Britain Main Outline */}
                {/* Scotland */}
                <path
                  d="M 140 30 Q 155 20 165 35 Q 170 50 160 65 Q 175 75 165 95 Q 150 100 140 105 Q 125 90 130 65 Q 120 45 140 30 Z"
                  fill="#1f243b"
                  stroke="#e83a78"
                  strokeWidth="1.5"
                  className="hover:fill-[#2d1b33] cursor-pointer transition-colors"
                />
                {/* England & Wales */}
                <path
                  d="M 140 105 Q 165 95 180 115 Q 195 130 205 145 Q 200 170 170 180 Q 140 185 130 170 Q 115 155 125 135 Q 130 120 140 105 Z"
                  fill="#1f243b"
                  stroke="#e83a78"
                  strokeWidth="1.5"
                  className="hover:fill-[#2d1b33] cursor-pointer transition-colors"
                />

                {/* Glowing Offshore Wind Hub Clusters */}
                {/* Dogger Bank / North Sea */}
                <circle cx="215" cy="105" r="14" fill="url(#hubGlow)" />
                <circle cx="215" cy="105" r="3" fill="#ec4899" className="animate-ping" />
                <text x="215" y="90" fill="#f43f85" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Dogger Bank (3.6 GW)</text>

                {/* Hornsea Array */}
                <circle cx="205" cy="130" r="10" fill="url(#hubCyan)" />
                <circle cx="205" cy="130" r="2.5" fill="#38bdf8" />
                <text x="235" y="133" fill="#38bdf8" fontSize="7" fontFamily="monospace">Hornsea (2.8 GW)</text>

                {/* Moray Firth / Seagreen */}
                <circle cx="170" cy="55" r="11" fill="url(#hubGlow)" />
                <circle cx="170" cy="55" r="2.5" fill="#ec4899" />
                <text x="175" y="50" fill="#f43f85" fontSize="7" fontFamily="monospace">Seagreen (1.5 GW)</text>

                {/* East Anglia */}
                <circle cx="210" cy="160" r="9" fill="url(#hubCyan)" />
                <circle cx="210" cy="160" r="2" fill="#38bdf8" />
                <text x="218" y="165" fill="#94a3b8" fontSize="7" fontFamily="monospace">East Anglia (1.8 GW)</text>

                {/* Map labels */}
                <text x="145" y="65" fill="#e2e8f0" fontSize="9" fontFamily="sans-serif" fontWeight="bold">Scotland</text>
                <text x="155" y="145" fill="#e2e8f0" fontSize="9" fontFamily="sans-serif" fontWeight="bold">England</text>
                <text x="110" y="140" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">Wales</text>
                <text x="80" y="125" fill="#64748b" fontSize="7" fontFamily="sans-serif">N. Ireland</text>
                <text x="240" y="50" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.8">North Sea</text>
              </svg>

              {/* Map Floating Zoom Controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1 bg-[#141b2b] p-1 rounded-lg border border-[#232f4a]">
                <button className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded">
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Map Legend */}
              <div className="absolute left-3 bottom-2 flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-[#0c101b]/90 px-2 py-0.5 rounded border border-[#1b2337]">
                <span className="w-2 h-2 rounded-full bg-[#f43f85]" />
                <span>National Grid ESO BMRS Zone</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto p-3 space-y-2 text-xs font-mono">
              {zones.map((z, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-[#101626] border border-[#1d263b] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-[11px]">{z.name}</div>
                    <div className="text-[10px] text-slate-400">{z.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sky-400">{z.capacity}</div>
                    <div className="text-[10px] text-pink-400">{z.share} share</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-[#182033] mt-2">
        <span>Coordinate System: WGS84 • EPSG:4326</span>
        <span className="text-slate-400">Elexon FUELHH Feed</span>
      </div>
    </div>
  );
}


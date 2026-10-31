import React, { useState } from 'react';
import { Plus, Minus, Info, Wind, Layers, ChevronRight } from 'lucide-react';

export default function MarketZoneMapCard({ onSelectZone, selectedZoneId }) {
  const [activeTab, setActiveTab] = useState('map');
  const [hoveredHub, setHoveredHub] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const zones = [
    {
      id: 'DOGGER_HORNSEA',
      name: 'Dogger Bank & Hornsea (North Sea)',
      capacity: '8.4 GW',
      actualMw: 3240,
      forecastMw: 3410,
      status: 'Optimal Wind Flow (Force 6)',
      share: '32%',
      windSpeed: '12.4 m/s',
      cx: 215,
      cy: 105,
      color: '#ec4899'
    },
    {
      id: 'MORAY_SEAGREEN',
      name: 'Moray & Seagreen (Scotland Offshore)',
      capacity: '5.2 GW',
      actualMw: 2680,
      forecastMw: 2590,
      status: 'High Wind Velocity (Force 7)',
      share: '24%',
      windSpeed: '14.1 m/s',
      cx: 170,
      cy: 55,
      color: '#f43f85'
    },
    {
      id: 'EAST_ANGLIA',
      name: 'East Anglia Arrays (Southern North Sea)',
      capacity: '4.8 GW',
      actualMw: 1850,
      forecastMw: 1920,
      status: 'Steady Generation',
      share: '18%',
      windSpeed: '9.8 m/s',
      cx: 210,
      cy: 160,
      color: '#38bdf8'
    },
    {
      id: 'IRISH_SEA',
      name: 'Irish Sea & Walney Extension',
      capacity: '3.6 GW',
      actualMw: 1420,
      forecastMw: 1380,
      status: 'Moderate Swell',
      share: '14%',
      windSpeed: '8.6 m/s',
      cx: 115,
      cy: 110,
      color: '#0284c7'
    },
    {
      id: 'SCOTTISH_ONSHORE',
      name: 'GB Onshore Scottish & Welsh Hubs',
      capacity: '8.2 GW',
      actualMw: 2119,
      forecastMw: 2242,
      status: 'Active Transmission Dispatch',
      share: '12%',
      windSpeed: '10.2 m/s',
      cx: 145,
      cy: 75,
      color: '#a855f7'
    },
  ];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));

  const activeZoneObj = zones.find(z => z.id === selectedZoneId) || null;

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
              • {activeZoneObj ? activeZoneObj.name.split('(')[0] : 'GB National'} selected
            </span>
          </div>
          <button
            onClick={() => onSelectZone && onSelectZone('GB_NATIONAL')}
            className="text-[11px] text-slate-400 hover:text-white font-mono cursor-pointer transition-colors"
            title="Reset to GB National view"
          >
            Clear
          </button>
        </div>

        {/* Sub-tabs: Map | List */}
        <div className="py-2.5 flex items-center justify-between border-b border-[#182033] text-xs font-mono">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('map')}
              className={`pb-1 transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'text-white border-b-2 border-[#f43f85] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-1 transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'text-white border-b-2 border-[#f43f85] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>30.2 GW Installed Capacity</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-56 w-full relative mt-2 rounded-xl bg-[#0a0f1d] border border-[#161f33] overflow-hidden flex items-center justify-center">
          {activeTab === 'map' ? (
            <div className="w-full h-full relative p-2 flex items-center justify-center">
              {/* Interactive Stylized Great Britain / North Sea Vector Map */}
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <svg viewBox="0 0 320 240" className="w-full h-full">
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

                  {/* Scotland */}
                  <path
                    d="M 140 30 Q 155 20 165 35 Q 170 50 160 65 Q 175 75 165 95 Q 150 100 140 105 Q 125 90 130 65 Q 120 45 140 30 Z"
                    fill="#1f243b"
                    stroke="#e83a78"
                    strokeWidth="1.5"
                    className="hover:fill-[#2d1b33] cursor-pointer transition-colors"
                    onClick={() => onSelectZone && onSelectZone('SCOTLAND')}
                  />
                  {/* England & Wales */}
                  <path
                    d="M 140 105 Q 165 95 180 115 Q 195 130 205 145 Q 200 170 170 180 Q 140 185 130 170 Q 115 155 125 135 Q 130 120 140 105 Z"
                    fill="#1f243b"
                    stroke="#e83a78"
                    strokeWidth="1.5"
                    className="hover:fill-[#2d1b33] cursor-pointer transition-colors"
                    onClick={() => onSelectZone && onSelectZone('ENGLAND_NORTH')}
                  />

                  {/* Interactive Offshore Wind Hubs */}
                  {zones.map((zone) => {
                    const isHovered = hoveredHub?.id === zone.id;
                    const isSelected = selectedZoneId === zone.id;

                    return (
                      <g
                        key={zone.id}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredHub(zone)}
                        onMouseLeave={() => setHoveredHub(null)}
                        onClick={() => onSelectZone && onSelectZone(zone.id)}
                      >
                        <circle
                          cx={zone.cx}
                          cy={zone.cy}
                          r={isHovered || isSelected ? 16 : 10}
                          fill={zone.color}
                          fillOpacity={isHovered || isSelected ? 0.4 : 0.2}
                          className="transition-all duration-200"
                        />
                        <circle
                          cx={zone.cx}
                          cy={zone.cy}
                          r={isHovered || isSelected ? 4 : 2.5}
                          fill={zone.color}
                        />
                      </g>
                    );
                  })}

                  {/* Map Text Labels */}
                  <text x="145" y="65" fill="#e2e8f0" fontSize="9" fontFamily="sans-serif" fontWeight="bold">Scotland</text>
                  <text x="155" y="145" fill="#e2e8f0" fontSize="9" fontFamily="sans-serif" fontWeight="bold">England</text>
                  <text x="110" y="140" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">Wales</text>
                  <text x="80" y="125" fill="#64748b" fontSize="7" fontFamily="sans-serif">N. Ireland</text>
                  <text x="240" y="50" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.8">North Sea</text>
                </svg>
              </div>

              {/* Floating Hover Tooltip */}
              {hoveredHub && (
                <div className="absolute left-3 top-3 bg-[#111827]/95 border border-[#38bdf8]/50 p-2.5 rounded-xl text-xs font-mono shadow-2xl z-20 pointer-events-none animate-fade-in max-w-[210px]">
                  <div className="font-bold text-white text-[11px] mb-0.5">{hoveredHub.name}</div>
                  <div className="text-[#38bdf8] text-[10px] font-semibold">{hoveredHub.status}</div>
                  <div className="flex justify-between border-t border-slate-700 mt-1.5 pt-1 text-[10px]">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="text-white font-bold">{hoveredHub.capacity}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Wind Speed:</span>
                    <span className="text-emerald-400 font-bold">{hoveredHub.windSpeed}</span>
                  </div>
                </div>
              )}

              {/* Map Floating Zoom Controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1 bg-[#141b2b] p-1 rounded-lg border border-[#232f4a] z-10">
                <button
                  onClick={handleZoomIn}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors"
                  title="Zoom in on map"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors"
                  title="Zoom out on map"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Map Legend */}
              <div className="absolute left-3 bottom-2 flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-[#0c101b]/90 px-2 py-0.5 rounded border border-[#1b2337]">
                <span className="w-2 h-2 rounded-full bg-[#f43f85]" />
                <span>Click clusters to filter regional capacity</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto p-3 space-y-2 text-xs font-mono">
              {zones.map((z) => (
                <div
                  key={z.id}
                  onClick={() => onSelectZone && onSelectZone(z.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedZoneId === z.id
                      ? 'bg-[#1e2840] border-[#38bdf8] shadow-sm'
                      : 'bg-[#101626] hover:bg-[#161f36] border-[#1d263b]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
                      <span>{z.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{z.status} • {z.windSpeed}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sky-400">{z.capacity}</div>
                    <div className="text-[10px] text-pink-400 font-semibold">{z.share} GB total</div>
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

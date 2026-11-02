import React, { useState } from 'react';
import { Plus, Minus, Wind, AlertTriangle, ShieldCheck, Sun, Thermometer, Zap } from 'lucide-react';

export default function MarketZoneMapCard({
  onSelectZone,
  selectedZoneId = 'GB_NATIONAL',
  selectedWeighting = 'capacity_wind',
  selectedVariable = 'wind'
}) {
  const [activeTab, setActiveTab] = useState('map');
  const [hoveredHub, setHoveredHub] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const isCurtailment = selectedWeighting === 'curtailment_adj';
  const isUnweighted = selectedWeighting === 'unweighted';

  const zones = [
    {
      id: 'GB_NATIONAL',
      name: 'United Kingdom (National Grid Total)',
      capacity: isCurtailment ? '28.8 GW' : '30.2 GW',
      metricDisplay: selectedVariable === 'temperature'
        ? (isCurtailment ? '4.8°C Mean' : isUnweighted ? '5.5°C Mean' : '5.2°C Mean')
        : selectedVariable === 'solar'
        ? (isCurtailment ? '4.3 GW Peak' : isUnweighted ? '5.0 GW Peak' : '4.8 GW Peak')
        : isCurtailment ? '28.8 GW (Constrained)' : isUnweighted ? '32.0 GW (Unweighted)' : '30.2 GW Installed',
      subtext: selectedVariable === 'temperature' ? 'UK-wide ambient average' : selectedVariable === 'solar' ? 'Diurnal PV capacity' : isCurtailment ? 'Factoring B6 boundary limit' : 'All Grid Supply Points',
      share: '100%',
      cx: 175,
      cy: 115,
      color: '#38bdf8'
    },
    {
      id: 'SCOTLAND',
      name: 'Scotland (Moray & Seagreen Offshore)',
      capacity: isCurtailment ? '6.4 GW (Throttled)' : '7.8 GW',
      metricDisplay: selectedVariable === 'temperature'
        ? (isCurtailment ? '1.8°C' : isUnweighted ? '2.5°C' : '2.2°C')
        : selectedVariable === 'solar'
        ? (isCurtailment ? '370 MW' : '410 MW')
        : isCurtailment ? '6.4 GW (-1.4 GW Cap)' : '7.8 GW (14.1 m/s)',
      subtext: isCurtailment ? 'B6 export bottleneck active' : 'High wind velocity (Force 7)',
      share: isCurtailment ? '22%' : '26%',
      cx: 155,
      cy: 60,
      color: '#f43f85'
    },
    {
      id: 'ENGLAND_NORTH',
      name: 'England North (Dogger Bank & Hornsea)',
      capacity: '9.6 GW',
      metricDisplay: selectedVariable === 'temperature'
        ? (isCurtailment ? '4.0°C' : isUnweighted ? '4.7°C' : '4.4°C')
        : selectedVariable === 'solar'
        ? (isCurtailment ? '1,115 MW' : '1,240 MW')
        : isUnweighted ? '10.2 GW (12.8 m/s)' : '9.6 GW (12.4 m/s)',
      subtext: 'Optimal North Sea array output',
      share: '32%',
      cx: 195,
      cy: 115,
      color: '#ec4899'
    },
    {
      id: 'ENGLAND_SOUTH',
      name: 'England South & East Anglia Arrays',
      capacity: '5.8 GW',
      metricDisplay: selectedVariable === 'temperature'
        ? (isCurtailment ? '7.0°C' : isUnweighted ? '7.7°C' : '7.4°C')
        : selectedVariable === 'solar'
        ? (isCurtailment ? '1,665 MW' : '1,850 MW')
        : '5.8 GW (9.8 m/s)',
      subtext: 'High solar irradiance & Thames flow',
      share: '19%',
      cx: 185,
      cy: 165,
      color: '#38bdf8'
    },
    {
      id: 'WALES_IRISH_SEA',
      name: 'Wales & Irish Sea (Walney/Celtic)',
      capacity: '4.2 GW',
      metricDisplay: selectedVariable === 'temperature'
        ? (isCurtailment ? '5.4°C' : isUnweighted ? '6.1°C' : '5.8°C')
        : selectedVariable === 'solar'
        ? (isCurtailment ? '740 MW' : '820 MW')
        : '4.2 GW (8.6 m/s)',
      subtext: 'Irish Sea & Celtic arrays',
      share: '14%',
      cx: 125,
      cy: 150,
      color: '#06b6d4'
    }
  ];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));

  const activeZoneObj = zones.find(z => z.id === selectedZoneId) || zones[0];

  const isNational = selectedZoneId === 'GB_NATIONAL';
  const isScotland = selectedZoneId === 'SCOTLAND';
  const isEnglandNorth = selectedZoneId === 'ENGLAND_NORTH';
  const isEnglandSouth = selectedZoneId === 'ENGLAND_SOUTH';
  const isWales = selectedZoneId === 'WALES_IRISH_SEA';

  return (
    <div className="bg-[#121826] border border-[#1e273d] rounded-2xl p-4 flex flex-col justify-between shadow-xl backdrop-blur">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Market Zones
            </h2>
            <span className="text-[11px] text-[#f43f85] font-mono font-bold flex items-center gap-1">
              • {activeZoneObj.name.split('(')[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCurtailment && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                <span>B6 Constrained</span>
              </span>
            )}
            {isUnweighted && (
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                <span>Unweighted Mean</span>
              </span>
            )}
            <button
              onClick={() => onSelectZone && onSelectZone('GB_NATIONAL')}
              className="text-[11px] text-slate-400 hover:text-white font-mono cursor-pointer transition-colors"
              title="Reset to GB National view"
            >
              Reset
            </button>
          </div>
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
            {selectedVariable === 'temperature' && <Thermometer className="w-3 h-3 text-amber-400" />}
            {selectedVariable === 'solar' && <Sun className="w-3 h-3 text-yellow-400" />}
            {selectedVariable === 'wind' && <Wind className="w-3 h-3 text-sky-400" />}
            <span className="text-sky-300 font-bold">{activeZoneObj.metricDisplay}</span>
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
                  </defs>

                  <rect width="320" height="240" fill="url(#grid)" />

                  {/* Continental Europe / North Sea Coast */}
                  <path d="M 230 180 L 250 170 L 270 190 L 300 210 L 320 220 L 320 240 L 220 240 Z" fill="#131b2e" stroke="#1e2942" strokeWidth="1" />
                  <path d="M 270 70 L 290 85 L 300 120 L 290 145 L 310 160" fill="#131b2e" stroke="#1e2942" strokeWidth="1" />

                  {/* Ireland Outline */}
                  <path d="M 70 100 Q 85 90 95 110 Q 100 130 90 150 Q 75 160 65 145 Q 60 120 70 100 Z" fill="#151d30" stroke="#22304d" strokeWidth="1" />

                  {/* 1. Scotland Region (Clickable & Dynamic) */}
                  <path
                    d="M 140 28 Q 158 18 168 32 Q 172 48 160 65 Q 175 75 165 95 Q 150 99 138 102 Q 124 90 128 65 Q 120 45 140 28 Z"
                    fill={isScotland ? '#be185d' : isNational ? '#2d1b38' : '#151d30'}
                    stroke={isScotland ? '#f43f85' : isNational ? '#ec4899' : '#334155'}
                    strokeWidth={isScotland ? 2.5 : 1.2}
                    className="hover:fill-[#be185d]/60 cursor-pointer transition-all duration-300"
                    onClick={() => onSelectZone && onSelectZone('SCOTLAND')}
                  />

                  {/* B6 Anglo-Scottish Constraint Boundary Line */}
                  {isCurtailment && (
                    <g>
                      <line x1="120" y1="102" x2="185" y2="102" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
                      <circle cx="152" cy="102" r="3" fill="#f59e0b" className="animate-ping" />
                      <text x="122" y="97" fill="#f59e0b" fontSize="6" fontFamily="monospace" fontWeight="bold">
                        B6 Export Limit: -1.4 GW
                      </text>
                    </g>
                  )}

                  {/* 2. England North (Dogger & Hornsea hinterland) */}
                  <path
                    d="M 138 102 Q 165 99 180 112 Q 192 125 185 138 L 136 138 Q 128 120 138 102 Z"
                    fill={isEnglandNorth ? '#831843' : isNational ? '#241a35' : '#151d30'}
                    stroke={isEnglandNorth ? '#ec4899' : isNational ? '#a855f7' : '#334155'}
                    strokeWidth={isEnglandNorth ? 2.5 : 1.2}
                    className="hover:fill-[#831843]/60 cursor-pointer transition-all duration-300"
                    onClick={() => onSelectZone && onSelectZone('ENGLAND_NORTH')}
                  />

                  {/* 3. England South (East Anglia & Thames corridor) */}
                  <path
                    d="M 136 138 L 185 138 Q 205 145 200 170 Q 170 185 140 180 Q 133 162 136 138 Z"
                    fill={isEnglandSouth ? '#0369a1' : isNational ? '#1e293b' : '#151d30'}
                    stroke={isEnglandSouth ? '#38bdf8' : isNational ? '#60a5fa' : '#334155'}
                    strokeWidth={isEnglandSouth ? 2.5 : 1.2}
                    className="hover:fill-[#0369a1]/60 cursor-pointer transition-all duration-300"
                    onClick={() => onSelectZone && onSelectZone('ENGLAND_SOUTH')}
                  />

                  {/* 4. Wales & Irish Sea Region */}
                  <path
                    d="M 125 136 Q 136 138 135 156 Q 126 168 116 165 Q 112 150 125 136 Z"
                    fill={isWales ? '#0e7490' : isNational ? '#1e2d3d' : '#151d30'}
                    stroke={isWales ? '#06b6d4' : isNational ? '#38bdf8' : '#334155'}
                    strokeWidth={isWales ? 2.5 : 1.2}
                    className="hover:fill-[#0e7490]/60 cursor-pointer transition-all duration-300"
                    onClick={() => onSelectZone && onSelectZone('WALES_IRISH_SEA')}
                  />

                  {/* Regional On-Map Value Badges */}
                  {/* Scotland Badge */}
                  <g className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('SCOTLAND')}>
                    <rect x="135" y="55" width="45" height="15" rx="3" fill="#0f172a" fillOpacity="0.85" stroke={isScotland ? '#f43f85' : '#475569'} strokeWidth="1" />
                    <text x="157" y="66" fill={isScotland ? '#f43f85' : '#e2e8f0'} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {zones[1].metricDisplay.split(' ')[0]}
                    </text>
                  </g>

                  {/* England North Badge */}
                  <g className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('ENGLAND_NORTH')}>
                    <rect x="145" y="112" width="46" height="15" rx="3" fill="#0f172a" fillOpacity="0.85" stroke={isEnglandNorth ? '#ec4899' : '#475569'} strokeWidth="1" />
                    <text x="168" y="123" fill={isEnglandNorth ? '#ec4899' : '#e2e8f0'} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {zones[2].metricDisplay.split(' ')[0]}
                    </text>
                  </g>

                  {/* England South Badge */}
                  <g className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('ENGLAND_SOUTH')}>
                    <rect x="145" y="155" width="46" height="15" rx="3" fill="#0f172a" fillOpacity="0.85" stroke={isEnglandSouth ? '#38bdf8' : '#475569'} strokeWidth="1" />
                    <text x="168" y="166" fill={isEnglandSouth ? '#38bdf8' : '#e2e8f0'} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {zones[3].metricDisplay.split(' ')[0]}
                    </text>
                  </g>

                  {/* Wales Badge */}
                  <g className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('WALES_IRISH_SEA')}>
                    <rect x="100" y="145" width="34" height="15" rx="3" fill="#0f172a" fillOpacity="0.85" stroke={isWales ? '#06b6d4' : '#475569'} strokeWidth="1" />
                    <text x="117" y="156" fill={isWales ? '#06b6d4' : '#e2e8f0'} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {zones[4].metricDisplay.split(' ')[0]}
                    </text>
                  </g>

                  {/* Interactive Offshore Hubs / Grid Supply Points */}
                  {zones.filter(z => z.id !== 'GB_NATIONAL').map((zone) => {
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
                          r={isSelected ? 16 : isHovered ? 12 : 7}
                          fill={zone.color}
                          fillOpacity={isSelected ? 0.45 : isHovered ? 0.3 : 0.15}
                          className="transition-all duration-300"
                        />
                        <circle
                          cx={zone.cx}
                          cy={zone.cy}
                          r={isSelected ? 4.5 : isHovered ? 3.5 : 2.5}
                          fill={zone.color}
                        />
                      </g>
                    );
                  })}

                  {/* Region Names */}
                  <text x="145" y="45" fill={isScotland ? '#f43f85' : '#cbd5e1'} fontSize="8" fontFamily="sans-serif" fontWeight="bold" className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('SCOTLAND')}>
                    Scotland
                  </text>
                  <text x="175" y="105" fill={isEnglandNorth ? '#ec4899' : '#cbd5e1'} fontSize="8" fontFamily="sans-serif" fontWeight="bold" className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('ENGLAND_NORTH')}>
                    England N.
                  </text>
                  <text x="180" y="150" fill={isEnglandSouth ? '#38bdf8' : '#cbd5e1'} fontSize="8" fontFamily="sans-serif" fontWeight="bold" className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('ENGLAND_SOUTH')}>
                    England S.
                  </text>
                  <text x="96" y="140" fill={isWales ? '#06b6d4' : '#94a3b8'} fontSize="7" fontFamily="sans-serif" fontWeight="bold" className="cursor-pointer" onClick={() => onSelectZone && onSelectZone('WALES_IRISH_SEA')}>
                    Wales
                  </text>
                  <text x="80" y="125" fill="#64748b" fontSize="6" fontFamily="sans-serif">N. Ireland</text>
                  <text x="235" y="50" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.8">North Sea</text>
                </svg>
              </div>

              {/* Floating Hover Tooltip */}
              {hoveredHub && (
                <div className="absolute left-3 top-3 bg-[#111827]/95 border border-[#38bdf8]/50 p-2.5 rounded-xl text-xs font-mono shadow-2xl z-20 pointer-events-none animate-fade-in max-w-[220px]">
                  <div className="font-bold text-white text-[11px] mb-0.5">{hoveredHub.name}</div>
                  <div className="text-[#38bdf8] text-[10px] font-semibold">{hoveredHub.subtext}</div>
                  <div className="flex justify-between border-t border-slate-700 mt-1.5 pt-1 text-[10px]">
                    <span className="text-slate-400">Value:</span>
                    <span className="text-white font-bold">{hoveredHub.metricDisplay}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">GB Share:</span>
                    <span className="text-pink-400 font-bold">{hoveredHub.share}</span>
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
                <span className="w-2 h-2 rounded-full bg-[#f43f85] animate-pulse" />
                <span>
                  {isCurtailment
                    ? 'B6 Boundary active: -1.4 GW transmission derating'
                    : isUnweighted
                    ? 'Unweighted direct arithmetic mean across GSPs'
                    : 'Click regions/hubs to filter regional dispatch'}
                </span>
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
                    <div className="text-[10px] text-slate-400 mt-0.5">{z.subtext}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sky-400">{z.metricDisplay}</div>
                    <div className="text-[10px] text-pink-400 font-semibold">{z.share} of total</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-[#182033] mt-2">
        <span>Coordinate System: WGS84 • EPSG:4326</span>
        <span className="text-slate-400">
          {selectedVariable === 'temperature' ? 'BMRS / Met Office' : selectedVariable === 'solar' ? 'PV Stream' : 'Elexon FUELHH'}
        </span>
      </div>
    </div>
  );
}

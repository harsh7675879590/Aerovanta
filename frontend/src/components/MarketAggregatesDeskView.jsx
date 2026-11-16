import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Atom,
  TreePine,
  Sun,
  Droplets,
  ArrowRightLeft,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Scale,
  Coins,
  ShieldAlert,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function MarketAggregatesDeskView({
  intervals = [],
  targetDate,
  summary,
  onNavigate,
  selectedZone = 'GB_NATIONAL'
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Estimate mean wind from intervals
  const validActs = intervals.filter(it => it.actual_mw !== null);
  const meanWind = validActs.length > 0
    ? Math.round(validActs.reduce((acc, it) => acc + it.actual_mw, 0) / validActs.length)
    : 11420;

  // National Grid Fuel Mix Breakdown (MW & %)
  const fuelMix = [
    { name: 'Wind (On & Offshore)', mw: meanWind, color: '#38bdf8', icon: Zap, clean: true },
    { name: 'Gas CCGT (Fossil)', mw: 8400, color: '#f59e0b', icon: Flame, clean: false },
    { name: 'Nuclear (Baseload)', mw: 4600, color: '#a855f7', icon: Atom, clean: true },
    { name: 'Biomass (Drax)', mw: 1850, color: '#10b981', icon: TreePine, clean: true },
    { name: 'Interconnector Imports', mw: 2400, color: '#ec4899', icon: ArrowRightLeft, clean: true },
    { name: 'Solar PV', mw: 850, color: '#facc15', icon: Sun, clean: true },
    { name: 'Hydro & Pumped Storage', mw: 520, color: '#06b6d4', icon: Droplets, clean: true }
  ];

  const totalDemandMW = fuelMix.reduce((a, b) => a + b.mw, 0);
  const cleanPct = Math.round((fuelMix.filter(f => f.clean).reduce((a, b) => a + b.mw, 0) / totalDemandMW) * 100);
  const carbonIntensity = Math.round((fuelMix.find(f => f.name.includes('Gas'))?.mw / totalDemandMW) * 390);

  // Interconnector net flows
  const interconnectors = [
    { name: 'IFA (France)', flow: '+1,000 MW', type: 'Import', cap: '2,000 MW' },
    { name: 'IFA2 (France)', flow: '+800 MW', type: 'Import', cap: '1,000 MW' },
    { name: 'BritNed (Netherlands)', flow: '+600 MW', type: 'Import', cap: '1,000 MW' },
    { name: 'North Sea Link (Norway)', flow: '+1,100 MW', type: 'Import', cap: '1,400 MW' },
    { name: 'Viking Link (Denmark)', flow: '+900 MW', type: 'Import', cap: '1,400 MW' },
    { name: 'Nemo Link (Belgium)', flow: '-200 MW', type: 'Export', cap: '1,000 MW' }
  ];

  // Financial Imbalance & Cashout calculations
  const maeMW = summary?.mae_mw ?? 1103;
  const biasMW = summary?.bias_mw ?? -86;
  const isSystemLong = biasMW > 0;
  const sbpPrice = 88.50; // System Buy Price (£/MWh)
  const sspPrice = 36.20; // System Sell Price (£/MWh)
  const dayAheadPrice = 64.00; // Reference Day-Ahead EPEX SPOT (£/MWh)

  // Estimated daily financial imbalance penalty
  const estimatedImbalanceMWh = Math.round(maeMW * 24);
  const estimatedCostGBP = Math.round(
    estimatedImbalanceMWh * Math.abs(isSystemLong ? dayAheadPrice - sspPrice : sbpPrice - dayAheadPrice)
  );

  return (
    <div className="space-y-5 animate-fade-in font-mono text-xs text-slate-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121826] via-[#1a233b] to-[#121826] border border-[#223150] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Energy Market Aggregates & Merit Order Desk</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Great Britain Generation Fuel Mix & Cash-out Imbalance Exposure
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Comprehensive power system aggregation: real-time fuel shares, cross-border interconnector flows, Net Imbalance Volume (NIV), and financial cash-out risk for <span className="text-white font-bold">{targetDate}</span>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gb-wind')}
          className="px-4 py-2 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20 flex items-center gap-2 cursor-pointer font-sans"
        >
          <span>Return to 4-Card Overview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121826] border border-[#1e273d] shadow-lg">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Total Grid Demand</div>
          <div className="text-lg font-bold text-white mt-1">{(totalDemandMW / 1000).toFixed(1)} GW</div>
          <div className="text-[10px] text-sky-400 mt-0.5">Instantaneous GB Total</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121826] border border-[#1e273d] shadow-lg">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Zero-Carbon Generation</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{cleanPct}%</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">Wind + Nuclear + Hydro + Solar</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121826] border border-[#1e273d] shadow-lg">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Grid Carbon Intensity</div>
          <div className="text-lg font-bold text-amber-400 mt-1">{carbonIntensity} gCO₂/kWh</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Moderate Clean Rating</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121826] border border-[#1e273d] shadow-lg">
          <div className="text-[10px] text-slate-400 font-sans uppercase">Est. Imbalance Cash-out Risk</div>
          <div className="text-lg font-bold text-rose-400 mt-1">£{estimatedCostGBP.toLocaleString()}</div>
          <div className="text-[10px] text-rose-300 mt-0.5">Based on {maeMW} MW Day-Ahead MAE</div>
        </div>
      </div>

      {/* Main Row: Fuel Mix Doughnut/List + Imbalance Mechanism */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (Col 7): Generation Fuel Mix */}
        <div className="lg:col-span-7 bg-[#121826] border border-[#1e273d] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>Great Britain Generation Fuel Mix</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">BMRS Real-Time Stream</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Donut Chart */}
            <div className="md:col-span-5 h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelMix}
                    dataKey="mw"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {fuelMix.map((f, i) => (
                      <Cell key={i} fill={f.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      const pct = ((d.mw / totalDemandMW) * 100).toFixed(1);
                      return (
                        <div className="bg-[#0b101d] border border-[#232f4a] p-2.5 rounded-xl font-mono text-xs">
                          <div className="text-white font-bold">{d.name}</div>
                          <div className="text-sky-400 font-semibold">{d.mw.toLocaleString()} MW ({pct}%)</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xs text-slate-400 font-sans">Wind Share</div>
                <div className="text-base font-bold text-sky-400">{Math.round((meanWind / totalDemandMW) * 100)}%</div>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="md:col-span-7 space-y-2">
              {fuelMix.map((f, i) => {
                const pct = ((f.mw / totalDemandMW) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                      <span className="text-slate-300 truncate max-w-[170px]">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{f.mw.toLocaleString()} MW</span>
                      <span className="text-white font-bold w-12 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Col 5): Cash-Out Imbalance & Balancing Mechanism */}
        <div className="lg:col-span-5 bg-[#121826] border border-[#1e273d] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Coins className="w-4 h-4 text-pink-400" />
                <span>Balancing Mechanism Cash-out Exposure</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30 text-[10px] font-bold">
                Elexon SBP / SSP
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
              When wind generation deviates from Day-Ahead volumes locked at EPEX Gate (11:00 D-1), National Grid ESO dispatches flexible gas/battery assets and settles the imbalance via dual cash-out prices.
            </p>

            <div className="space-y-2.5 mt-4">
              <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">System Buy Price (SBP)</div>
                  <div className="text-xs font-bold text-rose-400">£{sbpPrice.toFixed(2)} / MWh</div>
                </div>
                <span className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  Penalty for Shortfall
                </span>
              </div>

              <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">System Sell Price (SSP)</div>
                  <div className="text-xs font-bold text-amber-400">£{sspPrice.toFixed(2)} / MWh</div>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Discount for Surplus
                </span>
              </div>

              <div className="p-3 bg-[#0a0e18] rounded-xl border border-[#1b2338] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Day-Ahead Auction Price</div>
                  <div className="text-xs font-bold text-sky-400">£{dayAheadPrice.toFixed(2)} / MWh</div>
                </div>
                <span className="text-[10px] text-slate-400">
                  EPEX Reference
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-pink-500/5 rounded-xl border border-pink-500/20 text-[11px] font-sans text-slate-300">
            <span className="text-pink-400 font-bold font-mono">Current Bias Position: </span>
            {biasMW < 0
              ? `System Short by ${Math.abs(biasMW)} MW. Desks with short positions buy replacement power at £${sbpPrice}/MWh.`
              : `System Long by ${biasMW} MW. Surplus power dumped at £${sspPrice}/MWh.`}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Interconnectors & Transmission Bottlenecks */}
      <div className="bg-[#121826] border border-[#1e273d] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2337]">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>Cross-Border Interconnector Flows & Transmission Constraints</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Net Flow: +4,200 MW (Importing)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {interconnectors.map((c, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#0e1424] border border-[#1e273d] space-y-1">
              <div className="text-[10px] text-slate-400 font-sans truncate">{c.name}</div>
              <div className={`text-xs font-bold font-mono ${c.type === 'Import' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {c.flow}
              </div>
              <div className="text-[9px] text-slate-500">Cap: {c.cap}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


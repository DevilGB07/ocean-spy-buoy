import React from 'react';
import {
  Radar,
  LayoutDashboard,
  Waves,
  Ship,
  Radio,
  AlertTriangle,
  FileCheck2,
  BarChart3,
  Anchor,
  Settings as SettingsIcon
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Detection', icon: Waves },
    { id: 'vessels', label: 'Vessels', icon: Ship },
    { id: 'ais', label: 'AIS', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: activeAlertCount },
    { id: 'evidence', label: 'Evidence', icon: FileCheck2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'buoys', label: 'Buoys', icon: Anchor },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="bg-ocean-900 border-b border-ocean-border sticky top-0 z-40 px-4 py-2.5 shadow-xl backdrop-blur">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-cyan/20 to-ocean-blue/30 border border-ocean-cyan/40 flex items-center justify-center shadow-glow-cyan">
              <Radar className="w-5 h-5 text-ocean-cyan animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-slate-100 font-mono">OCEAN SPY-BUOY</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-ocean-cyan/10 border border-ocean-cyan/30 text-ocean-cyan font-mono">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                "Don't Ask the Ship Where It Is. <span className="text-ocean-cyan font-semibold">Ask the Ocean.</span>"
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-ocean-cyan/15 text-ocean-cyan border border-ocean-cyan/40 shadow-glow-cyan'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-ocean-800/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-ocean-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

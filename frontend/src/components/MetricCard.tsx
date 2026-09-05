import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'green' | 'amber' | 'red' | 'blue';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend
}) => {
  const variantStyles = {
    cyan: 'border-ocean-border hover:border-ocean-cyan/50 text-ocean-cyan',
    green: 'border-emerald-500/30 hover:border-emerald-500 text-emerald-400',
    amber: 'border-amber-500/30 hover:border-amber-500 text-amber-400',
    red: 'border-rose-500/40 hover:border-rose-500 text-rose-400 shadow-glow-red/20',
    blue: 'border-blue-500/30 hover:border-blue-500 text-blue-400',
  }[variant];

  return (
    <div className={`bg-ocean-900/90 border rounded-xl p-4 transition-all duration-300 backdrop-blur-sm ${variantStyles}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
            {title}
          </div>
          <div className="text-2xl lg:text-3xl font-black font-mono mt-1 text-slate-100">
            {value}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-ocean-950/80 border border-ocean-border/60">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{subtitle}</span>
          {trend && <span className="font-semibold">{trend}</span>}
        </div>
      )}
    </div>
  );
};

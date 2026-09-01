import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  target?: string;
  icon: LucideIcon;
  color?: 'purple' | 'cyan' | 'green' | 'amber' | 'blue';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  change,
  isPositive = true,
  target,
  icon: Icon,
  color = 'purple',
  onClick,
}) => {
  const colorStyles = {
    purple: {
      iconBg: 'bg-rehab-purple/15 text-rehab-purpleLight border-rehab-purple/30',
      glow: 'purple' as const,
    },
    cyan: {
      iconBg: 'bg-rehab-cyan/15 text-rehab-cyan border-rehab-cyan/30',
      glow: 'cyan' as const,
    },
    green: {
      iconBg: 'bg-rehab-green/15 text-rehab-green border-rehab-green/30',
      glow: 'green' as const,
    },
    amber: {
      iconBg: 'bg-rehab-amber/15 text-rehab-amber border-rehab-amber/30',
      glow: 'none' as const,
    },
    blue: {
      iconBg: 'bg-rehab-blue/15 text-rehab-blue border-rehab-blue/30',
      glow: 'none' as const,
    },
  }[color];

  return (
    <GlassCard
      glow={colorStyles.glow}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer group ${onClick ? 'hover:border-rehab-purple/50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-bg-border/50 text-xs">
        {change ? (
          <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-rehab-green' : 'text-rehab-red'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        ) : (
          <span className="text-slate-500">Live Kinematics</span>
        )}

        {target && (
          <span className="text-slate-400 font-mono text-[11px]">
            Goal: <span className="text-slate-200">{target}</span>
          </span>
        )}
      </div>
    </GlassCard>
  );
};

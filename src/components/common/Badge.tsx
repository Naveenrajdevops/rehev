import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan' | 'green' | 'amber' | 'red' | 'slate';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'md',
  dot = false,
}) => {
  const variantStyles = {
    purple: 'bg-rehab-purple/15 text-rehab-purpleLight border-rehab-purple/30',
    cyan: 'bg-rehab-cyan/15 text-rehab-cyan border-rehab-cyan/30',
    green: 'bg-rehab-green/15 text-rehab-green border-rehab-green/30',
    amber: 'bg-rehab-amber/15 text-rehab-amber border-rehab-amber/30',
    red: 'bg-rehab-red/15 text-rehab-red border-rehab-red/30',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700/50',
  }[variant];

  const dotColors = {
    purple: 'bg-rehab-purple',
    cyan: 'bg-rehab-cyan',
    green: 'bg-rehab-green',
    amber: 'bg-rehab-amber',
    red: 'bg-rehab-red',
    slate: 'bg-slate-400',
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles} ${sizeStyles}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors} animate-pulse`} />}
      {children}
    </span>
  );
};

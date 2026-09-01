import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: 'purple' | 'cyan' | 'green' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glow = 'none',
  ...props
}) => {
  const glowClasses = {
    purple: 'hover:shadow-glow-purple',
    cyan: 'hover:shadow-glow-cyan',
    green: 'hover:shadow-glow-green',
    none: '',
  }[glow];

  return (
    <div
      className={`rounded-2xl border border-bg-border bg-bg-card/70 backdrop-blur-xl p-5 ${
        hoverEffect ? 'transition-all duration-300 hover:border-bg-borderHover hover:bg-bg-cardHover/85 hover:-translate-y-0.5' : ''
      } ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

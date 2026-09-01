import React from 'react';
import {
  Activity,
  Camera,
  BookOpen,
  Users,
  CalendarCheck,
  Bot,
  TrendingUp,
  History,
  FileText,
  Stethoscope,
  Settings,
  ShieldCheck,
  Zap,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { isDemoMode, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'live', label: 'Live Analysis', icon: Camera, badge: 'Live CV' },
    { id: 'exercises', label: 'Exercise Library', icon: BookOpen },
    { id: 'patients', label: 'Patient Profile', icon: Users },
    { id: 'plans', label: 'Rehab Plans', icon: CalendarCheck },
    { id: 'coach', label: 'AI Coach Nova', icon: Bot, badge: 'Nova' },
    { id: 'progress', label: 'Progress & Trends', icon: TrendingUp },
    { id: 'sessions', label: 'Sessions History', icon: History },
    { id: 'reports', label: 'Clinical Reports', icon: FileText },
    { id: 'therapist', label: 'Therapist Center', icon: Stethoscope },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'safety', label: 'About & Safety', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col justify-between bg-bg-dark/95 border-r border-bg-border backdrop-blur-2xl p-4 select-none fixed top-0 left-0 z-40">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rehab-purple to-rehab-cyan flex items-center justify-center shadow-glow-purple">
            <Activity className="w-6 h-6 text-bg-darkest" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">REHABAI PRO</h1>
            </div>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-rehab-purpleLight">
              Rehab Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-rehab-purple/25 to-rehab-cyan/15 text-white border border-rehab-purple/40 shadow-glow-purple'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-bg-cardHover/60 hover:border-bg-border/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rehab-cyan' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-rehab-cyan/20 text-rehab-cyan' : 'bg-bg-card text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Indicators */}
      <div className="pt-3 border-t border-bg-border/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-rehab-cyan" />
            <span>AI Engine</span>
          </span>
          <span className="text-rehab-cyan font-mono text-[10px]">Nova v2.4</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-rehab-purpleLight" />
            <span>MediaPipe Pose</span>
          </span>
          <span className="text-rehab-green font-mono text-[10px]">33 Pts Live</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-rehab-amber" />
            <span>Database</span>
          </span>
          <Badge variant={isDemoMode ? 'amber' : 'green'} size="sm" dot>
            {isDemoMode ? 'Demo Mode' : 'Connected'}
          </Badge>
        </div>
      </div>
    </aside>
  );
};

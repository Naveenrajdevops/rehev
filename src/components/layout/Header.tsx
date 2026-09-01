import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Camera,
  ChevronDown,
  User,
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { INITIAL_PATIENTS } from '../../data/initialData';

interface HeaderProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const { user, activePatient, setActivePatient, setUserRole, isDemoMode } = useAuth();
  const { isVoiceEnabled, setVoiceEnabled } = useSession();
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return { title: 'Rehabilitation Intelligence Dashboard', subtitle: 'Overview & Kinematic Recovery Analytics' };
      case 'live': return { title: 'Live Computer Vision Workspace', subtitle: 'Real-time 33-Landmark Pose & Kinematic Feedback' };
      case 'exercises': return { title: 'Clinical Exercise Library', subtitle: 'Biomechanical Targets, 3D Kinematics & Protocols' };
      case 'patients': return { title: 'Patient Profile & Recovery Record', subtitle: 'Longitudinal Adherence, ROM & History' };
      case 'plans': return { title: 'Rehabilitation Protocol Builder', subtitle: 'Custom Prescribed Exercise Routines' };
      case 'coach': return { title: 'AI Clinical Coach Nova', subtitle: 'Context-Aware Rehabilitation Dialogue & Guidance' };
      case 'progress': return { title: 'Progress & Kinematic Trends', subtitle: 'Multi-axis Recovery & Bilateral Symmetry Tracking' };
      case 'sessions': return { title: 'Session History & Deep Dive', subtitle: 'Repetition Breakdown & Biomechanical Logs' };
      case 'reports': return { title: 'Clinical PDF Report Center', subtitle: 'Physiotherapy Documentation & Export' };
      case 'therapist': return { title: 'Therapist Command Center', subtitle: 'Patient Risk Stratification & Adherence' };
      case 'settings': return { title: 'System & Vision Settings', subtitle: 'Audio Preferences, Device Selection & Privacy' };
      case 'safety': return { title: 'About & Clinical Safety Framework', subtitle: 'Non-Diagnostic Scope, Privacy & Computer Vision' };
      default: return { title: 'RehabAI Pro', subtitle: 'Intelligent Motion Platform' };
    }
  };

  const { title, subtitle } = getPageTitle(activePage);

  return (
    <header className="h-18 px-8 flex items-center justify-between border-b border-bg-border bg-bg-darkest/70 backdrop-blur-xl sticky top-0 z-30 ml-64">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
          {isDemoMode && (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rehab-amber/15 text-rehab-amber border border-rehab-amber/30">
              Demo Mode
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        {/* Active Patient Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPatientDropdown(!showPatientDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-bg-card/80 border border-bg-border hover:border-rehab-purple/40 text-xs font-semibold text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-rehab-purple/20 text-rehab-purpleLight flex items-center justify-center font-bold text-[11px]">
              {activePatient.name[0]}
            </div>
            <div className="text-left">
              <p className="leading-none text-white text-xs">{activePatient.name}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{activePatient.patient_id_code}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showPatientDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-bg-card border border-bg-border shadow-2xl p-2 z-50 backdrop-blur-2xl">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">Select Patient</p>
              {INITIAL_PATIENTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePatient(p);
                    setShowPatientDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors ${
                    activePatient.id === p.id ? 'bg-rehab-purple/20 text-rehab-purpleLight' : 'hover:bg-bg-cardHover text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.condition}</p>
                  </div>
                  {activePatient.id === p.id && <CheckCircle2 className="w-4 h-4 text-rehab-cyan" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-card/60 border border-bg-border hover:border-bg-borderHover text-xs text-slate-300 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-rehab-cyan" />
            <span className="capitalize font-medium">{user.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-bg-card border border-bg-border shadow-2xl p-1.5 z-50">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">Switch Role</p>
              {(['therapist', 'patient', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                    user.role === r ? 'bg-rehab-purple/20 text-white font-semibold' : 'text-slate-400 hover:bg-bg-cardHover'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Coach Voice Toggle */}
        <button
          onClick={() => setVoiceEnabled(!isVoiceEnabled)}
          title={isVoiceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
          className={`p-2 rounded-xl border transition-all ${
            isVoiceEnabled
              ? 'bg-rehab-purple/20 border-rehab-purple/50 text-rehab-purpleLight shadow-glow-purple'
              : 'bg-bg-card/60 border-bg-border text-slate-500 hover:text-slate-300'
          }`}
        >
          {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-bg-card/60 border border-bg-border text-slate-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rehab-cyan animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-bg-card border border-bg-border shadow-2xl p-3 z-50 backdrop-blur-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-bg-border">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-rehab-cyan font-mono cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-xl bg-bg-dark/80 border border-rehab-green/20 text-xs">
                  <p className="font-semibold text-rehab-green">Milestone Achieved</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Eleanor achieved 95% movement quality in Squat Rehabilitation.</p>
                </div>
                <div className="p-2 rounded-xl bg-bg-dark/80 border border-bg-border text-xs">
                  <p className="font-semibold text-rehab-purpleLight">Nova AI Observation</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Bilateral knee symmetry variance improved by +6.2° this week.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Launch Live CV CTA */}
        {activePage !== 'live' && (
          <button
            onClick={() => onNavigate('live')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform"
          >
            <Camera className="w-4 h-4 text-bg-darkest" />
            <span>Start Live CV</span>
          </button>
        )}
      </div>
    </header>
  );
};

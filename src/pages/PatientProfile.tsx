import React, { useState } from 'react';
import {
  User,
  Activity,
  Calendar,
  Compass,
  FileText,
  Heart,
  Phone,
  Mail,
  Shield,
  Clock,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const PatientProfile: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { activePatient } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'notes'>('overview');

  return (
    <div className="space-y-6 pb-12">
      {/* Patient Header Card */}
      <GlassCard glow="purple" className="relative overflow-hidden p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rehab-purple to-rehab-cyan flex items-center justify-center font-extrabold text-2xl text-bg-darkest shadow-glow-purple">
              {activePatient.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-white">{activePatient.name}</h1>
                <Badge variant="purple" size="sm">{activePatient.patient_id_code}</Badge>
                <Badge variant={activePatient.status === 'Improving' ? 'green' : 'amber'} size="sm" dot>
                  {activePatient.status}
                </Badge>
              </div>
              <p className="text-xs text-rehab-cyan font-semibold mt-1">{activePatient.condition}</p>
              <p className="text-xs text-slate-400 mt-0.5">Affected Side: <strong className="text-white">{activePatient.affected_side}</strong> • Age: {activePatient.age} ({activePatient.gender})</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('live')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Start Session</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 rounded-xl bg-bg-card border border-rehab-purple/40 text-white font-semibold text-xs hover:border-rehab-purple/80 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-rehab-purpleLight" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Recovery Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Movement Quality</span>
          <p className="text-2xl font-black text-white font-mono">{activePatient.overall_quality_score}%</p>
          <span className="text-[11px] text-rehab-green font-medium">Kinematic average</span>
        </GlassCard>
        <GlassCard className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Bilateral Symmetry</span>
          <p className="text-2xl font-black text-rehab-cyan font-mono">{activePatient.symmetry_score}%</p>
          <span className="text-[11px] text-slate-400">Δ 3.5° side difference</span>
        </GlassCard>
        <GlassCard className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">ROM Target Achievement</span>
          <p className="text-2xl font-black text-rehab-purpleLight font-mono">{activePatient.rom_achievement}%</p>
          <span className="text-[11px] text-slate-400">Peak flexion: 104°</span>
        </GlassCard>
        <GlassCard className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Prescription Adherence</span>
          <p className="text-2xl font-black text-rehab-green font-mono">{activePatient.adherence_rate}%</p>
          <span className="text-[11px] text-slate-400">8 completed workouts</span>
        </GlassCard>
      </div>

      {/* Longitudinal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rehabilitation Journey & Plan */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Rehabilitation Protocol</h3>
            <div className="p-4 rounded-2xl bg-bg-dark/80 border border-bg-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-rehab-purpleLight">ACL Post-Operative Phase II Protocol</h4>
                <Badge variant="green" size="sm">Active (3x/week)</Badge>
              </div>
              <p className="text-xs text-slate-300">
                Primary Goal: <span className="text-white font-semibold">{activePatient.primary_goal}</span>
              </p>

              <div className="space-y-2 pt-2 border-t border-bg-border">
                {[
                  { ex: 'Squat Rehabilitation', sets: '3 sets × 10 reps', goal: 'Target 105° ROM with symmetrical knee tracking' },
                  { ex: 'Active Knee Flexion', sets: '3 sets × 12 reps', goal: 'Target 120° ROM active hamstring contraction' },
                  { ex: 'Single-Leg Balance', sets: '3 sets × 20s hold', goal: 'Vestibular & proprioceptive stabilization' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-bg-card/50">
                    <div>
                      <p className="font-bold text-white">{p.ex}</p>
                      <p className="text-[11px] text-slate-400">{p.goal}</p>
                    </div>
                    <span className="text-[11px] font-mono text-rehab-cyan">{p.sets}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Col: Clinician & Contact Card */}
        <div className="space-y-4">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Clinician</h3>
            <div className="p-3.5 rounded-2xl bg-bg-dark/80 border border-bg-border space-y-2">
              <p className="text-xs font-bold text-white">Dr. Marcus Reynolds, DPT</p>
              <p className="text-[11px] text-slate-400">Orthopedic & Sports Physical Therapy</p>
              <p className="text-[11px] text-slate-400">License: PT-CA-994821</p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rehab-cyan" />
                <span>{activePatient.phone || '+1 (555) 234-5678'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rehab-purpleLight" />
                <span>{activePatient.email || 'patient@rehabai.io'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-rehab-green" />
                <span>Enrolled: Aug 07, 2026</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

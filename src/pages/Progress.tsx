import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Compass,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

const PROGRESS_30D_DATA = [
  { date: 'Aug 07', quality: 78, symmetry: 81, rom: 84, reps: 30, duration: 8.5 },
  { date: 'Aug 10', quality: 80, symmetry: 83, rom: 86, reps: 30, duration: 9.0 },
  { date: 'Aug 13', quality: 83, symmetry: 85, rom: 89, reps: 32, duration: 9.2 },
  { date: 'Aug 16', quality: 86, symmetry: 88, rom: 92, reps: 34, duration: 9.5 },
  { date: 'Aug 19', quality: 89, symmetry: 90, rom: 95, reps: 35, duration: 10.0 },
  { date: 'Aug 22', quality: 91, symmetry: 92, rom: 98, reps: 36, duration: 10.2 },
  { date: 'Aug 25', quality: 93, symmetry: 93, rom: 101, reps: 36, duration: 10.5 },
  { date: 'Aug 28', quality: 94, symmetry: 95, rom: 103, reps: 38, duration: 11.0 },
  { date: 'Today', quality: 95, symmetry: 96, rom: 105, reps: 40, duration: 11.5 },
];

export const Progress: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const { activePatient } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Time Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-card/70 border border-bg-border rounded-2xl p-4 backdrop-blur-xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Kinematic Recovery Analytics</h2>
          <p className="text-xs text-slate-400">Patient #{activePatient.patient_id_code} • {activePatient.name}</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-bg-dark rounded-xl border border-bg-border">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold shadow-glow-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Net Quality Gain</span>
          <p className="text-2xl font-black text-rehab-purpleLight font-mono">+17.0%</p>
          <span className="text-[11px] text-rehab-green">78% → 95%</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Symmetry Restoration</span>
          <p className="text-2xl font-black text-rehab-cyan font-mono">+15.0%</p>
          <span className="text-[11px] text-rehab-green">81% → 96%</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">ROM Flexion Expansion</span>
          <p className="text-2xl font-black text-rehab-green font-mono">+21.0°</p>
          <span className="text-[11px] text-rehab-green">84° → 105°</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Exercise Volume</span>
          <p className="text-2xl font-black text-white font-mono">311 Reps</p>
          <span className="text-[11px] text-slate-400">88.5 total active mins</span>
        </GlassCard>
      </div>

      {/* Primary Chart: Movement Quality & Symmetry Over Time */}
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Movement Quality & Bilateral Symmetry Progression</h3>
            <p className="text-xs text-slate-400">Tracking neuromuscular restoration and limb symmetry</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rehab-purpleLight">
              <span className="w-2.5 h-2.5 rounded-full bg-rehab-purple" /> Movement Quality
            </span>
            <span className="flex items-center gap-1.5 text-rehab-cyan">
              <span className="w-2.5 h-2.5 rounded-full bg-rehab-cyan" /> Bilateral Symmetry
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PROGRESS_30D_DATA}>
              <defs>
                <linearGradient id="progQuality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A97AFF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A97AFF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="progSymmetry" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3DDEE4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3DDEE4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 122, 255, 0.08)" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis domain={[60, 105]} stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101025',
                  border: '1px solid rgba(169, 122, 255, 0.3)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="quality" stroke="#A97AFF" strokeWidth={2.5} fill="url(#progQuality)" />
              <Area type="monotone" dataKey="symmetry" stroke="#3DDEE4" strokeWidth={2.5} fill="url(#progSymmetry)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Secondary Charts Grid: ROM Curve + Repetition Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROM Flexion Expansion Curve */}
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Range of Motion (ROM) Expansion</h3>
              <p className="text-xs text-slate-400">Peak flexion degrees vs. 105° clinical target</p>
            </div>
            <Badge variant="green" size="sm">Target: 105°</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROGRESS_30D_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 122, 255, 0.08)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[75, 115]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101025',
                    border: '1px solid rgba(67, 230, 160, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="rom" stroke="#43E6A0" strokeWidth={3} dot={{ r: 4, fill: '#43E6A0' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Repetition Volume & Duration */}
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Daily Workout Repetition Volume</h3>
              <p className="text-xs text-slate-400">Completed reps per training session</p>
            </div>
            <span className="text-xs font-mono text-rehab-cyan">100% Adherence</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROGRESS_30D_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 122, 255, 0.08)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101025',
                    border: '1px solid rgba(92, 158, 255, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="reps" fill="#5C9EFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

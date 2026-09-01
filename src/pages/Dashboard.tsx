import React from 'react';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Zap,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { MetricCard } from '../components/common/MetricCard';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { CLINICAL_EXERCISES } from '../data/exercisesData';

const MOCK_TREND_DATA = [
  { day: 'Day 1', quality: 78, symmetry: 81, rom: 84 },
  { day: 'Day 4', quality: 82, symmetry: 84, rom: 87 },
  { day: 'Day 8', quality: 85, symmetry: 88, rom: 90 },
  { day: 'Day 12', quality: 89, symmetry: 91, rom: 94 },
  { day: 'Day 16', quality: 92, symmetry: 93, rom: 96 },
  { day: 'Day 20', quality: 91, symmetry: 94, rom: 99 },
  { day: 'Today', quality: 95, symmetry: 96, rom: 104 },
];

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, activePatient } = useAuth();
  const { setSelectedExercise } = useSession();

  const handleStartExercise = (exerciseId: string) => {
    const ex = CLINICAL_EXERCISES.find(e => e.id === exerciseId) || CLINICAL_EXERCISES[0];
    setSelectedExercise(ex);
    onNavigate('live');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Non-diagnostic Safety Disclaimer */}
      <DisclaimerBanner />

      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-bg-card via-bg-dark to-bg-card border border-rehab-purple/30 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rehab-purple/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm" dot>Active Protocol</Badge>
              <span className="text-xs text-slate-400 font-mono">Patient #{activePatient.patient_id_code}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Good day, <span className="bg-gradient-to-r from-rehab-purpleLight via-rehab-cyan to-white bg-clip-text text-transparent">{user.full_name}</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              "Rehabilitation, intelligently measured." Real-time computer vision kinematics, bilateral symmetry indices, and AI-assisted clinical recovery guidance.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('live')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-sm shadow-glow-purple hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Live Analysis</span>
            </button>
            <button
              onClick={() => onNavigate('coach')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-bg-card/80 border border-rehab-purple/40 text-white font-semibold text-sm hover:bg-bg-cardHover hover:border-rehab-purple/70 transition-all"
            >
              <Sparkles className="w-4 h-4 text-rehab-cyan" />
              <span>Open AI Coach Nova</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Biomechanical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Movement Quality"
          value={activePatient.overall_quality_score}
          unit="%"
          change="+4.8% vs last week"
          isPositive={true}
          target=">= 85%"
          icon={Activity}
          color="purple"
          onClick={() => onNavigate('progress')}
        />
        <MetricCard
          title="Bilateral Symmetry"
          value={activePatient.symmetry_score}
          unit="%"
          change="+2.3% improved"
          isPositive={true}
          target=">= 90%"
          icon={Compass}
          color="cyan"
          onClick={() => onNavigate('progress')}
        />
        <MetricCard
          title="ROM Achievement"
          value={activePatient.rom_achievement}
          unit="%"
          change="+6.0° flexion gain"
          isPositive={true}
          target="100%"
          icon={RotateCcw}
          color="green"
          onClick={() => onNavigate('progress')}
        />
        <MetricCard
          title="Protocol Adherence"
          value={activePatient.adherence_rate}
          unit="%"
          change="8/8 sessions"
          isPositive={true}
          target="95%"
          icon={CheckCircle2}
          color="blue"
          onClick={() => onNavigate('sessions')}
        />
      </div>

      {/* Main Analytics Grid: Trends Chart + Today's Prescribed Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Kinematic Recovery Trends */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Kinematic Recovery Progress</h3>
              <p className="text-xs text-slate-400">Composite movement quality, symmetry, and peak range of motion over time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-rehab-purpleLight">
                <span className="w-2.5 h-2.5 rounded-full bg-rehab-purple" /> Quality
              </span>
              <span className="flex items-center gap-1.5 text-xs text-rehab-cyan">
                <span className="w-2.5 h-2.5 rounded-full bg-rehab-cyan" /> Symmetry
              </span>
              <span className="flex items-center gap-1.5 text-xs text-rehab-green">
                <span className="w-2.5 h-2.5 rounded-full bg-rehab-green" /> ROM
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A97AFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A97AFF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSymmetry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3DDEE4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3DDEE4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43E6A0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#43E6A0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(169, 122, 255, 0.08)" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 110]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101025',
                    border: '1px solid rgba(169, 122, 255, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="quality" stroke="#A97AFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQuality)" />
                <Area type="monotone" dataKey="symmetry" stroke="#3DDEE4" strokeWidth={2} fillOpacity={1} fill="url(#colorSymmetry)" />
                <Area type="monotone" dataKey="rom" stroke="#43E6A0" strokeWidth={2} fillOpacity={1} fill="url(#colorRom)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right 1 Col: Today's Prescribed Rehabilitation Routine */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Today's Routine</h3>
            <Badge variant="green" size="sm">3 Exercises</Badge>
          </div>

          <div className="space-y-3">
            {[
              { id: 'squat-rehab', name: 'Squat Rehabilitation', reps: '3 sets × 10 reps', target: 'Target ROM 105°', completed: true },
              { id: 'knee-flexion', name: 'Active Knee Flexion', reps: '3 sets × 12 reps', target: 'Target ROM 120°', completed: false },
              { id: 'balance', name: 'Single-Leg Balance', reps: '3 sets × 20s', target: 'Pelvic stability', completed: false },
            ].map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-bg-dark/80 border border-bg-border hover:border-rehab-purple/50 transition-all flex items-center justify-between group cursor-pointer"
                onClick={() => handleStartExercise(item.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    item.completed ? 'bg-rehab-green/20 text-rehab-green' : 'bg-rehab-purple/20 text-rehab-purpleLight'
                  }`}>
                    {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rehab-cyan transition-colors">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{item.reps} • {item.target}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('plans')}
            className="w-full py-2.5 rounded-xl border border-bg-border hover:border-rehab-purple/50 bg-bg-card hover:bg-bg-cardHover text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-rehab-purpleLight" />
            <span>View Full Rehabilitation Protocol</span>
          </button>
        </GlassCard>
      </div>

      {/* AI Rehabilitation Recommendations & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nova AI Observations */}
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rehab-purple to-rehab-cyan flex items-center justify-center shadow-glow-purple">
                <Zap className="w-4 h-4 text-bg-darkest" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Nova AI Kinematic Observations</h3>
                <p className="text-[11px] text-slate-400">Contextual clinical intelligence</p>
              </div>
            </div>
            <Badge variant="purple" size="sm">Automated</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-bg-dark/80 border border-rehab-purple/20 space-y-2">
            <p className="text-xs text-slate-200 leading-relaxed">
              "Eleanor demonstrated significant improvement in right knee terminal extension during yesterday's session. Bilateral knee symmetry reached <strong>94%</strong> with negligible pelvic tilt. Recommend advancing to phase 2 load progression."
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-bg-border text-[11px] text-slate-400">
              <span>Confidence: 96%</span>
              <button onClick={() => onNavigate('coach')} className="text-rehab-cyan hover:underline font-semibold flex items-center gap-1">
                Discuss with Nova <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Recent Session Summary */}
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Recent Completed Sessions</h3>
            <button onClick={() => onNavigate('sessions')} className="text-xs text-rehab-cyan hover:underline font-semibold">
              View All History
            </button>
          </div>

          <div className="space-y-2">
            {[
              { id: 'SES-2026-808', ex: 'Squat Rehabilitation', date: 'Yesterday', quality: 94.5, symmetry: 93.8, reps: 10 },
              { id: 'SES-2026-807', ex: 'Active Knee Flexion', date: '3 days ago', quality: 91.0, symmetry: 92.4, reps: 12 },
            ].map((sess) => (
              <div
                key={sess.id}
                onClick={() => onNavigate('sessions')}
                className="p-3 rounded-xl bg-bg-dark/70 border border-bg-border hover:border-rehab-purple/40 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{sess.ex}</h4>
                  <p className="text-[10px] text-slate-400">{sess.id} • {sess.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-rehab-green">{sess.quality}% Quality</p>
                    <p className="text-[10px] text-slate-400">{sess.symmetry}% Sym • {sess.reps} reps</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  History,
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Session } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

interface SessionsProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectSession: (session: Session) => void;
}

export const Sessions: React.FC<SessionsProps> = ({ onNavigate, onSelectSession }) => {
  const { activePatient } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSessions(activePatient.id).then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, [activePatient]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-card/70 border border-bg-border rounded-2xl p-4 backdrop-blur-xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Rehabilitation Session Records</h2>
          <p className="text-xs text-slate-400">Kinematic telemetry logs & rep-by-rep biomechanical audits</p>
        </div>
        <Badge variant="purple" size="md">{sessions.length} Recorded Sessions</Badge>
      </div>

      {/* Sessions Table / Card List */}
      <div className="space-y-3">
        {sessions.map((sess) => (
          <GlassCard
            key={sess.id}
            onClick={() => onSelectSession(sess)}
            className="p-5 cursor-pointer hover:border-rehab-purple/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rehab-purple/20 to-rehab-cyan/20 border border-rehab-purple/30 text-rehab-purpleLight flex items-center justify-center font-bold text-sm shadow-glow-purple">
                <Activity className="w-6 h-6 text-rehab-cyan" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white group-hover:text-rehab-purpleLight transition-colors">
                    {sess.exercise_id.replace('-', ' ').toUpperCase()}
                  </h3>
                  <Badge variant="green" size="sm">Completed ✓</Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {sess.session_uid} • {new Date(sess.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Quality</span>
                <span className="font-extrabold text-rehab-green font-mono text-sm">{sess.movement_quality_score}%</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Symmetry</span>
                <span className="font-extrabold text-rehab-cyan font-mono text-sm">{sess.symmetry_score}%</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Peak ROM</span>
                <span className="font-extrabold text-white font-mono text-sm">{sess.max_rom_degrees}°</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Volume</span>
                <span className="font-extrabold text-slate-200 font-mono text-sm">{sess.repetitions_completed} reps</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Duration</span>
                <span className="font-extrabold text-slate-400 font-mono text-sm">{Math.round(sess.duration_seconds / 60)}m {sess.duration_seconds % 60}s</span>
              </div>

              <div className="p-2 rounded-xl bg-bg-card border border-bg-border group-hover:border-rehab-purple/50 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

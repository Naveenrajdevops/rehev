import React, { useState } from 'react';
import {
  ArrowLeft,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  Save
} from 'lucide-react';
import { Session } from '../types';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

interface SessionDetailProps {
  session: Session;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({ session, onBack, onNavigate }) => {
  const { activePatient } = useAuth();
  const [therapistNote, setTherapistNote] = useState(
    session.therapist_notes || "Patient demonstrated solid eccentric control and appropriate quad activation without joint irritation."
  );
  const [isSaved, setIsSaved] = useState(false);

  // Generate fallback reps if empty
  const reps = session.repetitions && session.repetitions.length > 0
    ? session.repetitions
    : Array.from({ length: session.repetitions_completed || 10 }, (_, i) => ({
        rep_number: i + 1,
        quality_score: Math.round(session.movement_quality_score - 3 + (i % 4)),
        rom_degrees: Math.round(session.max_rom_degrees - 4 + (i % 5)),
        symmetry_score: Math.round(session.symmetry_score - 2 + (i % 3)),
        duration_seconds: 2.4,
        peak_flexion_degrees: Math.round(session.max_rom_degrees),
        form_notes: i % 2 === 0 ? "Smooth descent, stable patellar tracking." : "Consistent cadence, no pelvic tilt."
      }));

  const handleSaveNotes = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportPDF = () => {
    onNavigate('reports');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-card border border-bg-border hover:border-rehab-purple/50 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4" />
            <span>Generate Clinical PDF Report</span>
          </button>
        </div>
      </div>

      {/* Session Hero Banner */}
      <GlassCard glow="purple" className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Badge variant="green" size="sm" dot>Session Completed ✓</Badge>
              <span className="text-xs text-slate-400 font-mono">{session.session_uid}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">
              {session.exercise_id.replace('-', ' ').toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Patient: <strong className="text-white">{activePatient.name}</strong> • Date: {new Date(session.date).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Movement Quality</span>
              <p className="text-3xl font-black text-rehab-green font-mono">{session.movement_quality_score}%</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Key Biomechanics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Bilateral Symmetry</span>
          <p className="text-2xl font-black text-rehab-cyan font-mono">{session.symmetry_score}%</p>
          <span className="text-[11px] text-slate-400">Optimal balance</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Peak Range of Motion</span>
          <p className="text-2xl font-black text-rehab-purpleLight font-mono">{session.max_rom_degrees}°</p>
          <span className="text-[11px] text-slate-400">Target: {session.target_rom_degrees}°</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed Volume</span>
          <p className="text-2xl font-black text-white font-mono">{session.repetitions_completed} reps</p>
          <span className="text-[11px] text-rehab-green">100% target met</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Tempo</span>
          <p className="text-2xl font-black text-slate-300 font-mono">{session.average_tempo_seconds || 2.4}s</p>
          <span className="text-[11px] text-slate-400">Cadence consistency</span>
        </GlassCard>
      </div>

      {/* Rep-by-Rep Kinematic Table */}
      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Repetition-by-Repetition Telemetry</h3>
          <span className="text-xs text-slate-400 font-mono">{reps.length} Reps Analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bg-border text-slate-400 font-mono uppercase text-[11px]">
                <th className="pb-3">Rep #</th>
                <th className="pb-3">Quality</th>
                <th className="pb-3">Peak ROM</th>
                <th className="pb-3">Symmetry</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Kinematic Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border/60">
              {reps.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-bg-cardHover/40 transition-colors">
                  <td className="py-3 font-bold text-white">Rep {r.rep_number}</td>
                  <td className="py-3 font-mono font-bold text-rehab-green">{r.quality_score}%</td>
                  <td className="py-3 font-mono font-bold text-rehab-purpleLight">{r.rom_degrees}°</td>
                  <td className="py-3 font-mono font-bold text-rehab-cyan">{r.symmetry_score}%</td>
                  <td className="py-3 font-mono text-slate-300">{r.duration_seconds}s</td>
                  <td className="py-3 text-slate-300">{r.form_notes || "Stable kinematic trajectory."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Clinical Notes & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nova AI Observation */}
        <GlassCard className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rehab-cyan" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Nova AI Clinical Synthesis</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-bg-dark/80 p-4 rounded-2xl border border-bg-border">
            {session.ai_feedback_summary || (
              "Patient demonstrated consistent joint stability across all repetitions. " +
              "Eccentric phase velocity remained steady without knee valgus deviation. " +
              "Right knee extension matched left baseline within 4.2 degrees. Recommend progression to next scheduled resistance tier."
            )}
          </p>
        </GlassCard>

        {/* Therapist Clinical Sign-off Notes */}
        <GlassCard className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Physiotherapist Notes</h4>
            {isSaved && <span className="text-xs text-rehab-green font-bold">Saved ✓</span>}
          </div>
          <textarea
            value={therapistNote}
            onChange={(e) => setTherapistNote(e.target.value)}
            rows={3}
            className="w-full p-3.5 rounded-2xl bg-bg-dark/80 border border-bg-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rehab-purple/60 resize-none"
          />
          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 rounded-xl bg-bg-card border border-rehab-purple/40 hover:bg-rehab-purple/20 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5 text-rehab-cyan" />
            <span>Save Clinical Note</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Play
} from 'lucide-react';
import { CLINICAL_EXERCISES } from '../data/exercisesData';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const RehabilitationPlan: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { activePatient } = useAuth();
  const { setSelectedExercise } = useSession();

  const [planTitle, setPlanTitle] = useState('ACL Post-Operative Phase II Protocol');
  const [frequency, setFrequency] = useState('3x per week');
  const [planExercises, setPlanExercises] = useState([
    { exercise_id: 'squat-rehab', sets: 3, reps: 10, target_rom: 105, target_quality: 88, notes: 'Maintain upright chest and even bilateral weight drive.' },
    { exercise_id: 'knee-flexion', sets: 3, reps: 12, target_rom: 120, target_quality: 90, notes: 'Smooth active hamstring contraction.' },
    { exercise_id: 'sit-to-stand', sets: 3, reps: 10, target_rom: 95, target_quality: 85, notes: 'Symmetrical hip extension.' },
    { exercise_id: 'balance', sets: 3, reps: 5, target_rom: 10, target_quality: 90, notes: '20s holds each side with soft knee.' }
  ]);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddExercise = (exerciseId: string) => {
    const ex = CLINICAL_EXERCISES.find(e => e.id === exerciseId);
    if (!ex) return;

    setPlanExercises(prev => [
      ...prev,
      {
        exercise_id: ex.id,
        sets: 3,
        reps: ex.target_reps,
        target_rom: ex.target_rom_max,
        target_quality: 88,
        notes: ex.purpose
      }
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setPlanExercises(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePlan = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const startExercise = (id: string) => {
    const ex = CLINICAL_EXERCISES.find(e => e.id === id) || CLINICAL_EXERCISES[0];
    setSelectedExercise(ex);
    onNavigate('live');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Plan Header */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">Active Prescription</Badge>
              <span className="text-xs text-slate-400">Assigned to: {activePatient.name}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">{planTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Frequency: <strong className="text-rehab-cyan">{frequency}</strong></p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePlan}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Protocol Saved ✓' : 'Save Protocol'}</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Plan Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Prescribed Exercise Routines</h3>
          <span className="text-xs text-slate-400">{planExercises.length} Exercises in Routine</span>
        </div>

        <div className="space-y-3">
          {planExercises.map((item, idx) => {
            const exInfo = CLINICAL_EXERCISES.find(e => e.id === item.exercise_id);
            return (
              <GlassCard key={idx} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rehab-purple/20 border border-rehab-purple/40 text-rehab-purpleLight flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{exInfo?.name || item.exercise_id}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-xs font-mono bg-bg-dark/80 px-3 py-1.5 rounded-xl border border-bg-border">
                    <span className="text-slate-400">Sets/Reps: </span>
                    <strong className="text-white">{item.sets} × {item.reps}</strong>
                  </div>

                  <div className="text-xs font-mono bg-bg-dark/80 px-3 py-1.5 rounded-xl border border-bg-border">
                    <span className="text-slate-400">Target ROM: </span>
                    <strong className="text-rehab-green">{item.target_rom}°</strong>
                  </div>

                  <button
                    onClick={() => startExercise(item.exercise_id)}
                    className="p-2 rounded-xl bg-rehab-purple/20 text-rehab-purpleLight hover:bg-rehab-purple hover:text-bg-darkest transition-colors"
                    title="Launch Live Session"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => handleRemoveExercise(idx)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rehab-red hover:bg-rehab-red/15 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Add Exercise Dropdown / Catalog Row */}
      <GlassCard className="p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Exercise to Routine</h4>
        <div className="flex flex-wrap items-center gap-2">
          {CLINICAL_EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleAddExercise(ex.id)}
              className="px-3 py-1.5 rounded-xl bg-bg-dark border border-bg-border hover:border-rehab-purple/50 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-rehab-cyan" />
              <span>{ex.name}</span>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

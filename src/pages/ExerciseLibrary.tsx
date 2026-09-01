import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  RotateCcw,
  Camera,
  Activity,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CLINICAL_EXERCISES } from '../data/exercisesData';
import { Exercise } from '../types';
import { useSession } from '../context/SessionContext';
import { ExerciseModelViewer3D } from '../components/3d/ExerciseModelViewer3D';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const ExerciseLibrary: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { setSelectedExercise } = useSession();
  const [selectedEx, setSelectedEx] = useState<Exercise>(CLINICAL_EXERCISES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Knee & Hip', 'Knee', 'Functional Mobility', 'Hip & Knee', 'Elbow & Arm', 'Shoulder', 'Ankle & Calf', 'Balance', 'Posture & Spine'];

  const filteredExercises = selectedCategory === 'All'
    ? CLINICAL_EXERCISES
    : CLINICAL_EXERCISES.filter(e => e.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleStartExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    onNavigate('live');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest shadow-glow-purple font-bold'
                : 'bg-bg-card border border-bg-border text-slate-400 hover:text-white hover:border-rehab-purple/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Exercise Cards + Active 3D Anatomical Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Exercise Cards List (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map((ex) => {
            const isSelected = selectedEx.id === ex.id;
            return (
              <GlassCard
                key={ex.id}
                onClick={() => setSelectedEx(ex)}
                className={`space-y-3 cursor-pointer relative overflow-hidden transition-all ${
                  isSelected ? 'border-rehab-purple shadow-glow-purple bg-bg-cardHover/90' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rehab-cyan tracking-wider">{ex.category}</span>
                    <h3 className="text-sm font-extrabold text-white mt-0.5">{ex.name}</h3>
                  </div>
                  <Badge variant={ex.difficulty === 'Beginner' ? 'green' : ex.difficulty === 'Intermediate' ? 'amber' : 'red'} size="sm">
                    {ex.difficulty}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{ex.purpose}</p>

                <div className="pt-2 border-t border-bg-border/60 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    Target ROM: <span className="font-mono text-rehab-green font-bold">{ex.target_rom_min}°–{ex.target_rom_max}°</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartExercise(ex);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rehab-purple/20 border border-rehab-purple/50 text-rehab-purpleLight hover:bg-rehab-purple hover:text-bg-darkest text-xs font-bold transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* RIGHT: 3D Anatomical Kinematic Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <GlassCard glow="cyan" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-rehab-purpleLight">Selected Protocol</span>
                <h3 className="text-base font-extrabold text-white">{selectedEx.name}</h3>
              </div>
              <Badge variant="cyan" size="sm">{selectedEx.category}</Badge>
            </div>

            {/* 3D Animated Skeletal Mannequin Model */}
            <ExerciseModelViewer3D exercise={selectedEx} height={280} />

            {/* Clinical Kinematics Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-bg-dark/70 border border-bg-border">
                <span className="text-[10px] text-slate-400 uppercase">Target Sets & Reps</span>
                <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedEx.target_sets} sets × {selectedEx.target_reps} reps</p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-dark/70 border border-bg-border">
                <span className="text-[10px] text-slate-400 uppercase">Rest Interval</span>
                <p className="text-xs font-bold text-rehab-cyan font-mono mt-0.5">{selectedEx.rest_seconds} seconds</p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-dark/70 border border-bg-border col-span-2">
                <span className="text-[10px] text-slate-400 uppercase">Recommended Camera Setup</span>
                <p className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-rehab-purpleLight" />
                  {selectedEx.camera_angle}
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kinematic Instructions</h4>
              <div className="space-y-1.5">
                {selectedEx.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-rehab-purple/20 text-rehab-purpleLight flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Exercise Button */}
            <button
              onClick={() => handleStartExercise(selectedEx)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rehab-purple via-rehab-blue to-rehab-cyan text-bg-darkest font-extrabold text-xs tracking-wider uppercase shadow-glow-purple hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Computer Vision Session</span>
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

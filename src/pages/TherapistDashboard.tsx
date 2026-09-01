import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Search,
  Filter,
  Plus,
  Activity,
  Compass,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Patient, PatientStatus } from '../types';
import { INITIAL_PATIENTS } from '../data/initialData';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const TherapistDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { setActivePatient } = useAuth();
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Form state
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(30);
  const [newGender, setNewGender] = useState('Female');
  const [newCondition, setNewCondition] = useState('');
  const [newAffectedSide, setNewAffectedSide] = useState<'Left' | 'Right' | 'Bilateral' | 'None'>('Right');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    api.getPatients(searchQuery, selectedStatus).then(data => {
      setPatients(data);
    });
  }, [searchQuery, selectedStatus]);

  const handleOpenPatient = (p: Patient) => {
    setActivePatient(p);
    onNavigate('patients');
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCondition.trim()) return;

    const created = await api.createPatient({
      name: newName,
      age: newAge,
      gender: newGender,
      condition: newCondition,
      affected_side: newAffectedSide,
      primary_goal: newGoal || 'Restore functional range of motion',
      status: 'Improving'
    });

    setPatients(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewCondition('');
    setNewGoal('');
  };

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'Needs Review': return <Badge variant="red" size="sm" dot>Needs Review</Badge>;
      case 'Improving': return <Badge variant="green" size="sm" dot>Improving</Badge>;
      case 'Stable': return <Badge variant="cyan" size="sm" dot>Stable</Badge>;
      case 'Excellent': return <Badge variant="purple" size="sm" dot>Excellent</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Clinician Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-card/70 border border-bg-border rounded-2xl p-4 backdrop-blur-xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-rehab-cyan" />
            Therapist Clinical Command Center
          </h2>
          <p className="text-xs text-slate-400">Dr. Marcus Reynolds, DPT • Precision Kinetic Motion Center</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Patient Risk Stratification Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, condition, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-bg-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rehab-purple/60"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-card rounded-xl border border-bg-border overflow-x-auto">
          {['All', 'Needs Review', 'Improving', 'Stable', 'Excellent'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold shadow-glow-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <GlassCard
            key={p.id}
            onClick={() => handleOpenPatient(p)}
            className="p-5 space-y-4 cursor-pointer hover:border-rehab-purple/70 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rehab-purple/20 to-rehab-cyan/20 border border-rehab-purple/40 text-rehab-purpleLight flex items-center justify-center font-bold text-base shadow-glow-purple">
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-rehab-purpleLight transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">{p.patient_id_code}</span>
                  </div>
                </div>
                {getStatusBadge(p.status)}
              </div>

              <p className="text-xs text-rehab-cyan font-medium mt-3">{p.condition}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.primary_goal}</p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-bg-border text-center">
              <div className="p-2 rounded-xl bg-bg-dark/70">
                <span className="text-[9px] uppercase font-bold text-slate-400">Quality</span>
                <p className="text-sm font-extrabold text-rehab-green font-mono">{p.overall_quality_score}%</p>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/70">
                <span className="text-[9px] uppercase font-bold text-slate-400">Symmetry</span>
                <p className="text-sm font-extrabold text-rehab-cyan font-mono">{p.symmetry_score}%</p>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/70">
                <span className="text-[9px] uppercase font-bold text-slate-400">Adherence</span>
                <p className="text-sm font-extrabold text-white font-mono">{p.adherence_rate}%</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-darkest/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-bg-card border border-rehab-purple/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Enroll New Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jordan Mitchell"
                  className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none focus:border-rehab-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Injury / Rehabilitation Condition</label>
                <input
                  type="text"
                  required
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Meniscus Repair (Left Knee)"
                  className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Affected Side</label>
                  <select
                    value={newAffectedSide}
                    onChange={(e) => setNewAffectedSide(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Bilateral">Bilateral</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Rehabilitation Goal</label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Symmetrical gait and pain-free stair descent"
                  className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold shadow-glow-purple"
                >
                  Create Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

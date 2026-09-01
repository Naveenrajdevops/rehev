import React, { createContext, useContext, useState } from 'react';
import { Exercise, SessionRepetition, MovementPhase, JointAngles } from '../types';
import { CLINICAL_EXERCISES } from '../data/exercisesData';
import { audioCoach } from '../utils/audioCoach';

interface SessionContextType {
  selectedExercise: Exercise;
  setSelectedExercise: (exercise: Exercise) => void;
  isSessionActive: boolean;
  setIsSessionActive: (active: boolean) => void;
  repCount: number;
  setRepCount: (count: number) => void;
  movementPhase: MovementPhase;
  setMovementPhase: (phase: MovementPhase) => void;
  currentRom: number;
  setCurrentRom: (rom: number) => void;
  maxRomRecorded: number;
  setMaxRomRecorded: (rom: number) => void;
  qualityScore: number;
  setQualityScore: (q: number) => void;
  symmetryScore: number;
  setSymmetryScore: (s: number) => void;
  symmetryDiff: number;
  setSymmetryDiff: (diff: number) => void;
  poseConfidence: number;
  setPoseConfidence: (conf: number) => void;
  fps: number;
  setFps: (fps: number) => void;
  currentAngles: JointAngles;
  setCurrentAngles: (angles: JointAngles) => void;
  repetitions: SessionRepetition[];
  addRepetition: (rep: SessionRepetition) => void;
  resetSession: () => void;
  isVoiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  is3DMode: boolean;
  setIs3DMode: (is3d: boolean) => void;
}

const DEFAULT_ANGLES: JointAngles = {
  left_knee: 180,
  right_knee: 180,
  left_hip: 180,
  right_hip: 180,
  left_ankle: 90,
  right_ankle: 90,
  left_elbow: 180,
  right_elbow: 180,
  left_shoulder: 0,
  right_shoulder: 0
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(CLINICAL_EXERCISES[0]);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [repCount, setRepCount] = useState<number>(0);
  const [movementPhase, setMovementPhase] = useState<MovementPhase>('REST');
  const [currentRom, setCurrentRom] = useState<number>(0);
  const [maxRomRecorded, setMaxRomRecorded] = useState<number>(0);
  const [qualityScore, setQualityScore] = useState<number>(92);
  const [symmetryScore, setSymmetryScore] = useState<number>(94);
  const [symmetryDiff, setSymmetryDiff] = useState<number>(3.5);
  const [poseConfidence, setPoseConfidence] = useState<number>(0.95);
  const [fps, setFps] = useState<number>(30);
  const [currentAngles, setCurrentAngles] = useState<JointAngles>(DEFAULT_ANGLES);
  const [repetitions, setRepetitions] = useState<SessionRepetition[]>([]);
  const [isVoiceEnabled, setVoiceEnabledState] = useState<boolean>(true);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);

  const setVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    audioCoach.setEnabled(enabled);
  };

  const addRepetition = (rep: SessionRepetition) => {
    setRepetitions(prev => [...prev, rep]);
    setRepCount(rep.rep_number);
    if (rep.rom_degrees > maxRomRecorded) {
      setMaxRomRecorded(rep.rom_degrees);
    }
  };

  const resetSession = () => {
    setRepCount(0);
    setMovementPhase('REST');
    setCurrentRom(0);
    setMaxRomRecorded(0);
    setRepetitions([]);
    setCurrentAngles(DEFAULT_ANGLES);
  };

  return (
    <SessionContext.Provider
      value={{
        selectedExercise,
        setSelectedExercise,
        isSessionActive,
        setIsSessionActive,
        repCount,
        setRepCount,
        movementPhase,
        setMovementPhase,
        currentRom,
        setCurrentRom,
        maxRomRecorded,
        setMaxRomRecorded,
        qualityScore,
        setQualityScore,
        symmetryScore,
        setSymmetryScore,
        symmetryDiff,
        setSymmetryDiff,
        poseConfidence,
        setPoseConfidence,
        fps,
        setFps,
        currentAngles,
        setCurrentAngles,
        repetitions,
        addRepetition,
        resetSession,
        isVoiceEnabled,
        setVoiceEnabled,
        is3DMode,
        setIs3DMode
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};

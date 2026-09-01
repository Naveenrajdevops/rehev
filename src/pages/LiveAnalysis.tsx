import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Box,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Save,
  Zap,
  Activity,
  Compass,
  Maximize2,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { poseService } from '../services/poseService';
import { computeAllJointAngles } from '../utils/angles';
import { RepetitionEngine } from '../utils/repCounter';
import { calculateBilateralSymmetry } from '../utils/symmetry';
import { calculateMovementQuality } from '../utils/scoring';
import { audioCoach } from '../utils/audioCoach';
import { generateSimulatedLandmarks } from '../utils/motionSimulator';
import { api } from '../services/api';
import { Landmark3D, CameraGuidance } from '../types';
import { CLINICAL_EXERCISES } from '../data/exercisesData';
import { LivePose3D } from '../components/3d/LivePose3D';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const LiveAnalysis: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const {
    selectedExercise,
    setSelectedExercise,
    isVoiceEnabled,
    setVoiceEnabled,
    is3DMode,
    setIs3DMode,
  } = useSession();
  const { activePatient } = useAuth();

  // Camera & Stream Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const repEngineRef = useRef<RepetitionEngine>(new RepetitionEngine(selectedExercise));
  const simIntervalRef = useRef<number | null>(null);

  // Live Analysis States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark3D[]>([]);
  const [poseConfidence, setPoseConfidence] = useState<number>(0.95);
  const [fps, setFps] = useState<number>(30);
  const [guidance, setGuidance] = useState<CameraGuidance>({
    isFullyVisible: true,
    warnings: [],
    poseConfidence: 0.95,
    fps: 30,
  });

  // Biomechanical Live States
  const [repCount, setRepCount] = useState<number>(0);
  const [movementPhase, setMovementPhase] = useState<string>('REST');
  const [currentRom, setCurrentRom] = useState<number>(0);
  const [minAngleObserved, setMinAngleObserved] = useState<number>(180);
  const [maxAngleObserved, setMaxAngleObserved] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(2.4);
  const [qualityScore, setQualityScore] = useState<number>(92);
  const [symmetryScore, setSymmetryScore] = useState<number>(94);
  const [symmetryDiff, setSymmetryDiff] = useState<number>(3.5);
  const [symmetryObservation, setSymmetryObservation] = useState<string>('Balanced bilateral symmetry.');
  const [qualityAdvisory, setQualityAdvisory] = useState<string>('Smooth repetition form.');
  const [jointAngles, setJointAngles] = useState<Record<string, number>>({
    left_knee: 180, right_knee: 180, left_hip: 180, right_hip: 180,
    left_elbow: 180, right_elbow: 180, left_shoulder: 0, right_shoulder: 0,
    left_ankle: 90, right_ankle: 90
  });

  const [sessionStartTime] = useState<number>(Date.now());
  const [completedRepetitionsList, setCompletedRepetitionsList] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSessionUid, setSavedSessionUid] = useState<string | null>(null);

  // Update Rep Engine when exercise changes
  useEffect(() => {
    repEngineRef.current.setExercise(selectedExercise);
    resetCounters();
  }, [selectedExercise]);

  const resetCounters = () => {
    repEngineRef.current.reset();
    setRepCount(0);
    setMovementPhase('REST');
    setCurrentRom(0);
    setMinAngleObserved(180);
    setMaxAngleObserved(0);
    setCompletedRepetitionsList([]);
    setSavedSessionUid(null);
  };

  // Computer Vision Frame Loop Callback
  const handlePoseResults = useCallback((detectedLandmarks: Landmark3D[], confidence: number) => {
    if (isPaused) return;

    setLandmarks(detectedLandmarks);
    setPoseConfidence(confidence);

    const guide = poseService.evaluateGuidance(detectedLandmarks, confidence);
    setGuidance(guide);
    setFps(poseService.getFps());

    if (detectedLandmarks.length >= 33) {
      // 1. Calculate Joint Angles
      const angles = computeAllJointAngles(detectedLandmarks);
      setJointAngles(angles);

      // 2. Update Repetition State Machine
      const repUpdate = repEngineRef.current.update(angles);
      setRepCount(repUpdate.state.count);
      setMovementPhase(repUpdate.state.phase);
      setCurrentRom(repUpdate.state.currentRom);
      setMinAngleObserved(repUpdate.state.minRom);
      setMaxAngleObserved(repUpdate.state.maxRom);
      setTempo(repUpdate.state.tempo);

      // 3. Bilateral Symmetry Engine
      const sym = calculateBilateralSymmetry(angles, selectedExercise);
      setSymmetryScore(sym.symmetryScore);
      setSymmetryDiff(sym.differenceDegrees);
      setSymmetryObservation(sym.clinicalObservation);

      // 4. Movement Quality Engine
      const qual = calculateMovementQuality(repUpdate.state, sym, selectedExercise, confidence);
      setQualityScore(qual.score);
      setQualityAdvisory(qual.advisory);

      // 5. If repetition just completed, handle audio and list
      if (repUpdate.repCompleted && repUpdate.repData) {
        audioCoach.speakRepCount(repUpdate.repData.repNumber);
        
        const newRep = {
          rep_number: repUpdate.repData.repNumber,
          quality_score: qual.score,
          rom_degrees: repUpdate.repData.rom,
          symmetry_score: sym.symmetryScore,
          duration_seconds: repUpdate.repData.duration,
          peak_flexion_degrees: repUpdate.repData.peakFlexion,
          form_notes: qual.advisory
        };
        setCompletedRepetitionsList(prev => [...prev, newRep]);

        if (repUpdate.repData.repNumber === selectedExercise.target_reps) {
          audioCoach.speakCompletion();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }

      // 6. Draw 2D Canvas Skeleton Overlay
      const canvas = canvasRef.current;
      if (canvas && !is3DMode) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          poseService.renderSkeleton(ctx, detectedLandmarks, canvas.width, canvas.height, angles);
        }
      }
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isPaused, selectedExercise, is3DMode]);

  // Start Camera Stream
  const startCamera = async () => {
    stopSimulation();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access requires HTTPS or localhost.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Initialize MediaPipe Pose Landmarker
      await poseService.initializePose(handlePoseResults);
      setIsCameraActive(true);
      setIsSimulatedMode(false);

      // Start video frame inference loop
      let animId: number;
      const processLoop = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          await poseService.sendFrame(videoRef.current);
        }
        animId = requestAnimationFrame(processLoop);
      };
      animId = requestAnimationFrame(processLoop);

    } catch (err: any) {
      console.error("Camera startup error:", err);
      setCameraError(err.message || "Failed to access webcam. Please allow camera permissions.");
      setIsCameraActive(false);
    }
  };

  // Start Simulated Landmark Motion Stream
  const startSimulation = () => {
    stopCamera();
    setIsSimulatedMode(true);
    setIsCameraActive(true);
    setCameraError(null);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 640;
      canvas.height = 480;
    }

    let startTime = performance.now();
    const interval = window.setInterval(() => {
      if (isPaused) return;
      const elapsed = (performance.now() - startTime) / 1000;
      const { landmarks: simLandmarks, confidence } = generateSimulatedLandmarks(elapsed, selectedExercise.id);
      handlePoseResults(simLandmarks, confidence);
    }, 33); // ~30 FPS

    simIntervalRef.current = interval;
  };

  const stopSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSimulatedMode(false);
  };

  // Stop Camera Stream
  const stopCamera = () => {
    stopSimulation();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    poseService.close();
    setIsCameraActive(false);

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopSimulation();
    };
  }, []);

  // Save Completed Session to Database
  const handleSaveSession = async () => {
    setIsSaving(true);
    const durationSeconds = Math.max(30, Math.round((Date.now() - sessionStartTime) / 1000));

    const sessionPayload = {
      patient_id: activePatient.id,
      exercise_id: selectedExercise.id,
      duration_seconds: durationSeconds,
      repetitions_completed: repCount,
      target_repetitions: selectedExercise.target_reps,
      sets_completed: 1,
      target_sets: selectedExercise.target_sets,
      movement_quality_score: qualityScore,
      symmetry_score: symmetryScore,
      min_rom_degrees: minAngleObserved,
      max_rom_degrees: maxAngleObserved,
      avg_rom_degrees: currentRom,
      target_rom_degrees: selectedExercise.target_rom_max,
      average_confidence: poseConfidence,
      average_tempo_seconds: tempo,
      ai_feedback_summary: `Completed ${repCount} reps of ${selectedExercise.name}. Achieved ${qualityScore}% movement quality with ${symmetryScore}% symmetry score. ${qualityAdvisory}`,
      completion_status: 'Completed' as const,
      repetitions: completedRepetitionsList
    };

    const saved = await api.createSession(sessionPayload);
    setIsSaving(false);
    setSavedSessionUid(saved.session_uid);
    confetti({ particleCount: 80, spread: 60 });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Disclaimer */}
      <DisclaimerBanner compact />

      {/* Top CV Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-card/70 border border-bg-border rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rehab-purple/20 border border-rehab-purple/40 text-rehab-purpleLight">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Computer Vision Workspace
              <Badge variant={isCameraActive ? 'green' : 'slate'} size="sm" dot={isCameraActive}>
                {isSimulatedMode ? 'Simulated Kinematics Stream' : isCameraActive ? 'Tracking Live Webcam' : 'Camera Idle'}
              </Badge>
            </h2>
            <p className="text-xs text-slate-400">MediaPipe 33-point Landmark Biomechanics Engine</p>
          </div>
        </div>

        {/* Exercise Selection Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Exercise:</label>
          <select
            value={selectedExercise.id}
            onChange={(e) => {
              const ex = CLINICAL_EXERCISES.find(x => x.id === e.target.value) || CLINICAL_EXERCISES[0];
              setSelectedExercise(ex);
            }}
            className="px-3 py-2 rounded-xl bg-bg-dark border border-bg-border text-xs font-semibold text-white focus:outline-none focus:border-rehab-purple/60"
          >
            {CLINICAL_EXERCISES.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Camera Error Message */}
      {cameraError && (
        <div className="p-4 rounded-2xl bg-rehab-red/15 border border-rehab-red/40 text-rehab-red text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong>Camera Error: </strong> {cameraError}
              <p className="text-[11px] text-slate-300 mt-1">You can test the entire biomechanics engine right now using Simulated Motion Feed.</p>
            </div>
          </div>
          <button
            onClick={startSimulation}
            className="px-3.5 py-1.5 rounded-xl bg-rehab-purple text-bg-darkest font-bold text-xs shadow-glow-purple whitespace-nowrap ml-4"
          >
            Launch Simulated Motion
          </button>
        </div>
      )}

      {/* Main Computer Vision Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live Video / Canvas Overlay (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative rounded-3xl overflow-hidden bg-bg-darkest border-2 border-rehab-purple/30 shadow-2xl aspect-[4/3] flex items-center justify-center group">
            {/* Real HTML5 Webcam Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] ${isCameraActive && !isSimulatedMode ? 'block' : 'hidden'}`}
              onLoadedMetadata={() => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth || 640;
                  canvasRef.current.height = videoRef.current.videoHeight || 480;
                }
              }}
            />

            {/* 2D Skeletal Canvas Overlay */}
            {!is3DMode && (
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transform scale-x-[-1] ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />
            )}

            {/* 3D Skeletal Mode Space Viewer */}
            {is3DMode && isCameraActive && (
              <div className="absolute inset-0 w-full h-full z-10 bg-bg-darkest/90">
                <LivePose3D landmarks={landmarks} confidence={poseConfidence} />
              </div>
            )}

            {/* Camera Inactive Placeholder */}
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-bg-card/80 border border-rehab-purple/30 flex items-center justify-center shadow-glow-purple">
                  <Camera className="w-10 h-10 text-rehab-purpleLight animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Camera Ready for Live Analysis</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Target Exercise: <strong className="text-rehab-cyan">{selectedExercise.name}</strong>.
                    Position yourself 2.5m - 3m away from the camera for full-body skeletal tracking.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-extrabold text-xs shadow-glow-purple hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Webcam Feed</span>
                  </button>
                  <button
                    onClick={startSimulation}
                    className="px-4 py-3 rounded-2xl bg-bg-card border border-rehab-purple/40 text-white font-semibold text-xs hover:border-rehab-purple/80 hover:bg-bg-cardHover transition-all flex items-center gap-2"
                  >
                    <Film className="w-4 h-4 text-rehab-cyan" />
                    <span>Simulated Stream</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live HUD Floating Badges on Video */}
            {isCameraActive && (
              <>
                {/* Top Left: FPS & Tracking Status */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-bg-darkest/80 border border-bg-border text-[11px] font-mono text-rehab-green backdrop-blur-md">
                    {fps} FPS
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-bg-darkest/80 border border-bg-border text-[11px] font-mono text-rehab-cyan backdrop-blur-md">
                    Conf: {(poseConfidence * 100).toFixed(0)}%
                  </span>
                  {isSimulatedMode && (
                    <span className="px-2 py-0.5 rounded-full bg-rehab-amber/20 border border-rehab-amber/40 text-[10px] font-mono text-rehab-amber">
                      Simulation Active
                    </span>
                  )}
                </div>

                {/* Top Right: Phase Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <span className={`px-3 py-1 rounded-full font-bold text-xs tracking-wider uppercase backdrop-blur-md border ${
                    movementPhase === 'INFLECTION'
                      ? 'bg-rehab-green/25 text-rehab-green border-rehab-green/50 shadow-glow-green'
                      : movementPhase === 'ECCENTRIC'
                      ? 'bg-rehab-amber/25 text-rehab-amber border-rehab-amber/50'
                      : 'bg-bg-darkest/80 text-rehab-purpleLight border-bg-border'
                  }`}>
                    {movementPhase} PHASE
                  </span>
                </div>

                {/* Bottom Center: Guidance Warning Alerts */}
                {guidance.warnings.length > 0 && !isSimulatedMode && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-1 items-center">
                    {guidance.warnings.map((w, i) => (
                      <div
                        key={i}
                        className="px-3.5 py-1.5 rounded-full bg-rehab-amber/90 text-bg-darkest font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Camera Workspace Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-bg-card/70 border border-bg-border backdrop-blur-xl">
            <div className="flex items-center gap-2">
              {!isCameraActive ? (
                <>
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Webcam</span>
                  </button>
                  <button
                    onClick={startSimulation}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-dark border border-bg-border text-xs text-slate-300 hover:text-white"
                  >
                    <Film className="w-3.5 h-3.5 text-rehab-cyan" />
                    <span>Simulate Motion</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rehab-red/20 border border-rehab-red/50 text-rehab-red font-semibold text-xs hover:bg-rehab-red/30 transition-colors"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Feed</span>
                  </button>

                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      isPaused
                        ? 'bg-rehab-amber/20 border-rehab-amber/50 text-rehab-amber'
                        : 'bg-bg-dark border-bg-border text-slate-300 hover:text-white'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={resetCounters}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-dark border border-bg-border text-slate-400 hover:text-white text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 2D / 3D Skeleton Mode Switcher */}
              <button
                onClick={() => setIs3DMode(!is3DMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  is3DMode
                    ? 'bg-rehab-cyan/20 border-rehab-cyan text-rehab-cyan shadow-glow-cyan'
                    : 'bg-bg-dark border-bg-border text-slate-400 hover:text-white'
                }`}
              >
                {is3DMode ? <Layers className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                <span>{is3DMode ? '2D View' : '3D Spatial View'}</span>
              </button>

              {/* Voice Guidance Toggle */}
              <button
                onClick={() => setVoiceEnabled(!isVoiceEnabled)}
                className={`p-2 rounded-xl border transition-colors ${
                  isVoiceEnabled
                    ? 'bg-rehab-purple/20 border-rehab-purple/50 text-rehab-purpleLight'
                    : 'bg-bg-dark border-bg-border text-slate-500 hover:text-slate-300'
                }`}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Biomechanical Analysis Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Repetition Counter & Target HUD */}
          <GlassCard glow="purple" className="relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rehab-purpleLight tracking-wider uppercase">Repetitions</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-black text-white tracking-tight">{repCount}</span>
                  <span className="text-xl font-bold text-slate-500">/ {selectedExercise.target_reps} reps</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tempo</span>
                <p className="text-2xl font-extrabold text-rehab-cyan font-mono">{tempo.toFixed(1)}s</p>
                <span className="text-[10px] text-slate-400">Target: 2.5s</span>
              </div>
            </div>

            {/* Rep Progress Bar */}
            <div className="w-full bg-bg-darkest h-2.5 rounded-full overflow-hidden border border-bg-border/60">
              <div
                className="bg-gradient-to-r from-rehab-purple to-rehab-cyan h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (repCount / selectedExercise.target_reps) * 100)}%` }}
              />
            </div>

            {/* Quality & Symmetry Summary Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-bg-dark/80 border border-bg-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Movement Quality</span>
                <p className="text-xl font-extrabold text-rehab-green mt-0.5">{qualityScore}%</p>
                <span className="text-[10px] text-slate-400">AI Estimate</span>
              </div>

              <div className="p-3 rounded-xl bg-bg-dark/80 border border-bg-border">
                <span className="text-[10px] uppercase font-bold text-slate-400">Bilateral Symmetry</span>
                <p className="text-xl font-extrabold text-rehab-cyan mt-0.5">{symmetryScore}%</p>
                <span className="text-[10px] text-slate-400">Δ {symmetryDiff}° diff</span>
              </div>
            </div>

            {/* Live Form Guidance Cue */}
            <div className="p-3 rounded-xl bg-rehab-purple/10 border border-rehab-purple/30 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-rehab-cyan flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">AI Kinematic Coach: </strong>
                <span className="text-slate-300">{qualityAdvisory} {symmetryObservation}</span>
              </div>
            </div>
          </GlassCard>

          {/* Range of Motion (ROM) Card */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rehab-green" />
                Range of Motion (ROM)
              </h4>
              <Badge variant="green" size="sm">
                Target: {selectedExercise.target_rom_min}° – {selectedExercise.target_rom_max}°
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-bg-dark/70 border border-bg-border">
                <span className="text-[10px] text-slate-400 uppercase">Current Angle</span>
                <p className="text-base font-bold text-white font-mono">{Math.round(currentRom)}°</p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-dark/70 border border-bg-border">
                <span className="text-[10px] text-slate-400 uppercase">Min Angle</span>
                <p className="text-base font-bold text-rehab-purpleLight font-mono">{Math.round(minAngleObserved)}°</p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-dark/70 border border-bg-border">
                <span className="text-[10px] text-slate-400 uppercase">Peak Flexion</span>
                <p className="text-base font-bold text-rehab-cyan font-mono">{Math.round(maxAngleObserved)}°</p>
              </div>
            </div>
          </GlassCard>

          {/* Real-time 10-Joint Angle Telemetry Table */}
          <GlassCard className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-rehab-purpleLight" />
                Joint Angle Telemetry (Degrees)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Vector Dot-Product</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-bg-dark/60 border border-bg-border flex items-center justify-between font-mono">
                <span className="text-slate-400">LEFT KNEE</span>
                <span className="text-rehab-green font-bold">{Math.round(jointAngles.left_knee)}°</span>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/60 border border-bg-border flex items-center justify-between font-mono">
                <span className="text-slate-400">RIGHT KNEE</span>
                <span className="text-rehab-green font-bold">{Math.round(jointAngles.right_knee)}°</span>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/60 border border-bg-border flex items-center justify-between font-mono">
                <span className="text-slate-400">LEFT HIP</span>
                <span className="text-rehab-cyan font-bold">{Math.round(jointAngles.left_hip)}°</span>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/60 border border-bg-border flex items-center justify-between font-mono">
                <span className="text-slate-400">RIGHT HIP</span>
                <span className="text-rehab-cyan font-bold">{Math.round(jointAngles.right_hip)}°</span>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/60 border border-bg-border flex items-center justify-between font-mono">
                <span className="text-slate-400">LEFT ELBOW</span>
                <span className="text-rehab-purpleLight font-bold">{Math.round(jointAngles.left_elbow)}°</span>
              </div>
              <div className="p-2 rounded-xl bg-bg-dark/60 border border-bg-border flex items-center justify-between font-mono">
                <span className="text-slate-400">RIGHT ELBOW</span>
                <span className="text-rehab-purpleLight font-bold">{Math.round(jointAngles.right_elbow)}°</span>
              </div>
            </div>
          </GlassCard>

          {/* Session Saving & Recording Action */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSaveSession}
              disabled={repCount === 0 || isSaving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rehab-purple via-rehab-blue to-rehab-cyan text-bg-darkest font-extrabold text-xs tracking-wider uppercase shadow-glow-purple disabled:opacity-40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Recording Session...' : 'Save & Complete Session'}</span>
            </button>

            {savedSessionUid && (
              <div className="p-3 rounded-xl bg-rehab-green/15 border border-rehab-green/40 text-rehab-green text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved as <strong>{savedSessionUid}</strong></span>
                </span>
                <button
                  onClick={() => onNavigate('sessions')}
                  className="font-bold underline hover:text-white"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

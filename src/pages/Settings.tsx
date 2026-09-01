import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  Camera,
  Shield,
  Eye,
  CheckCircle2,
  Save,
  Zap,
  HardDrive
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const { isVoiceEnabled, setVoiceEnabled, is3DMode, setIs3DMode } = useSession();
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('default');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(65);
  const [accentColor, setAccentColor] = useState<'purple' | 'cyan' | 'blue'>('purple');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const cameras = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(cameras);
      }).catch(() => {});
    }
  }, []);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-rehab-purpleLight" />
              Platform Configuration & Vision Preferences
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure audio coaching, computer vision thresholds, and privacy</p>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Settings Saved ✓' : 'Save Settings'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Vision & Camera Settings */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Camera className="w-4 h-4 text-rehab-cyan" />
          Camera & Computer Vision Telemetry
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">Default Webcam Source</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none focus:border-rehab-purple"
            >
              <option value="default">Default Built-in / System Camera</option>
              {videoDevices.map((dev, idx) => (
                <option key={dev.deviceId || idx} value={dev.deviceId}>
                  {dev.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-300">
              <span>Pose Confidence Threshold Filter</span>
              <span className="text-rehab-green font-mono">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-rehab-purple"
            />
            <p className="text-[11px] text-slate-400 mt-1">Frames with landmark confidence below this threshold will prompt repositioning alerts.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-bg-border">
            <div>
              <p className="font-semibold text-white">Enable 3D Spatial Skeleton View</p>
              <p className="text-[11px] text-slate-400">Render 3D coordinate landmark space in Live Analysis workspace</p>
            </div>
            <input
              type="checkbox"
              checked={is3DMode}
              onChange={(e) => setIs3DMode(e.target.checked)}
              className="w-5 h-5 accent-rehab-cyan rounded cursor-pointer"
            />
          </div>
        </div>
      </GlassCard>

      {/* Audio Coaching Settings */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-rehab-purpleLight" />
          Nova Voice Feedback & Audio Synthesizer
        </h3>

        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white">Real-Time Voice Coaching</p>
            <p className="text-[11px] text-slate-400">Auditory repetition counts, cadence feedback, and form corrections</p>
          </div>
          <input
            type="checkbox"
            checked={isVoiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
            className="w-5 h-5 accent-rehab-purple rounded cursor-pointer"
          />
        </div>
      </GlassCard>

      {/* Privacy & Edge Inference Guarantee */}
      <GlassCard className="p-6 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-rehab-green" />
          Privacy & On-Device Processing
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          RehabAI Pro executes computer vision inference directly on-device in your browser using WebAssembly and WebGL. Your video feed is never uploaded to cloud servers or stored externally without explicit patient consent.
        </p>
        <Badge variant="green" size="sm" dot>Local On-Device Inference Active</Badge>
      </GlassCard>
    </div>
  );
};

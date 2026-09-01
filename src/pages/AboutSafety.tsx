import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Eye,
  Lock,
  HeartHandshake,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const AboutSafety: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Primary Medical Ethics & Safety Disclaimer Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-bg-card via-bg-dark to-bg-card border-2 border-rehab-amber/40 shadow-2xl space-y-3">
        <div className="flex items-center gap-3 text-rehab-amber">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-base font-extrabold text-white">Non-Diagnostic Prototype Notice</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>REHABAI PRO IS NOT A MEDICAL DIAGNOSTIC DEVICE.</strong> This platform is an assistive computer-vision prototype designed to aid licensed physiotherapists and patients in tracking movement adherence, range of motion estimates, and repetition cadence.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          The kinematic measurements, quality scores, and Nova AI suggestions are algorithmic estimates derived from monocular webcam computer vision. They must never be interpreted as clinical diagnoses, surgical clearances, or medical prescriptions. Always follow the direct guidance of your licensed healthcare provider.
        </p>
      </div>

      {/* Computer Vision & Kinematic Architecture Pipeline */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-rehab-cyan" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Kinematic Computer Vision Architecture
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              step: '1. Monocular Video Stream',
              desc: 'Captured via standard HTML5 getUserMedia at up to 60 FPS in 720p/1080p resolution.'
            },
            {
              step: '2. MediaPipe Pose Landmark Estimation',
              desc: 'Processes 33 3D anatomical landmarks (shoulders, elbows, hips, knees, ankles, feet) with on-device WebAssembly/WebGL.'
            },
            {
              step: '3. Vector Trigonometric Joint Angle Calculations',
              desc: 'Computes interior 3D angles across 10 key joints using normalized vector dot products (cos θ = u·v / (|u||v|)).'
            },
            {
              step: '4. Biomechanical Repetition State Machine',
              desc: 'Finite state machine (REST → ECCENTRIC → INFLECTION → CONCENTRIC) with hysteresis and debouncing to eliminate false positive counts.'
            },
            {
              step: '5. Bilateral Symmetry & Movement Quality Engine',
              desc: 'Calculates bilateral delta differences (degrees) and composite quality scores factoring ROM target adherence, tempo, and stability.'
            },
            {
              step: '6. Nova AI Clinical Coach Dialogue',
              desc: 'Provides non-judgmental auditory feedback and structured conversational insights tailored to live session metrics.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-bg-dark/80 border border-bg-border flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-rehab-purple/20 text-rehab-purpleLight flex items-center justify-center font-bold text-xs flex-shrink-0">
                {idx + 1}
              </span>
              <div>
                <h4 className="font-bold text-white">{item.step}</h4>
                <p className="text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Patient Privacy & Data Security */}
      <GlassCard className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-rehab-green" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Privacy & Data Security Protocols
          </h3>
        </div>

        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
          <li><strong>Local Video Processing:</strong> Video frames are processed entirely in memory inside the client browser. No raw video feed is uploaded to third-party cloud servers.</li>
          <li><strong>Disidentified Numerical Telemetry:</strong> Only calculated numerical metrics (joint angles, repetition counts, duration) are saved to the clinical session database.</li>
          <li><strong>Role-Based Access Controls:</strong> Clinician and patient profiles are isolated using JWT authentication and encrypted data transit.</li>
        </ul>
      </GlassCard>
    </div>
  );
};

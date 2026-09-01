import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-dark/70 border border-bg-border text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-rehab-purpleLight flex-shrink-0" />
        <span>
          <strong className="text-slate-300">AI-Assisted Prototype:</strong> Kinematic estimates are for rehabilitation guidance, not medical diagnosis.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-bg-card/80 to-bg-dark/90 border border-rehab-purple/20 p-3.5 flex items-start gap-3 text-xs text-slate-300 backdrop-blur-md">
      <ShieldAlert className="w-5 h-5 text-rehab-amber flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-white">Clinical Safety & Ethics Notice: </span>
        RehabAI Pro is an AI-assisted movement analysis and rehabilitation logging software platform. It is designed to assist physiotherapists and patients with exercise adherence and kinematic estimation. It does NOT provide clinical diagnoses or replace evaluation by a licensed healthcare clinician. If you experience sharp pain or discomfort, cease exercise immediately.
      </div>
    </div>
  );
};

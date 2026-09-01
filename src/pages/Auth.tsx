import React, { useState } from 'react';
import {
  Activity,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const Auth: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { setUserRole } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('therapist@rehabai.io');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Dr. Marcus Reynolds, DPT');
  const [role, setRole] = useState<'therapist' | 'patient' | 'admin'>('therapist');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserRole(role);
    onLoginSuccess();
  };

  const handleQuickLogin = (selectedRole: 'therapist' | 'patient' | 'admin') => {
    setUserRole(selectedRole);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-bg-darkest">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rehab-purple/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rehab-cyan/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-rehab-purple to-rehab-cyan items-center justify-center shadow-glow-purple mb-2">
            <Activity className="w-8 h-8 text-bg-darkest" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">REHABAI PRO</h1>
          <p className="text-xs uppercase font-semibold text-rehab-purpleLight tracking-wider">
            AI-Powered Rehabilitation Intelligence
          </p>
        </div>

        {/* Auth Box */}
        <GlassCard glow="purple" className="p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-bg-border pb-3">
            <h2 className="text-base font-extrabold text-white">
              {isLogin ? 'Sign In to Platform' : 'Create Clinician Account'}
            </h2>
            <Badge variant="purple" size="sm">v1.0 Pro</Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLogin && (
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none focus:border-rehab-purple"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none focus:border-rehab-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none focus:border-rehab-purple"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-bg-dark border border-bg-border text-white focus:outline-none"
              >
                <option value="therapist">Physiotherapist / Clinician</option>
                <option value="patient">Rehabilitation Patient</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Demo Role Logins */}
          <div className="pt-3 border-t border-bg-border space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block text-center tracking-wider">
              Instant One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('therapist')}
                className="p-2 rounded-xl bg-bg-dark border border-rehab-purple/30 hover:border-rehab-purple text-[11px] font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-rehab-purpleLight" />
                <span>Dr. Reynolds (PT)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('patient')}
                className="p-2 rounded-xl bg-bg-dark border border-rehab-cyan/30 hover:border-rehab-cyan text-[11px] font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-rehab-cyan" />
                <span>Eleanor (Patient)</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Mic,
  MicOff,
  User,
  ArrowRight,
  Activity,
  Compass,
  RotateCcw,
  ShieldAlert,
  Volume2,
  VolumeX
} from 'lucide-react';
import { NovaOrb3D } from '../components/3d/NovaOrb3D';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { api } from '../services/api';
import { audioCoach } from '../utils/audioCoach';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const AICoach: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { activePatient } = useAuth();
  const { selectedExercise, repCount, qualityScore, symmetryScore, currentRom, poseConfidence, isVoiceEnabled, setVoiceEnabled } = useSession();

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'nova'; text: string; time?: string }>>([
    {
      sender: 'nova',
      text: `Hello ${activePatient.name.split(' ')[0]}! I'm Nova, your RehabAI Clinical Coach. I've reviewed your latest sessions for ${selectedExercise.name}. Your right knee symmetry improved by +6.2° this week. How can I help with your recovery today?`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Explain my movement score",
    "How is symmetry calculated?",
    "Show my ROM targets",
    "Prepare notes for my therapist",
    "What should I improve?"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = text.trim();
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(true);

    const sessionContext = {
      exercise_name: selectedExercise.name,
      reps: repCount,
      target_reps: selectedExercise.target_reps,
      quality: qualityScore,
      symmetry: symmetryScore,
      rom: currentRom,
      target_rom: selectedExercise.target_rom_max,
      confidence: Math.round(poseConfidence * 100)
    };

    const res = await api.sendMessageToNova(userMsg, activePatient.id, sessionContext);
    setIsTyping(false);
    setMessages(prev => [...prev, { sender: 'nova', text: res.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    if (res.suggestions && res.suggestions.length > 0) {
      setSuggestions(res.suggestions);
    }

    if (isVoiceEnabled) {
      audioCoach.speak(res.message.substring(0, 160));
    }
  };

  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 items-start h-[calc(100vh-140px)]">
      {/* LEFT: Chat Conversation Center (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-full rounded-3xl bg-bg-card/85 border border-rehab-purple/35 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Chat Topbar */}
        <div className="p-4 border-b border-bg-border bg-bg-dark/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-bg-card border border-rehab-purple/40 flex items-center justify-center overflow-hidden shadow-glow-purple">
              <NovaOrb3D size={48} state={isTyping ? 'speaking' : isListening ? 'listening' : 'idle'} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Nova
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rehab-purple/20 text-rehab-purpleLight border border-rehab-purple/40">
                  RehabAI Clinical Coach
                </span>
              </h2>
              <p className="text-xs text-slate-400">Contextual Rehabilitation AI • Non-Diagnostic</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!isVoiceEnabled)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                isVoiceEnabled ? 'bg-rehab-purple/20 border-rehab-purple/50 text-rehab-purpleLight' : 'bg-bg-dark border-bg-border text-slate-500'
              }`}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'nova' && (
                <div className="w-8 h-8 rounded-xl bg-rehab-purple/20 border border-rehab-purple/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-rehab-purpleLight" />
                </div>
              )}
              <div className={`max-w-[78%] space-y-1`}>
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-rehab-purple to-rehab-blue text-white rounded-br-none shadow-glow-purple font-medium'
                      : 'bg-bg-dark/90 border border-bg-border text-slate-200 rounded-bl-none shadow-lg'
                  }`}
                >
                  {m.text}
                </div>
                {m.time && (
                  <p className={`text-[10px] text-slate-500 font-mono ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.time}
                  </p>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-bg-card border border-bg-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-xs text-rehab-purpleLight p-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rehab-cyan animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-rehab-purple animate-bounce [animation-delay:0.2s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-rehab-green animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 font-mono">Nova is formulating clinical feedback...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div className="px-4 py-2.5 border-t border-bg-border/60 bg-bg-dark/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {suggestions.map((sugg, i) => (
            <button
              key={i}
              onClick={() => handleSend(sugg)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-bg-card border border-bg-border hover:border-rehab-purple/60 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <span>{sugg}</span>
              <ArrowRight className="w-3 h-3 text-rehab-cyan" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-bg-border bg-bg-dark/95 flex items-center gap-3">
          <button
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rehab-red/20 border-rehab-red text-rehab-red animate-pulse'
                : 'bg-bg-card border-bg-border text-slate-400 hover:text-white'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening to your voice..." : "Ask Nova about your movement quality, pain cues, or progress..."}
            className="flex-1 px-4 py-3 rounded-2xl bg-bg-card border border-bg-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rehab-purple/60"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Live Session Context Drawer (4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        <GlassCard glow="cyan" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Patient Context</h3>
            <Badge variant="cyan" size="sm">Live Connected</Badge>
          </div>

          <div className="p-3.5 rounded-2xl bg-bg-dark/80 border border-bg-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient:</span>
              <strong className="text-white">{activePatient.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Condition:</span>
              <strong className="text-rehab-cyan">{activePatient.condition}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Affected Side:</span>
              <strong className="text-white">{activePatient.affected_side}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Exercise:</span>
              <strong className="text-rehab-purpleLight">{selectedExercise.name}</strong>
            </div>
          </div>

          {/* Kinematic Telemetry Meters */}
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Movement Quality</span>
                <span className="text-rehab-green font-bold">{qualityScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-bg-darkest overflow-hidden">
                <div className="bg-rehab-green h-full" style={{ width: `${qualityScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Bilateral Symmetry</span>
                <span className="text-rehab-cyan font-bold">{symmetryScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-bg-darkest overflow-hidden">
                <div className="bg-rehab-cyan h-full" style={{ width: `${symmetryScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Range of Motion</span>
                <span className="text-rehab-purpleLight font-bold">{currentRom}° / {selectedExercise.target_rom_max}°</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-bg-darkest overflow-hidden">
                <div className="bg-rehab-purple h-full" style={{ width: `${Math.min(100, (currentRom / selectedExercise.target_rom_max) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-bg-dark/70 border border-bg-border text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rehab-amber flex-shrink-0 mt-0.5" />
            <span>Nova utilizes this real-time kinematic state to provide individualized movement corrections.</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

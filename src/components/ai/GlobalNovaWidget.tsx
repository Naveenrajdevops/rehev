import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Mic, MicOff, MessageSquare, ArrowRight, User } from 'lucide-react';
import { NovaOrb3D } from '../3d/NovaOrb3D';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import { audioCoach } from '../../utils/audioCoach';

export const GlobalNovaWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'nova'; text: string }>>([
    {
      sender: 'nova',
      text: "Hello! I'm Nova, your RehabAI Clinical Coach. How can I assist you with your rehabilitation movements or recovery metrics today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Explain my movement score",
    "How is symmetry calculated?",
    "Show my ROM targets",
    "Prepare notes for my therapist"
  ]);

  const { activePatient } = useAuth();
  const { selectedExercise, repCount, qualityScore, symmetryScore, currentRom, poseConfidence } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = text.trim();
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
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
    setMessages(prev => [...prev, { sender: 'nova', text: res.message }]);
    if (res.suggestions && res.suggestions.length > 0) {
      setSuggestions(res.suggestions);
    }

    // Speak Nova response if voice enabled
    if (audioCoach.isEnabled()) {
      audioCoach.speak(res.message.substring(0, 140));
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

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating 3D Orb Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-bg-card/90 border border-rehab-purple/40 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rehab-cyan" />
              Ask Nova AI Coach
            </span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-bg-card/80 border-2 border-rehab-purple/50 shadow-glow-purple flex items-center justify-center backdrop-blur-2xl hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <NovaOrb3D size={64} state="idle" />
          </button>
        </div>
      )}

      {/* Floating Spatial Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] rounded-3xl bg-bg-card/95 border border-rehab-purple/35 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-bg-border flex items-center justify-between bg-bg-dark/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-bg-card border border-rehab-purple/40 flex items-center justify-center overflow-hidden">
                <NovaOrb3D size={40} state={isTyping ? 'speaking' : isListening ? 'listening' : 'idle'} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Nova
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rehab-cyan/15 text-rehab-cyan border border-rehab-cyan/30">
                    Clinical Coach
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Context: {activePatient.name} • {selectedExercise.name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-bg-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Session Context Banner */}
          <div className="px-4 py-2 bg-gradient-to-r from-rehab-purple/10 to-rehab-cyan/10 border-b border-bg-border/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              Quality: <strong className="text-rehab-green">{qualityScore}%</strong>
            </span>
            <span className="text-slate-400">
              Symmetry: <strong className="text-rehab-cyan">{symmetryScore}%</strong>
            </span>
            <span className="text-slate-400">
              Reps: <strong className="text-white">{repCount}/{selectedExercise.target_reps}</strong>
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'nova' && (
                  <div className="w-7 h-7 rounded-lg bg-rehab-purple/20 border border-rehab-purple/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-rehab-purpleLight" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-rehab-purple to-rehab-blue text-white rounded-br-none shadow-glow-purple'
                      : 'bg-bg-dark/80 border border-bg-border text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-rehab-purpleLight">
                <div className="w-2 h-2 rounded-full bg-rehab-cyan animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-rehab-purple animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-rehab-green animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400">Nova is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Pills */}
          <div className="px-3 py-2 border-t border-bg-border/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.slice(0, 3).map((sugg, i) => (
              <button
                key={i}
                onClick={() => handleSend(sugg)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-bg-card border border-bg-border hover:border-rehab-purple/50 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1 flex-shrink-0"
              >
                <span>{sugg}</span>
                <ArrowRight className="w-2.5 h-2.5 text-rehab-cyan" />
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-bg-border bg-bg-dark/90 flex items-center gap-2">
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-rehab-red/20 border-rehab-red text-rehab-red animate-pulse'
                  : 'bg-bg-card border-bg-border text-slate-400 hover:text-white'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening to your voice..." : "Ask Nova about your movement..."}
              className="flex-1 px-3 py-2.5 rounded-xl bg-bg-card border border-bg-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rehab-purple/60"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold disabled:opacity-40 hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

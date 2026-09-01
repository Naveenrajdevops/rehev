import { 
  Patient, Exercise, RehabPlan, Session, NotificationItem, ClinicalReport, AIMessage, User 
} from '../types';
import { 
  INITIAL_PATIENTS, INITIAL_PLANS, INITIAL_SESSIONS, INITIAL_NOTIFICATIONS, INITIAL_REPORTS 
} from '../data/initialData';
import { CLINICAL_EXERCISES } from '../data/exercisesData';

const BASE_URL = '/api';

class ApiService {
  private isDemoMode = false;
  private patientsStore: Patient[] = [...INITIAL_PATIENTS];
  private plansStore: RehabPlan[] = [...INITIAL_PLANS];
  private sessionsStore: Session[] = [...INITIAL_SESSIONS];
  private notificationsStore: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private reportsStore: ClinicalReport[] = [...INITIAL_REPORTS];
  private chatStore: AIMessage[] = [
    {
      sender: 'nova',
      message: "Hello Eleanor! I'm Nova, your RehabAI Clinical Coach. I've analyzed your recent sessions and see wonderful progress in your right knee symmetry (+6.2°). How are you feeling today?",
      created_at: new Date().toISOString()
    }
  ];

  constructor() {
    this.checkHealth();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.isDemoMode = false;
        return true;
      }
      this.isDemoMode = true;
      return false;
    } catch {
      this.isDemoMode = true;
      return false;
    }
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  // --- Patients ---
  public async getPatients(search?: string, status?: string): Promise<Patient[]> {
    try {
      let url = `${BASE_URL}/patients`;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'All') params.append('status', status);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      let results = [...this.patientsStore];
      if (search) {
        results = results.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.patient_id_code.toLowerCase().includes(search.toLowerCase()));
      }
      if (status && status !== 'All') {
        results = results.filter(p => p.status === status);
      }
      return results;
    }
  }

  public async getPatient(id: number): Promise<Patient | undefined> {
    try {
      const res = await fetch(`${BASE_URL}/patients/${id}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return this.patientsStore.find(p => p.id === id) || this.patientsStore[0];
    }
  }

  public async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    try {
      const res = await fetch(`${BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const newPatient: Patient = {
        id: this.patientsStore.length + 1,
        patient_id_code: `PT-${8820 + this.patientsStore.length + 1}`,
        name: patientData.name || 'New Patient',
        age: patientData.age || 30,
        gender: patientData.gender || 'Other',
        condition: patientData.condition || 'General Rehabilitation',
        affected_side: patientData.affected_side || 'Right',
        primary_goal: patientData.primary_goal || 'Restore mobility',
        status: patientData.status || 'Improving',
        overall_quality_score: 85,
        symmetry_score: 88,
        rom_achievement: 90,
        adherence_rate: 95,
        start_date: new Date().toISOString(),
        ...patientData
      } as Patient;
      this.patientsStore.push(newPatient);
      return newPatient;
    }
  }

  // --- Exercises ---
  public async getExercises(): Promise<Exercise[]> {
    try {
      const res = await fetch(`${BASE_URL}/exercises`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return CLINICAL_EXERCISES;
    }
  }

  public async getExercise(id: string): Promise<Exercise | undefined> {
    try {
      const res = await fetch(`${BASE_URL}/exercises/${id}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return CLINICAL_EXERCISES.find(e => e.id === id) || CLINICAL_EXERCISES[0];
    }
  }

  // --- Sessions ---
  public async getSessions(patientId?: number): Promise<Session[]> {
    try {
      const url = patientId ? `${BASE_URL}/sessions?patient_id=${patientId}` : `${BASE_URL}/sessions`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      if (patientId) {
        return this.sessionsStore.filter(s => s.patient_id === patientId);
      }
      return this.sessionsStore;
    }
  }

  public async getSession(id: number): Promise<Session | undefined> {
    try {
      const res = await fetch(`${BASE_URL}/sessions/${id}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return this.sessionsStore.find(s => s.id === id) || this.sessionsStore[0];
    }
  }

  public async createSession(sessionData: Partial<Session>): Promise<Session> {
    try {
      const res = await fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const count = this.sessionsStore.length + 1;
      const newSession: Session = {
        id: count,
        session_uid: `SES-2026-${800 + count}`,
        patient_id: sessionData.patient_id || 1,
        exercise_id: sessionData.exercise_id || 'squat-rehab',
        date: new Date().toISOString(),
        duration_seconds: sessionData.duration_seconds || 180,
        repetitions_completed: sessionData.repetitions_completed || 10,
        target_repetitions: sessionData.target_repetitions || 10,
        sets_completed: sessionData.sets_completed || 3,
        target_sets: sessionData.target_sets || 3,
        movement_quality_score: sessionData.movement_quality_score || 90,
        symmetry_score: sessionData.symmetry_score || 92,
        min_rom_degrees: sessionData.min_rom_degrees || 40,
        max_rom_degrees: sessionData.max_rom_degrees || 105,
        avg_rom_degrees: sessionData.avg_rom_degrees || 95,
        target_rom_degrees: sessionData.target_rom_degrees || 105,
        average_confidence: sessionData.average_confidence || 0.94,
        average_tempo_seconds: sessionData.average_tempo_seconds || 2.4,
        ai_feedback_summary: sessionData.ai_feedback_summary || "Smooth repetition cadence with symmetrical bilateral knee drive.",
        completion_status: 'Completed',
        repetitions: sessionData.repetitions || []
      };
      this.sessionsStore.unshift(newSession);

      // Add notification
      this.notificationsStore.unshift({
        id: this.notificationsStore.length + 1,
        title: "Session Completed",
        message: `Completed ${newSession.repetitions_completed} repetitions (${newSession.movement_quality_score.toFixed(0)}% quality).`,
        type: "success",
        is_read: false,
        created_at: "Just now"
      });

      return newSession;
    }
  }

  // --- AI Chat ---
  public async sendMessageToNova(
    message: string, 
    patientId?: number, 
    sessionContext?: any
  ): Promise<{ message: string; suggestions: string[] }> {
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, patient_id: patientId, session_context: sessionContext })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data;
    } catch {
      // Local fallback clinical intelligence
      const msgLower = message.toLowerCase();
      let reply = "I'm Nova, your RehabAI Clinical Coach. I'm here to support your movement form, track your symmetry, and encourage safe, steady recovery.";
      let suggestions = ["Explain my score", "How did I perform?", "What should I improve?", "Summarize my progress"];

      if (msgLower.includes("score") || msgLower.includes("quality")) {
        const q = sessionContext?.quality || 92;
        reply = `Your estimated movement quality is currently ${q}%. This is an AI kinematic calculation assessing depth control, joint stability, and bilateral symmetry. To raise this score, keep your ascent smooth and avoid rapid bouncing at the bottom of the movement.`;
        suggestions = ["How is symmetry measured?", "Explain range of motion target", "Show my last session comparison"];
      } else if (msgLower.includes("symmetry") || msgLower.includes("balance") || msgLower.includes("side")) {
        const sym = sessionContext?.symmetry || 93;
        reply = `Your bilateral symmetry is tracking at ${sym}%. Keep your shoulders level and distribute your weight evenly through your mid-foot to avoid overloading one side.`;
        suggestions = ["Check my knee alignment", "Prepare questions for doctor", "Summarize today's session"];
      } else if (msgLower.includes("stiff") || msgLower.includes("pain") || msgLower.includes("hurt")) {
        reply = "Please prioritize your comfort and safety. If you experience sharp pain or sudden swelling, pause your exercise immediately and notify your physiotherapist. Never push through sharp joint discomfort.";
        suggestions = ["Log a symptom note for therapist", "Start gentle warm-up exercises", "View rest recommendations"];
      } else if (msgLower.includes("summarize") || msgLower.includes("progress")) {
        reply = "Looking across your recent rehabilitation sessions, your movement quality has trended upward (+7% over baseline) and your peak ROM is approaching your prescribed target. Keep up the consistent cadence!";
        suggestions = ["Export PDF clinical report", "Send summary to therapist", "Check upcoming exercises"];
      }

      this.chatStore.push({ sender: 'user', message, created_at: new Date().toISOString() });
      this.chatStore.push({ sender: 'nova', message: reply, created_at: new Date().toISOString() });

      return { message: reply, suggestions };
    }
  }

  public async getChatHistory(patientId?: number): Promise<AIMessage[]> {
    try {
      const res = await fetch(`${BASE_URL}/chat/history${patientId ? `?patient_id=${patientId}` : ''}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return this.chatStore;
    }
  }

  // --- Reports & Notifications ---
  public async getReports(patientId?: number): Promise<ClinicalReport[]> {
    try {
      const url = patientId ? `${BASE_URL}/reports?patient_id=${patientId}` : `${BASE_URL}/reports`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return this.reportsStore;
    }
  }

  public async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/notifications`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return this.notificationsStore;
    }
  }

  public async getRehabPlans(patientId?: number): Promise<RehabPlan[]> {
    try {
      const url = patientId ? `${BASE_URL}/plans/patient/${patientId}` : `${BASE_URL}/plans`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return this.plansStore;
    }
  }
}

export const api = new ApiService();

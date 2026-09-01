import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalNovaWidget } from './components/ai/GlobalNovaWidget';

// Application Pages
import { Dashboard } from './pages/Dashboard';
import { LiveAnalysis } from './pages/LiveAnalysis';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { PatientProfile } from './pages/PatientProfile';
import { RehabilitationPlan } from './pages/RehabilitationPlan';
import { AICoach } from './pages/AICoach';
import { Progress } from './pages/Progress';
import { Sessions } from './pages/Sessions';
import { SessionDetail } from './pages/SessionDetail';
import { Reports } from './pages/Reports';
import { TherapistDashboard } from './pages/TherapistDashboard';
import { Settings } from './pages/Settings';
import { AboutSafety } from './pages/AboutSafety';
import { Auth } from './pages/Auth';
import { Session } from './types';

const MainApp: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'session-detail' && params) {
      setSelectedSessionForDetail(params);
    } else {
      setSelectedSessionForDetail(null);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSessionForDetail(session);
    setActivePage('session-detail');
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderActivePage = () => {
    if (activePage === 'session-detail' && selectedSessionForDetail) {
      return (
        <SessionDetail
          session={selectedSessionForDetail}
          onBack={() => setActivePage('sessions')}
          onNavigate={handleNavigate}
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'live':
        return <LiveAnalysis onNavigate={handleNavigate} />;
      case 'exercises':
        return <ExerciseLibrary onNavigate={handleNavigate} />;
      case 'patients':
        return <PatientProfile onNavigate={handleNavigate} />;
      case 'plans':
        return <RehabilitationPlan onNavigate={handleNavigate} />;
      case 'coach':
        return <AICoach onNavigate={handleNavigate} />;
      case 'progress':
        return <Progress onNavigate={handleNavigate} />;
      case 'sessions':
        return <Sessions onNavigate={handleNavigate} onSelectSession={handleSelectSession} />;
      case 'reports':
        return <Reports onNavigate={handleNavigate} />;
      case 'therapist':
        return <TherapistDashboard onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings />;
      case 'safety':
        return <AboutSafety />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-darkest flex">
      {/* Fixed macOS Sidebar */}
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activePage={activePage} onNavigate={handleNavigate} />
        <main className="flex-1 ml-64 p-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Floating Nova AI 3D Orb Assistant */}
      <GlobalNovaWidget />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <MainApp />
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;

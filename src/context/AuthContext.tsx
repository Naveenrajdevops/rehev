import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Patient } from '../types';
import { api } from '../services/api';
import { INITIAL_PATIENTS } from '../data/initialData';

interface AuthContextType {
  user: User;
  activePatient: Patient;
  setActivePatient: (patient: Patient) => void;
  setUserRole: (role: 'therapist' | 'patient' | 'admin') => void;
  isDemoMode: boolean;
  logout: () => void;
}

const DEFAULT_THERAPIST: User = {
  id: 1,
  email: 'therapist@rehabai.io',
  full_name: 'Dr. Marcus Reynolds, DPT',
  role: 'therapist'
};

const DEFAULT_PATIENT_USER: User = {
  id: 2,
  email: 'patient@rehabai.io',
  full_name: 'Eleanor Vance',
  role: 'patient',
  patient_id: 1
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_THERAPIST);
  const [activePatient, setActivePatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  useEffect(() => {
    api.checkHealth().then(connected => {
      setIsDemoMode(!connected);
    });
  }, []);

  const setUserRole = (role: 'therapist' | 'patient' | 'admin') => {
    if (role === 'therapist') {
      setUser(DEFAULT_THERAPIST);
    } else if (role === 'patient') {
      setUser(DEFAULT_PATIENT_USER);
      setActivePatient(INITIAL_PATIENTS[0]);
    } else {
      setUser({
        id: 3,
        email: 'admin@rehabai.io',
        full_name: 'Alex Rivera',
        role: 'admin'
      });
    }
  };

  const logout = () => {
    setUserRole('patient');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activePatient,
        setActivePatient,
        setUserRole,
        isDemoMode,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

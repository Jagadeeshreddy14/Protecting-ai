import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { AuthView } from './views/AuthView';
import { ProfessorView } from './views/ProfessorView';
import { StudentView } from './views/StudentView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // --- Session Management (One-User-One-Session) ---
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('proctor_session_id');
      if (user && !storedSession) {
        // Logged out externally
        handleLogout();
      }
    };

    const interval = setInterval(checkSession, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // Load user from local storage on mount (Simulation persistence)
  useEffect(() => {
    // In a real app, we verify token here.
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setSessionError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('proctor_session_id');
    setUser(null);
    // Clear exam specific storages if needed
  };

  // --- View Routing ---
  if (!user) {
    return (
      <>
        {sessionError && (
          <div className="bg-red-500 text-white text-center p-2 fixed top-0 w-full z-50">
            {sessionError}
          </div>
        )}
        <AuthView onLogin={handleLogin} />
      </>
    );
  }

  if (user.role === UserRole.PROFESSOR) {
    return <ProfessorView user={user} onLogout={handleLogout} />;
  }

  return <StudentView user={user} onLogout={handleLogout} />;
};

export default App;

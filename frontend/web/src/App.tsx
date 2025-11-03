import React, { useState, useEffect } from 'react';
import { LoginPage, type User } from './pages/LoginPage';
import { RegisterPage, type RegisterData } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { Settings } from './pages/Settings';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type View = 'login' | 'register' | 'dashboard' | 'profile' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bustrack_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentView('dashboard');
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('bustrack_user');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    localStorage.setItem('bustrack_user', JSON.stringify(user));
  };

  const handleRegister = (userData: RegisterData) => {
    // In a real app, this would send data to backend
    toast.success('Cuenta creada exitosamente', {
      description: 'Tu cuenta ha sido creada. Por favor inicia sesión.'
    });
    setCurrentView('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    localStorage.removeItem('bustrack_user');
  };

  const handleNavigate = (view: 'dashboard' | 'profile' | 'settings') => {
    setCurrentView(view);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('bustrack_user', JSON.stringify(updatedUser));
  };

  // Show login/register if no user
  if (!currentUser) {
    if (currentView === 'register') {
      return (
        <>
          <RegisterPage 
            onBackToLogin={() => setCurrentView('login')} 
            onRegister={handleRegister}
          />
          <Toaster />
        </>
      );
    }
    
    return (
      <>
        <LoginPage 
          onLogin={handleLogin} 
          onGoToRegister={() => setCurrentView('register')}
        />
        <Toaster />
      </>
    );
  }

  // Show appropriate view based on current view
  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'profile' && (
        <UserProfile
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onUpdateUser={handleUpdateUser}
        />
      )}
      {currentView === 'settings' && (
        <Settings
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      <Toaster />
    </>
  );
}
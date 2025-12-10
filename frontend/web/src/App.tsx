import React, { useState, useEffect } from 'react';
import { LoginPage, type User } from './pages/LoginPage';
import { RegisterPage, type RegisterData } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { Settings } from './pages/Settings';
import { toast } from './utils/toast';
import { Toaster } from './components/ui/sonner';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import 'mapbox-gl/dist/mapbox-gl.css';

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

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    localStorage.setItem('bustrack_user', JSON.stringify(user));
    toast.success('Cuenta creada exitosamente', {
      description: 'Tu sesión se ha iniciado.'
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('No se pudo cerrar sesión en Firebase:', error);
    }
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
  let content;
  if (!currentUser) {
    if (currentView === 'register') {
      content = (
        <RegisterPage 
          onBackToLogin={() => setCurrentView('login')} 
          onRegister={handleRegister}
        />
      );
    } else {
      content = (
        <LoginPage 
          onLogin={handleLogin} 
          onGoToRegister={() => setCurrentView('register')}
        />
      );
    }
  } else {
    // Show appropriate view based on current view
    if (currentView === 'dashboard') {
      content = (
        <Dashboard
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );
    } else if (currentView === 'profile') {
      content = (
        <UserProfile
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onUpdateUser={handleUpdateUser}
        />
      );
    } else if (currentView === 'settings') {
      content = (
        <Settings
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
        />
      );
    }
  }

  return (
    <>
      {content}
      <Toaster />
    </>
  );
}

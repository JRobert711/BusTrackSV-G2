import React, { useState, useEffect } from 'react';
import { LoginPage, type User } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { UserProfile } from './components/UserProfile';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';

type View = 'login' | 'dashboard' | 'profile' | 'settings';

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

  // Show login if no user
  if (!currentUser || currentView === 'login') {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
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
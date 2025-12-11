import React, { useState, useEffect } from 'react';
import { LoginPage, type User } from './pages/LoginPage';
import { RegisterPage, type RegisterData } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { Settings } from './pages/Settings';
import { DriverPage } from './pages/DriverPage';
import { toast } from './utils/toast';
import { Toaster } from './components/ui/sonner';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { api } from './services/api';
import 'mapbox-gl/dist/mapbox-gl.css';

type View = 'login' | 'register' | 'dashboard' | 'profile' | 'settings' | 'driver';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check for saved session and validate token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('bustrack_user');
      const token = localStorage.getItem('authToken');
      
      if (savedUser && token) {
        try {
          const user = JSON.parse(savedUser);
          
          // Verify token is still valid by fetching current user
          try {
            const currentUserData = await api.getCurrentUser();
            
            // Update user data from server
            const updatedUser: User = {
              id: currentUserData.id,
              email: currentUserData.email,
              name: currentUserData.name,
              role: currentUserData.role,
              createdAt: currentUserData.createdAt,
              updatedAt: currentUserData.updatedAt
            };
            
            setCurrentUser(updatedUser);
            // Redirect drivers directly to driver page
            if (updatedUser.role === 'driver') {
              setCurrentView('driver');
            } else {
              setCurrentView('dashboard');
            }
            localStorage.setItem('bustrack_user', JSON.stringify(updatedUser));
          } catch (err) {
            // Token invalid or expired, clear session
            console.warn('Token validation failed:', err);
            localStorage.removeItem('bustrack_user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            api.clearToken();
          }
        } catch (error) {
          console.error('Error loading saved session:', error);
          localStorage.removeItem('bustrack_user');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          api.clearToken();
        }
      }
      
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect drivers directly to driver page
    if (user.role === 'driver') {
      setCurrentView('driver');
    } else {
      setCurrentView('dashboard');
    }
    localStorage.setItem('bustrack_user', JSON.stringify(user));
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    // Redirect drivers directly to driver page
    if (user.role === 'driver') {
      setCurrentView('driver');
    } else {
      setCurrentView('dashboard');
    }
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
    
    // Clear all auth data
    api.clearToken();
    localStorage.removeItem('bustrack_user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    setCurrentUser(null);
    setCurrentView('login');
    
    toast.success('Sesión cerrada', {
      description: 'Has cerrado sesión exitosamente'
    });
  };

  const handleNavigate = (view: 'dashboard' | 'profile' | 'settings' | 'driver') => {
    setCurrentView(view);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('bustrack_user', JSON.stringify(updatedUser));
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Cargando...</div>
        </div>
      </div>
    );
  }

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
    // Drivers can only access driver page
    if (currentUser.role === 'driver') {
      if (currentView === 'driver') {
        content = (
          <DriverPage
            user={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      } else {
        // Redirect drivers to driver page if they try to access other views
        content = (
          <DriverPage
            user={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      }
    } else {
      // Show appropriate view based on current view for admin/supervisor
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
      } else if (currentView === 'driver') {
        content = (
          <DriverPage
            user={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      }
    }
    }

  return (
    <>
      {content}
      <Toaster />
    </>
  );
}

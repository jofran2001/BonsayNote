import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, Sprout } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { BonsaiDetailPage } from './pages/BonsaiDetailPage';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d130e] text-stone-100 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-3xl bg-[#152018] border border-[#223326] flex items-center justify-center text-[#4ade80]">
          <Sprout className="w-7 h-7 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Loader2 className="w-4 h-4 text-[#4ade80] animate-spin" />
          <span>Preparando seu Bonsai Diary...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/bonsais/:id" element={<BonsaiDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;


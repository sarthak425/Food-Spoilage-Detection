import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { LiveSensors } from './pages/LiveSensors';
import { SensorSimulator } from './pages/SensorSimulator';
import { FoodSamples } from './pages/FoodSamples';
import { Actuators } from './pages/Actuators';
import { Alerts } from './pages/Alerts';
import { Devices } from './pages/Devices';
import { AiAnalysis } from './pages/AiAnalysis';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-spoil-emerald border-t-transparent animate-spin" />
          <span>INITIALIZING SPOIL AI PLATFORM...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-navy-950/80">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sensors" element={<LiveSensors />} />
              <Route path="/simulator" element={<SensorSimulator />} />
              <Route path="/samples" element={<FoodSamples />} />
              <Route path="/actuators" element={<Actuators />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/ai-analysis" element={<AiAnalysis />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

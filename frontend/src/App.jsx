import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';
import Methodology from './pages/Methodology';
import Login from './pages/Login';
import ImproveScore from './pages/ImproveScore';
import WhatIfAnalysis from './pages/WhatIfAnalysis';
import RequireAuth from './components/RequireAuth';

function App() {
  const [user, setUser] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth user={user} />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/home" element={<Home user={user} />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/improve-score" element={<ImproveScore user={user} />} />
            <Route path="/what-if" element={<WhatIfAnalysis user={user} />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

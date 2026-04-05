import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Records from './components/Records/Records';
import Users from './components/Users/Users';
import Header from './components/Common/Header';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const role = localStorage.getItem('role');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="pb-20">{children}</main>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/records"
          element={<ProtectedRoute><Records /></ProtectedRoute>}
        />
        <Route
          path="/users"
          element={role === 'ADMIN' ? <ProtectedRoute><Users /></ProtectedRoute> : <Navigate to="/dashboard" />}
        />

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

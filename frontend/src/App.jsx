import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Records from './components/Records/Records';
import Users from './components/Users/Users';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const role = localStorage.getItem('role');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/records"
          element={token ? <Records /> : <Navigate to="/login" />}
        />
        <Route
          path="/users"
          element={token && role === 'ADMIN' ? <Users /> : <Navigate to={token ? "/dashboard" : "/login"} />}
        />

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

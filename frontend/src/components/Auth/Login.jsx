import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      setToken(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-[2.5rem] border border-dark/5 shadow-2xl shadow-dark/5">
          <h1 className="text-4xl font-black text-dark mb-2 tracking-tight uppercase">Welcome</h1>
          <p className="text-dark/40 mb-8 font-bold uppercase text-xs tracking-widest">Access your financial dashboard</p>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-danger/10 text-danger p-3 rounded-xl text-xs font-black uppercase tracking-widest mb-6 border border-danger/10"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark/5 border border-dark/5 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-dark"
                placeholder="yash_finance"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark/5 border border-dark/5 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-dark"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 flex justify-center items-center uppercase tracking-widest text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
              ) : "Sign In"}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-dark/5 text-center">
            <p className="text-xs font-black text-dark/30 uppercase tracking-widest">
              New here? <Link to="/register" className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-2">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

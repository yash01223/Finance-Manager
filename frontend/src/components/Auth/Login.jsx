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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 selection:bg-primary selection:text-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
                <div className="h-px w-8 bg-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Login</span>
            </div>
            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase leading-none">Welcome<br /><span className="text-primary italic">Back.</span></h1>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-danger/10 text-danger p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 border border-danger/20"
            >
              Login Failed: {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="yash_finance"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : "Login"}
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Don't have an account? <Link to="/register" className="text-primary hover:underline underline-offset-8">Register Now</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

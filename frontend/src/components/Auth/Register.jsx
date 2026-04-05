import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { username, password, role });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username may already exist.');
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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
                <div className="h-px w-8 bg-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Registration</span>
            </div>
            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase leading-none">Join<br /><span className="text-primary italic">Us.</span></h1>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-danger/10 text-danger p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 border border-danger/20 text-center"
              >
                Registration Error: {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-6">
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
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Role</label>
              <div className="relative group">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="VIEWER" className="bg-black text-white">VIEWER</option>
                  <option value="ANALYST" className="bg-black text-white">ANALYST</option>
                  <option value="ADMIN" className="bg-black text-white">ADMIN</option>
                </select>
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-white/20 group-hover:text-primary transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : "Create Account"}
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Already have an account? <Link to="/login" className="text-primary hover:underline underline-offset-8">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

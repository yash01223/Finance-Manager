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
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-[2.5rem] border border-dark/5 shadow-2xl shadow-dark/5">
          <h1 className="text-4xl font-black text-dark mb-2 tracking-tight uppercase">Join Us</h1>
          <p className="text-dark/40 mb-8 font-bold uppercase text-xs tracking-widest">Start managing your finances professionally</p>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-danger/10 text-danger p-3 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6 border border-danger/10 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-4">
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
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] ml-1">Account Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-dark/5 border border-dark/5 p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-dark appearance-none cursor-pointer uppercase text-xs tracking-widest"
                >
                  <option value="VIEWER">VIEWER</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-dark/20">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 flex justify-center items-center uppercase tracking-widest text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
              ) : "Register"}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-dark/5 text-center">
            <p className="text-xs font-black text-dark/30 uppercase tracking-widest">
              Already have an account? <Link to="/login" className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-2">Login Now</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

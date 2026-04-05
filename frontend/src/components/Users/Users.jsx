import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Trash2, User as UserIcon, Shield, Circle, LayoutDashboard, FileText, LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const currentUsername = localStorage.getItem('username');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusToggle = async (userId, newStatus) => {
        try {
            await api.patch(`/users/${userId}/status?active=${newStatus}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role?role=${newRole}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? All their records will be permanently removed.')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <aside className="w-72 bg-dark border-r border-dark/5 flex flex-col sticky top-0 h-screen shadow-2xl shadow-dark/20">
                <div className="p-8 pb-12">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase text-cream">Finance.</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 w-full px-4 py-3 text-cream/40 hover:text-cream hover:bg-white/5 rounded-xl font-bold transition-all border border-transparent">
                        <LayoutDashboard size={20} />
                        <span className="text-sm">Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/records')} className="flex items-center space-x-3 w-full px-4 py-3 text-cream/40 hover:text-cream hover:bg-white/5 rounded-xl font-bold transition-all border border-transparent">
                        <FileText size={20} />
                        <span className="text-sm">Records</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold transition-all border border-primary/10">
                        <Shield size={20} />
                        <span className="text-sm">User Management</span>
                    </button>
                </nav>

                <div className="p-4 mt-auto">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-danger/80 hover:bg-danger/10 rounded-xl font-bold transition-all border border-transparent">
                        <LogOut size={20} />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white">
                <header className="glass-header px-12 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-dark uppercase">User Directory</h1>
                        <p className="text-sm text-dark/40 font-medium">Manage access levels and monitor activity</p>
                    </div>
                </header>

                <div className="px-12 py-10">
                    <div className="bg-white rounded-[2rem] border border-dark/5 shadow-2xl shadow-dark/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dark/5 border-b border-dark/5">
                                    <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Username</th>
                                    <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Current Role</th>
                                    <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] text-center">Status</th>
                                    <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark/5">
                                <AnimatePresence>
                                    {users.map((user) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-dark/5 transition-colors"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-dark/5 flex items-center justify-center text-dark/30">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <span className="font-bold text-dark">{user.username} {user.username === currentUsername && "(You)"}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <select 
                                                    disabled={true}
                                                    value={user.role} 
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="bg-dark/5 border border-dark/5 p-2 rounded-lg font-bold text-xs uppercase tracking-wider outline-none cursor-not-allowed opacity-40 text-dark"
                                                >
                                                    <option value="VIEWER">Viewer</option>
                                                    <option value="ANALYST">Analyst</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Circle size={8} fill={user.online ? "#10B981" : "rgba(0,0,0,0.05)"} className={user.online ? "text-success animate-pulse" : "text-dark/10"} />
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${user.online ? "text-success" : "text-dark/30"}`}>
                                                            {user.online ? "Online" : "Offline"}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        disabled={user.username === currentUsername}
                                                        onClick={() => handleStatusToggle(user.id, !user.active)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${user.active ? 'bg-success/10 text-success hover:bg-danger/10 hover:text-danger' : 'bg-dark/5 text-dark/40 hover:bg-success hover:text-white'}`}
                                                    >
                                                        {user.active ? "Active" : "Inactive"}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button 
                                                    disabled={user.username === currentUsername}
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center mx-auto hover:bg-danger hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Users;

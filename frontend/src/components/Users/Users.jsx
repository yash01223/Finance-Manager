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
        <div className="flex min-h-screen bg-[#FDFDFD]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
                <div className="p-8 pb-12">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">Finance.</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl font-bold transition-all border border-transparent">
                        <LayoutDashboard size={20} />
                        <span className="text-sm">Dashboard</span>
                    </button>
                    <button onClick={() => navigate('/records')} className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl font-bold transition-all border border-transparent">
                        <FileText size={20} />
                        <span className="text-sm">Records</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-blue-50/50 text-blue-600 rounded-xl font-bold transition-all border border-blue-100/50">
                        <Shield size={20} />
                        <span className="text-sm">User Management</span>
                    </button>
                </nav>

                <div className="p-4 mt-auto">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all border border-transparent">
                        <LogOut size={20} />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <header className="glass-header px-12 py-6 flex justify-between items-center bg-white/70">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-black uppercase">User Directory</h1>
                        <p className="text-sm text-gray-400 font-medium">Manage access levels and monitor activity</p>
                    </div>
                </header>

                <div className="px-12 py-10">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-black/[0.03] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Username</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Role</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {users.map((user) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <span className="font-bold text-black">{user.username} {user.username === currentUsername && "(You)"}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <select 
                                                    disabled={true}
                                                    value={user.role} 
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="bg-white border border-gray-100 p-2 rounded-lg font-bold text-xs uppercase tracking-wider outline-none cursor-not-allowed opacity-50"
                                                >
                                                    <option value="VIEWER">Viewer</option>
                                                    <option value="ANALYST">Analyst</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Circle size={8} fill={user.online ? "#10b981" : "#d1d5db"} className={user.online ? "text-green-500 animate-pulse" : "text-gray-300"} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.online ? "text-green-600" : "text-gray-400"}`}>
                                                        {user.online ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button 
                                                    disabled={user.username === currentUsername}
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mx-auto hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

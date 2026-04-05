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
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            <main className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
                {/* Header Section */}
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-px w-12 bg-primary/30" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Admin</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                            User<br />
                            <span className="text-primary italic">Management.</span>
                        </h1>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-3">
                        <p className="text-sm text-white/40 font-bold uppercase tracking-wider max-w-xs md:text-right">
                            Manage user roles and account statuses
                        </p>
                    </div>
                </header>

                <div className="space-y-12">
                    <div className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">User</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Role</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Online</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Status</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                <AnimatePresence>
                                    {users.map((user) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center space-x-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-black transition-all">
                                                        <UserIcon size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-white text-lg tracking-tighter uppercase">{user.username}</span>
                                                        {user.username === currentUsername && (
                                                            <div className="text-[8px] font-black uppercase text-primary tracking-widest mt-1">You</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <select 
                                                    disabled={true}
                                                    value={user.role} 
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-not-allowed opacity-30 text-white"
                                                >
                                                    <option value="VIEWER">Viewer</option>
                                                    <option value="ANALYST">Analyst</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <div className={`w-2 h-2 rounded-full ${user.online ? "bg-success animate-pulse" : "bg-white/10"}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user.online ? "text-success" : "text-white/20"}`}>
                                                        {user.online ? "Online" : "Offline"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <button 
                                                    disabled={user.username === currentUsername}
                                                    onClick={() => handleStatusToggle(user.id, !user.active)}
                                                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] transition-all border ${user.active ? 'bg-primary/5 text-primary border-primary/20 hover:bg-danger/20 hover:text-danger hover:border-danger/30' : 'bg-white/5 text-white/20 border-white/5 hover:bg-success hover:text-black hover:border-success'}`}
                                                >
                                                    {user.active ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <button 
                                                    disabled={user.username === currentUsername}
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 flex items-center justify-center mx-auto hover:bg-danger hover:text-white transition-all border border-transparent hover:border-danger/20 disabled:opacity-5 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={18} />
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

import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, Search, ArrowLeft, ArrowRight, LogOut, LayoutDashboard, FileText, Wallet, Shield, Users as UsersIcon, BarChart3, UserCheck, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FIXED_CATEGORIES = ["Salary", "Bonus", "Investment", "Rent", "Utilities", "Shopping", "Food", "Eating Out", "Health", "Education", "Transport", "Travel", "Other"];

const Records = () => {
    const [records, setRecords] = useState([]);
    const [viewMode, setViewMode] = useState('LOGS'); 
    const [userDirectory, setUserDirectory] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({ amount: '', type: 'INCOME', category: 'other', date: '', notes: '' });
    const [filter, setFilter] = useState({ category: '', type: '', page: 0, startDate: '', endDate: '' });
    const [totalPages, setTotalPages] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const targetUserId = searchParams.get('userId');
    const targetUsername = searchParams.get('targetUsername');

    useEffect(() => {
        if (role === 'VIEWER') {
            navigate('/dashboard');
        }
    }, [role, navigate]);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: filter.page,
                size: 10,
                userId: targetUserId ? parseInt(targetUserId) : undefined,
                type: filter.type || undefined,
                category: filter.category || undefined,
                startDate: filter.startDate || undefined,
                endDate: filter.endDate || undefined
            };
            const response = await api.get('/records', { params });
            setRecords(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('Error fetching records', err);
        } finally {
            setLoading(false);
        }
    }, [filter, targetUserId]);

    const fetchUserDirectory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/records/user-summaries', { params: { role: selectedRole || undefined } });
            setUserDirectory(response.data);
        } catch (err) {
            console.error('Error fetching user directory', err);
        } finally {
            setLoading(false);
        }
    }, [selectedRole]);

    useEffect(() => {
        if (role !== 'VIEWER') {
            if (viewMode === 'LOGS') {
                fetchRecords();
            } else {
                fetchUserDirectory();
            }
        }
    }, [viewMode, role, fetchRecords, fetchUserDirectory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/records', formData);
            setFormData({ amount: '', type: 'INCOME', category: 'other', date: '', notes: '' });
            setIsAdding(false);
            fetchRecords();
        } catch (err) {
            alert('Error adding record.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await api.delete(`/records/${id}`);
            fetchRecords();
        } catch (err) {
            alert('Error deleting record. Only ADMIN can delete.');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSelectUserRecords = (u) => {
        setSearchParams({ userId: u.userId, targetUsername: u.username });
        setViewMode('LOGS');
        setFilter(prev => ({ ...prev, page: 0 }));
    };

    const handleClearSelection = () => {
        setSearchParams({});
    };

    const handleViewDashboardAnalytics = (u) => {
        navigate(`/dashboard?userId=${u.userId}&targetUsername=${u.username}`);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    if (role === 'VIEWER') return null;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            <main className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
                {/* Header Section */}
                <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-px w-12 bg-primary/30" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Transaction History</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                            {viewMode === 'LOGS' ? (targetUserId ? "User" : "System") : "User"}<br />
                            <span className="text-primary italic">{viewMode === 'LOGS' ? "Records." : "List."}</span>
                        </h1>
                    </div>
                    
                    <div className="flex flex-col items-start lg:items-end gap-6">
                        {(role === 'ADMIN' || role === 'ANALYST') && (
                            <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5 shadow-2xl shadow-black/40">
                                <button
                                    onClick={() => setViewMode('LOGS')}
                                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'LOGS' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                                >
                                    Ledger
                                </button>
                                <button
                                    onClick={() => setViewMode('DIRECTORY')}
                                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'DIRECTORY' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                                >
                                    Directory
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            {targetUserId && viewMode === 'LOGS' && (
                                <button
                                    onClick={handleClearSelection}
                                    className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 rounded-full hover:bg-white hover:text-black transition-all flex items-center space-x-2"
                                >
                                    <RefreshCw size={12} /> <span>Reset Filter</span>
                                </button>
                            )}
                            {viewMode === 'LOGS' && !targetUserId && (role === 'ADMIN' || role === 'ANALYST') && (
                                <button
                                    onClick={() => setIsAdding(!isAdding)}
                                    className="btn-primary flex items-center space-x-3"
                                >
                                    <Plus size={18} /> <span>Add Record</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="space-y-12">
                    <AnimatePresence mode="wait">
                        {viewMode === 'LOGS' ? (
                            <motion.div key="logs" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-12">
                                {/* Entry Form */}
                                {isAdding && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-10 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl"
                                    >
                                        <div className="flex justify-between items-center mb-10">
                                            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">New Record.</h3>
                                            <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-white/5 text-white/20 rounded-full flex items-center justify-center hover:bg-danger hover:text-white transition-all">✕</button>
                                        </div>
                                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Amount</label>
                                                <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-field" required />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Type</label>
                                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field cursor-pointer">
                                                    <option value="INCOME">Income</option>
                                                    <option value="EXPENSE">Expense</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Category</label>
                                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field cursor-pointer" required>
                                                    {FIXED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Date</label>
                                                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
                                            </div>
                                            <div className="md:col-span-3 space-y-3">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Notes</label>
                                                <input type="text" placeholder="Transaction details..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field" />
                                            </div>
                                            <div className="flex items-end">
                                                <button type="submit" className="btn-primary w-full shadow-lg shadow-primary/10">Add Record</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Precision Filtering */}
                                <div className="bg-white/5 px-10 py-6 rounded-[3rem] border border-white/5 flex flex-col xl:flex-row xl:items-center gap-10 justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value, page: 0 })} className="bg-transparent border-b border-white/10 p-2 text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all text-white" />
                                            <span className="absolute -top-6 left-0 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Start Date</span>
                                        </div>
                                        <div className="text-white/10 font-bold opacity-20">/</div>
                                        <div className="relative group">
                                            <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value, page: 0 })} className="bg-transparent border-b border-white/10 p-2 text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all text-white" />
                                            <span className="absolute -top-6 left-0 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">End Date</span>
                                        </div>
                                    </div>

                                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                                        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value, page: 0 })} className="bg-transparent px-6 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-white/60 hover:text-white transition-colors">
                                            <option value="" className="bg-black text-white">Categories</option>
                                            {FIXED_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-black text-white">{cat}</option>)}
                                        </select>
                                        <div className="w-px h-6 bg-white/10 my-auto" />
                                        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value, page: 0 })} className="bg-transparent px-6 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-white/60 hover:text-white transition-colors">
                                            <option value="" className="bg-black text-white">All Types</option>
                                            <option value="INCOME" className="bg-black text-white">Income</option>
                                            <option value="EXPENSE" className="bg-black text-white">Expense</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] w-32">Date</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Category</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Notes</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Amount</th>
                                                <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Status</th>
                                                {role === 'ADMIN' && <th className="px-10 py-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {records.map((rec) => (
                                                <tr key={rec.id} className="hover:bg-white/[0.03] transition-colors group">
                                                    <td className="px-10 py-8 text-[11px] font-black text-white/20 uppercase tracking-widest">{rec.date}</td>
                                                    <td className="px-10 py-8"><div className="font-black text-white text-sm uppercase tracking-tighter">{rec.category}</div></td>
                                                    <td className="px-10 py-8"><div className="text-white/40 text-xs font-bold italic tracking-wide">{rec.notes || "Empty Log Entry"}</div></td>
                                                    <td className={`px-10 py-8 text-right font-black text-lg tracking-tighter ${rec.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>₹{rec.amount.toLocaleString()}</td>
                                                    <td className="px-10 py-8 text-center">
                                                        <div className={`mx-auto w-2 h-2 rounded-full ${rec.type === 'INCOME' ? 'bg-success' : 'bg-danger'} shadow-[0_0_12px_rgba(0,0,0,0.5)]`} title={rec.type} />
                                                    </td>
                                                    {role === 'ADMIN' && (
                                                        <td className="px-10 py-8 text-center text-white/10 group-hover:text-danger transition-colors">
                                                            <button onClick={() => handleDelete(rec.id)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto hover:bg-danger hover:text-white transition-all border border-transparent hover:border-danger/10">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Global Pagination */}
                                <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Page {filter.page + 1} of {totalPages}</div>
                                    <div className="flex space-x-6">
                                        <button disabled={filter.page === 0} onClick={() => setFilter({ ...filter, page: filter.page - 1 })} className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center disabled:opacity-10 hover:bg-white hover:text-black hover:scale-110 transition-all"><ArrowLeft size={20} /></button>
                                        <button disabled={filter.page + 1 >= totalPages} onClick={() => setFilter({ ...filter, page: filter.page + 1 })} className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center disabled:opacity-10 hover:bg-white hover:text-black hover:scale-110 transition-all"><ArrowRight size={20} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="directory" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-12">
                                {/* Role Navigation */}
                                <div className="bg-white/5 px-10 py-6 rounded-[3rem] border border-white/5 flex justify-between items-center">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                            <UsersIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">User Directory.</h3>
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">Select a user to filter records</p>
                                        </div>
                                    </div>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-white hover:text-black transition-all text-white/60"
                                    >
                                        <option value="" className="bg-black text-white">All Roles</option>
                                        <option value="ADMIN" className="bg-black text-white">Administrators</option>
                                        <option value="ANALYST" className="bg-black text-white">Data Analysts</option>
                                        <option value="VIEWER" className="bg-black text-white">Read-Only Viewers</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {userDirectory.map((u, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            className="bg-white/5 p-10 rounded-[4rem] border border-white/5 flex flex-col gap-10 relative overflow-hidden group shadow-2xl"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                                            
                                            <div className="flex items-center space-x-6">
                                                <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-xl tracking-tighter group-hover:bg-primary group-hover:text-black transition-all">
                                                    {u.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{u.username}</h4>
                                                    <div className="mt-2 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">{u.role}</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleSelectUserRecords(u)}
                                                    className="flex-1 py-4 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                                                >
                                                    <UserCheck size={16} /> Ledger
                                                </button>
                                                <button
                                                    onClick={() => handleViewDashboardAnalytics(u)}
                                                    className="w-20 py-4 bg-primary/10 border border-primary/20 rounded-[2rem] text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                                                >
                                                    <BarChart3 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {userDirectory.length === 0 && !loading && (
                                        <div className="col-span-full py-40 text-center font-black text-white/5 text-4xl uppercase tracking-[0.5em] border-4 border-dashed border-white/5 rounded-[5rem]">Directory Empty.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Records;

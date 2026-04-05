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
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold transition-all border border-primary/10">
                        <FileText size={20} />
                        <span className="text-sm">Records</span>
                    </button>
                    {role === 'ADMIN' && (
                        <button 
                            onClick={() => navigate('/users')}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-cream/40 hover:text-cream hover:bg-white/5 rounded-xl font-bold transition-all border border-transparent"
                        >
                            <Shield size={20} />
                            <span className="text-sm">Users</span>
                        </button>
                    )}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center">
                                <UsersIcon size={14} className="text-cream/60" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight text-cream/70">{username}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-cream/30 ml-11">{role}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-danger/80 hover:bg-danger/10 rounded-xl font-bold transition-all border border-transparent">
                        <LogOut size={20} />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white">
                {/* Header */}
                <header className="glass-header px-12 py-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h1 className="text-3xl font-black tracking-tight text-dark uppercase">
                                {viewMode === 'LOGS' ? (targetUserId ? `Records: ${targetUsername}` : "Transaction Logs") : "User Directory"}
                            </h1>
                            {targetUserId && viewMode === 'LOGS' && (
                                <button
                                    onClick={handleClearSelection}
                                    className="px-3 py-1 bg-dark/5 text-[10px] font-black uppercase tracking-widest text-dark/40 rounded-lg hover:bg-dark hover:text-white transition-all flex items-center space-x-2"
                                >
                                    <RefreshCw size={10} /> <span>Reset to All</span>
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-dark/40 font-medium">
                            {viewMode === 'LOGS' ? (targetUserId ? `Viewing transaction specifics for ${targetUsername}` : "Browse and manage the financial ledger") : "Select a user to analyze their records"}
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        {(role === 'ADMIN' || role === 'ANALYST') && (
                            <>
                                <div className="bg-dark/5 p-1 rounded-xl flex space-x-1 mr-4">
                                    <button
                                        onClick={() => setViewMode('LOGS')}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'LOGS' ? 'bg-white text-dark shadow-sm' : 'text-dark/30 hover:text-dark'}`}
                                    >
                                        Ledger
                                    </button>
                                    <button
                                        onClick={() => setViewMode('DIRECTORY')}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'DIRECTORY' ? 'bg-white text-dark shadow-sm' : 'text-dark/30 hover:text-dark'}`}
                                    >
                                        Directory
                                    </button>
                                </div>
                                {viewMode === 'LOGS' && !targetUserId && (
                                    <button
                                        onClick={() => setIsAdding(!isAdding)}
                                        className="bg-primary text-white font-bold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        <Plus size={18} /> <span>New Record</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </header>

                <div className="px-12 py-10">
                    <AnimatePresence mode="wait">
                        {viewMode === 'LOGS' ? (
                            <motion.div key="logs" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                                {/* Individual Logs UI */}
                                {isAdding && (
                                    <div className="mb-10 p-8 bg-white rounded-[2rem] border border-dark/5 shadow-2xl shadow-dark/5">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-black text-dark uppercase text-sm tracking-widest">Entry Details</h3>
                                            <button onClick={() => setIsAdding(false)} className="text-dark/20 hover:text-dark">✕</button>
                                        </div>
                                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-dark/40 uppercase tracking-widest ml-1">Amount (INR)</label>
                                                <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-dark/5 border border-dark/5 p-3 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-dark" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-dark/40 uppercase tracking-widest ml-1">Type</label>
                                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-dark/5 border border-dark/5 p-3 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-dark">
                                                    <option value="INCOME">Income</option>
                                                    <option value="EXPENSE">Expense</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-dark/40 uppercase tracking-widest ml-1">Category</label>
                                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-dark/5 border border-dark/5 p-3 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-dark" required>
                                                    {FIXED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-dark/40 uppercase tracking-widest ml-1">Date</label>
                                                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-dark/5 border border-dark/5 p-3 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-dark" required />
                                            </div>
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="text-[10px] font-black text-dark/40 uppercase tracking-widest ml-1">Additional Notes</label>
                                                <input type="text" placeholder="Extra details..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-dark/5 border border-dark/5 p-3 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-dark" />
                                            </div>
                                            <div className="flex items-end">
                                                <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all uppercase text-sm tracking-widest">Create Entry</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Filter Bar */}
                                <div className="bg-white p-6 rounded-2xl border border-dark/5 shadow-2xl shadow-dark/5 mb-8 flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-6 justify-between">
                                    {/* Custom Date Range Picker */}
                                    <div className="flex items-center space-x-2 bg-dark/5 p-1.5 rounded-xl border border-dark/5">
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filter.startDate}
                                                onChange={(e) => setFilter({ ...filter, startDate: e.target.value, page: 0 })}
                                                className="bg-transparent border-none p-1.5 text-[11px] font-black uppercase tracking-tight outline-none cursor-pointer text-dark"
                                            />
                                            <span className="absolute -top-4 left-1 text-[9px] font-black text-dark/30 uppercase tracking-widest">From</span>
                                        </div>
                                        <div className="text-dark/10 font-bold">→</div>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filter.endDate}
                                                onChange={(e) => setFilter({ ...filter, endDate: e.target.value, page: 0 })}
                                                className="bg-transparent border-none p-1.5 text-[11px] font-black uppercase tracking-tight outline-none cursor-pointer text-dark"
                                            />
                                            <span className="absolute -top-4 left-1 text-[9px] font-black text-dark/30 uppercase tracking-widest">To</span>
                                        </div>
                                        {(filter.startDate || filter.endDate) && (
                                            <button
                                                onClick={() => setFilter({ ...filter, startDate: '', endDate: '', page: 0 })}
                                                className="p-1 px-2 text-[10px] font-black text-danger hover:text-danger/70 transition-colors uppercase ml-2"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex space-x-4">
                                        <select
                                            value={filter.category}
                                            onChange={(e) => setFilter({ ...filter, category: e.target.value, page: 0 })}
                                            className="bg-white border border-dark/5 p-2.5 px-4 rounded-xl font-bold outline-none text-sm min-w-[140px] text-dark shadow-sm"
                                        >
                                            <option value="">All Categories</option>
                                            {FIXED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <select
                                            value={filter.type}
                                            onChange={(e) => setFilter({ ...filter, type: e.target.value, page: 0 })}
                                            className="bg-white border border-dark/5 p-2.5 px-4 rounded-xl font-bold outline-none text-sm min-w-[120px] text-dark shadow-sm"
                                        >
                                            <option value="">All Types</option>
                                            <option value="INCOME">Income</option>
                                            <option value="EXPENSE">Expense</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] border border-dark/5 shadow-2xl shadow-dark/5 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-dark/5 border-b border-dark/5">
                                                <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] w-32">Date</th>
                                                <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Category</th>
                                                <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Description</th>
                                                <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] text-right">Amount</th>
                                                <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] text-center">Status</th>
                                                {role === 'ADMIN' && <th className="p-6 text-[10px] font-black text-dark/30 uppercase tracking-[0.2em] text-center">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark/5">
                                            {records.map((rec) => (
                                                <tr key={rec.id} className="hover:bg-dark/5 transition-colors">
                                                    <td className="p-6 font-bold text-dark/30 text-sm">{rec.date}</td>
                                                    <td className="p-6"><div className="font-black text-dark text-sm uppercase tracking-tight">{rec.category}</div></td>
                                                    <td className="p-6"><div className="text-dark/40 text-sm font-medium italic">{rec.notes || "No notes"}</div></td>
                                                    <td className={`p-6 text-right font-black text-base ${rec.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>₹{rec.amount.toLocaleString()}</td>
                                                    <td className="p-6 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${rec.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                            {rec.type}
                                                        </span>
                                                    </td>
                                                    {role === 'ADMIN' && (
                                                        <td className="p-6 text-center">
                                                            <button onClick={() => handleDelete(rec.id)} className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center mx-auto hover:bg-danger hover:text-white transition-all">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex justify-between items-center mt-10">
                                    <div className="text-xs font-bold text-dark/30 uppercase tracking-widest">Page {filter.page + 1} of {totalPages}</div>
                                    <div className="flex space-x-3">
                                        <button disabled={filter.page === 0} onClick={() => setFilter({ ...filter, page: filter.page - 1 })} className="p-3 border border-dark/10 rounded-xl disabled:opacity-20 hover:bg-dark hover:text-white transition-all"><ArrowLeft size={18} /></button>
                                        <button disabled={filter.page + 1 >= totalPages} onClick={() => setFilter({ ...filter, page: filter.page + 1 })} className="p-3 border border-dark/10 rounded-xl disabled:opacity-20 hover:bg-dark hover:text-white transition-all"><ArrowRight size={18} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="directory" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                                {/* Directory Selection UI */}
                                <div className="bg-white p-6 rounded-2xl border border-dark/5 shadow-2xl shadow-dark/5 mb-8 flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                            <UsersIcon size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-dark uppercase text-xs tracking-[0.2em]">Select User Context</h3>
                                            <p className="text-[10px] text-dark/40 font-bold uppercase mt-0.5">Choose a user to view their specific financial records</p>
                                        </div>
                                    </div>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="bg-dark/5 border border-dark/5 p-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest outline-none cursor-pointer hover:bg-white transition-all text-dark"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="ADMIN">Admins</option>
                                        <option value="ANALYST">Analysts</option>
                                        <option value="VIEWER">Viewers</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userDirectory.map((u, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -5 }}
                                            className="bg-white p-6 rounded-3xl border border-dark/5 shadow-2xl shadow-dark/5 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm">
                                                    {u.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-dark tracking-tight">{u.username}</h4>
                                                    <span className="text-[9px] font-black uppercase text-dark/30 tracking-widest border border-dark/5 px-2 py-0.5 rounded-md">{u.role}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleSelectUserRecords(u)}
                                                    className="w-10 h-10 bg-dark/5 text-dark/40 rounded-xl flex items-center justify-center hover:bg-dark hover:text-white transition-all shadow-sm"
                                                    title="View Transaction Logs"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleViewDashboardAnalytics(u)}
                                                    className="w-10 h-10 bg-info text-dark rounded-xl flex items-center justify-center hover:bg-info/80 transition-all shadow-lg shadow-info/20"
                                                    title="View Dashboard Totals"
                                                >
                                                    <BarChart3 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {userDirectory.length === 0 && !loading && (
                                        <div className="col-span-full py-20 text-center font-black text-dark/10 uppercase tracking-widest border-2 border-dashed border-dark/5 rounded-[3rem]">No users available in directory</div>
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

import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, Search, Filter, ArrowLeft, ArrowRight, LogOut, LayoutDashboard, FileText, Calendar, Wallet, Shield, Users as UsersIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Records = () => {
    const [records, setRecords] = useState([]);
    const [viewMode, setViewMode] = useState('LOGS'); // 'LOGS' or 'SUMMARY'
    const [userSummaries, setUserSummaries] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({ amount: '', type: 'INCOME', category: '', date: '', notes: '' });
    const [filter, setFilter] = useState({ category: '', type: '', page: 0 });
    const [totalPages, setTotalPages] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: filter.page,
                size: 10,
                type: filter.type || undefined,
                category: filter.category || undefined
            };
            const response = await api.get('/records', { params });
            setRecords(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('Error fetching records', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchUserSummaries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/records/user-summaries', { params: { role: selectedRole || undefined } });
            setUserSummaries(response.data);
        } catch (err) {
            console.error('Error fetching user summaries', err);
        } finally {
            setLoading(false);
        }
    }, [selectedRole]);

    useEffect(() => {
        if (viewMode === 'LOGS') {
            fetchRecords();
        } else {
            fetchUserSummaries();
        }
    }, [viewMode, fetchRecords, fetchUserSummaries]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/records', formData);
            setFormData({ amount: '', type: 'INCOME', category: '', date: '', notes: '' });
            setIsAdding(false);
            fetchRecords();
        } catch (err) {
            alert('Error adding record. Only ADMIN can add records.');
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

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex min-h-screen bg-[#FDFDFD]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
                <div className="p-8 pb-12">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg shadow-black/10">
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
                    <button className="flex items-center space-x-3 w-full px-4 py-3 bg-blue-50/50 text-blue-600 rounded-xl font-bold transition-all border border-blue-100/50">
                        <FileText size={20} />
                        <span className="text-sm">Records</span>
                    </button>
                    {role === 'ADMIN' && (
                        <button 
                            onClick={() => navigate('/users')}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl font-bold transition-all border border-transparent"
                        >
                            <Shield size={20} />
                            <span className="text-sm">Users</span>
                        </button>
                    )}
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
                {/* Header */}
                <header className="glass-header px-12 py-6 flex justify-between items-center bg-white/70">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-black uppercase">
                            {viewMode === 'LOGS' ? "Transaction Logs" : "System Overview"}
                        </h1>
                        <p className="text-sm text-gray-400 font-medium">
                            {viewMode === 'LOGS' ? "Browse and manage all financial entries" : "Aggregated financial health across users"}
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {(role === 'ADMIN' || role === 'ANALYST') && (
                            <div className="bg-gray-100 p-1 rounded-xl flex space-x-1 mr-4">
                                <button 
                                    onClick={() => setViewMode('LOGS')}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'LOGS' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
                                >
                                    Individual
                                </button>
                                <button 
                                    onClick={() => setViewMode('SUMMARY')}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'SUMMARY' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
                                >
                                    User Summaries
                                </button>
                            </div>
                        )}

                        {viewMode === 'LOGS' && (role === 'ADMIN' || role === 'VIEWER') && (
                            <button 
                                onClick={() => setIsAdding(!isAdding)}
                                className="bg-black text-white font-bold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all hover:bg-gray-900 active:scale-95 shadow-lg shadow-black/10"
                            >
                                <Plus size={18} /> <span>New Record</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="px-12 py-10">
                    <AnimatePresence mode="wait">
                    {viewMode === 'LOGS' ? (
                        <motion.div key="logs" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                            {/* Individual Logs UI */}
                            {isAdding && (
                                <div className="mb-10 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-black text-black uppercase text-sm tracking-widest">Entry Details</h3>
                                        <button onClick={() => setIsAdding(false)} className="text-gray-300 hover:text-black">✕</button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (INR)</label>
                                            <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold">
                                                <option value="INCOME">Income</option>
                                                <option value="EXPENSE">Expense</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                            <input type="text" placeholder="Salary, Rent, etc." value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold" required />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Notes</label>
                                            <input type="text" placeholder="Extra details..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold" />
                                        </div>
                                        <div className="flex items-end">
                                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all uppercase text-sm tracking-widest">Create Entry</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Filter Bar */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search records..." 
                                        value={filter.category} 
                                        onChange={(e) => setFilter({ ...filter, category: e.target.value, page: 0 })}
                                        className="w-full bg-gray-50/50 border border-transparent p-3 pl-12 rounded-xl focus:bg-white outline-none font-semibold transition-all"
                                    />
                                </div>
                                <select 
                                    value={filter.type} 
                                    onChange={(e) => setFilter({ ...filter, type: e.target.value, page: 0 })}
                                    className="bg-white border border-gray-100 p-2.5 px-4 rounded-xl font-bold outline-none text-sm"
                                >
                                    <option value="">All Types</option>
                                    <option value="INCOME">Income</option>
                                    <option value="EXPENSE">Expense</option>
                                </select>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-black/[0.03] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-32">Date</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Amount</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                            {role === 'ADMIN' && <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {records.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-6 font-bold text-gray-400 text-sm">{rec.date}</td>
                                                <td className="p-6"><div className="font-black text-black text-sm uppercase tracking-tight">{rec.category}</div></td>
                                                <td className="p-6"><div className="text-gray-400 text-sm font-medium italic">{rec.notes || "No notes"}</div></td>
                                                <td className={`p-6 text-right font-black text-base ${rec.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>₹{rec.amount.toLocaleString()}</td>
                                                <td className="p-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${rec.type === 'INCOME' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {rec.type}
                                                    </span>
                                                </td>
                                                {role === 'ADMIN' && (
                                                    <td className="p-6 text-center">
                                                        <button onClick={() => handleDelete(rec.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mx-auto hover:bg-red-600 hover:text-white transition-all">
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
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page {filter.page + 1} of {totalPages}</div>
                                <div className="flex space-x-3">
                                    <button disabled={filter.page === 0} onClick={() => setFilter({ ...filter, page: filter.page - 1 })} className="p-3 border border-gray-100 rounded-xl disabled:opacity-20 hover:bg-black hover:text-white transition-all"><ArrowLeft size={18} /></button>
                                    <button disabled={filter.page + 1 >= totalPages} onClick={() => setFilter({ ...filter, page: filter.page + 1 })} className="p-3 border border-gray-100 rounded-xl disabled:opacity-20 hover:bg-black hover:text-white transition-all"><ArrowRight size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="summary" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                            {/* Role Filter Bar */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Filter size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-black uppercase text-xs tracking-[0.2em]">Filter User Base</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Filter the summary list by specific roles</p>
                                    </div>
                                </div>
                                <select 
                                    value={selectedRole} 
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="bg-gray-50 border border-gray-100 p-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest outline-none cursor-pointer hover:bg-white focus:bg-white transition-all"
                                >
                                    <option value="">All Users</option>
                                    <option value="ADMIN">Admin Only</option>
                                    <option value="ANALYST">Analyst Only</option>
                                    <option value="VIEWER">Viewer Only</option>
                                </select>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-black/[0.03] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User & Role</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly In/Out</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lifetime Totals</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Balance</th>
                                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Categories</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {userSummaries.map((u, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                                                            {u.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-black text-sm tracking-tight">{u.username}</div>
                                                            <div className="text-[9px] font-black uppercase text-gray-300 tracking-widest mt-1 border border-gray-100 inline-block px-2 rounded-md">{u.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center space-x-2 text-green-600 font-bold text-xs uppercase tracking-tighter">
                                                            <TrendingUp size={10} /> <span>₹{u.monthlyIncome.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-tighter">
                                                            <TrendingDown size={10} /> <span>₹{u.monthlyExpenses.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="text-gray-900 font-black text-xs uppercase tracking-tight">I: ₹{u.totalIncome.toLocaleString()}</div>
                                                        <div className="text-gray-400 font-bold text-[10px] uppercase tracking-tight">E: ₹{u.totalExpenses.toLocaleString()}</div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className={`text-sm font-black tracking-tight ${u.netBalance >= 0 ? 'text-black' : 'text-red-500'}`}>
                                                        ₹{u.netBalance.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {u.categorySummary.slice(0, 3).map((c, i) => (
                                                            <span key={i} className="text-[9px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-md tracking-tight">
                                                                {c.category}
                                                            </span>
                                                        ))}
                                                        {u.categorySummary.length > 3 && <span className="text-[9px] font-black text-gray-300">+{u.categorySummary.length - 3}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {userSummaries.length === 0 && !loading && (
                                            <tr><td colSpan={5} className="p-20 text-center font-bold text-gray-300 hover:text-black transition-colors uppercase tracking-widest">No users found for this role filter</td></tr>
                                        )}
                                    </tbody>
                                </table>
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

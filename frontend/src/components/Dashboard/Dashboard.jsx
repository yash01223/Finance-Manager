import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, LogOut, FileText, LayoutDashboard, User, Shield, RefreshCw, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0, currency: 'INR' });
    const [categoryData, setCategoryData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [trendsData, setTrendsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    
    const targetUserId = searchParams.get('userId');
    const targetUsername = searchParams.get('targetUsername');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                userId: targetUserId || undefined
            };
            const [summaryRes, categoryRes, recentRes, trendsRes] = await Promise.all([
                api.get('/dashboard/summary', { params }),
                api.get('/dashboard/categories', { params }),
                api.get('/dashboard/recent', { params }),
                api.get('/dashboard/trends', { params })
            ]);
            setSummary(summaryRes.data);
            setCategoryData(categoryRes.data);
            setRecentActivity(recentRes.data);
            setTrendsData(formatTrendsData(trendsRes.data));
        } catch (err) {
            console.error('Error fetching dashboard data', err);
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    const formatTrendsData = (rawData) => {
        const weeksMap = {};
        rawData.forEach(item => {
            const week = `Week ${item.period}`;
            if (!weeksMap[week]) {
                weeksMap[week] = { name: week, income: 0, expense: 0 };
            }
            if (item.type === 'INCOME') {
                weeksMap[week].income = item.total;
            } else {
                weeksMap[week].expense = item.total;
            }
        });
        return Object.values(weeksMap);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleClearFilter = () => {
        setSearchParams({});
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex min-h-screen bg-white text-dark">
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
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all border ${!targetUserId ? 'bg-primary/10 text-primary border-primary/10' : 'text-cream/40 hover:text-cream hover:bg-white/5 border-transparent'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="text-sm">Dashboard</span>
                    </button>
                    {role !== 'VIEWER' && (
                        <button 
                            onClick={() => navigate('/records')}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-cream/40 hover:text-cream hover:bg-white/5 rounded-xl font-bold transition-all border border-transparent"
                        >
                            <FileText size={20} />
                            <span className="text-sm">Records</span>
                        </button>
                    )}
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
                                <User size={14} className="text-cream/60" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight text-cream/70">{username}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-cream/30 ml-11">{role}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-danger/80 hover:bg-danger/10 rounded-xl font-bold transition-all border border-transparent"
                    >
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
                                {targetUserId ? "User Analytics" : "Financial Overview"}
                            </h1>
                            {targetUserId && (
                                <button 
                                    onClick={handleClearFilter}
                                    className="px-3 py-1 bg-dark/5 text-[10px] font-black uppercase tracking-widest text-dark/40 rounded-lg hover:bg-dark hover:text-white transition-all flex items-center space-x-2"
                                >
                                    <RefreshCw size={10} /> <span>Reset Filter</span>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center space-x-6">
                            <p className="text-sm text-dark/40 font-medium">
                                {targetUserId ? `Viewing analytics for ${targetUsername}` : "Aggregated system statistics"}
                            </p>
                        </div>
                    </div>
                </header>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="px-12 py-10"
                >
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2rem] border border-dark/5 shadow-2xl shadow-dark/5">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                                <Wallet size={24} />
                            </div>
                            <div className="text-sm font-bold text-dark/40 uppercase tracking-widest mb-1">Net Balance</div>
                            <div className="text-4xl font-black text-dark tracking-tight">₹{summary.netBalance.toLocaleString()}</div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2rem] border border-dark/5 shadow-2xl shadow-dark/5">
                            <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-sm font-bold text-dark/40 uppercase tracking-widest mb-1">Total Income</div>
                            <div className="text-4xl font-black text-success tracking-tight">₹{summary.totalIncome.toLocaleString()}</div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2rem] border border-dark/5 shadow-2xl shadow-dark/5">
                            <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6">
                                <TrendingDown size={24} />
                            </div>
                            <div className="text-sm font-bold text-dark/40 uppercase tracking-widest mb-1">Expenses</div>
                            <div className="text-4xl font-black text-danger tracking-tight">₹{summary.totalExpenses.toLocaleString()}</div>
                        </motion.div>
                    </div>

                    {/* Charts & Activity Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Weekly Trends Line Chart */}
                        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-dark/5 shadow-2xl shadow-dark/5">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-dark tracking-tight uppercase">Weekly Trends</h3>
                                    <p className="text-xs text-dark/40 font-bold uppercase tracking-wider">Income vs Expenses (8 Weeks)</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-success" />
                                        <span className="text-[10px] font-black text-dark/30 uppercase">Income</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-danger" />
                                        <span className="text-[10px] font-black text-dark/30 uppercase">Expense</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendsData}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,21,20,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,21,20,0.3)', fontWeight: '800', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,21,20,0.3)', fontWeight: '800', fontSize: 10 }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', background: '#FFFFFF' }}
                                            itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '12px', color: '#111827' }}
                                        />
                                        <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Recent Activity Panel */}
                        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2.5rem] border border-dark/5 shadow-2xl shadow-dark/5 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-dark tracking-tight uppercase">Recent Activity</h3>
                                    <p className="text-xs text-dark/40 font-bold uppercase tracking-wider">Latest 10 transactions</p>
                                </div>
                                <button onClick={() => navigate('/records')} className="p-2 bg-dark/5 text-dark/40 rounded-xl hover:bg-dark hover:text-white transition-all">
                                    <Clock size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {recentActivity.map((act) => (
                                        <div key={act.id} className="flex items-center justify-between p-4 bg-dark/5 rounded-2xl border border-transparent hover:border-dark/10 hover:bg-white transition-all group shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${act.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                    {act.category.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-dark leading-none mb-1">{act.category}</div>
                                                    <div className="text-[10px] font-bold text-dark/30 uppercase tracking-tight">{act.date}</div>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-black ${act.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                                                {act.type === 'INCOME' ? '+' : '-'}₹{act.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-xs font-black text-dark/10 uppercase tracking-widest py-10">No recent activity</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Spending Analytics Chart */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-dark/5 shadow-2xl shadow-dark/5">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-dark tracking-tight uppercase">Spending Analytics</h3>
                                    <p className="text-sm text-dark/40 font-bold uppercase tracking-wider">
                                        {targetUserId ? `Specific categories for ${targetUsername}` : "Aggregated category distribution"}
                                    </p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} barCategoryGap={40}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,21,20,0.05)" />
                                        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,21,20,0.3)', fontWeight: 'bold', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,21,20,0.3)', fontWeight: 'bold', fontSize: 12 }} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(0, 21, 20, 0.02)' }} 
                                            contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', padding: '12px' }}
                                            itemStyle={{ color: '#111827', fontWeight: '800' }}
                                        />
                                        < Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={32}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : 'rgba(59, 130, 246, 0.6)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;

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
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            <main className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
                {/* Header Section */}
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-px w-12 bg-primary/30" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Dashboard</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                            {targetUserId ? "User" : "Finance"}<br />
                            <span className="text-primary italic">Overview.</span>
                        </h1>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-3">
                        <p className="text-sm text-white/40 font-bold uppercase tracking-wider max-w-xs md:text-right">
                            {targetUserId ? `Viewing financial data for ${targetUsername}` : "Monitor your balance and transaction history"}
                        </p>
                        {targetUserId && (
                            <button 
                                onClick={handleClearFilter}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 rounded-full hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center space-x-2"
                            >
                                <RefreshCw size={12} /> <span>Global View</span>
                            </button>
                        )}
                    </div>
                </header>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={itemVariants} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors group-hover:bg-primary/10" />
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-8">Net Balance</div>
                            <div className="text-5xl font-black text-white tracking-tighter mb-4">₹{summary.netBalance.toLocaleString()}</div>
                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary/60">
                                <Wallet size={12} className="mr-2" /> Total Balance
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors group-hover:bg-success/10" />
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-8">Total Income</div>
                            <div className="text-5xl font-black text-success tracking-tighter mb-4">₹{summary.totalIncome.toLocaleString()}</div>
                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-success/60">
                                <TrendingUp size={12} className="mr-2" /> Income
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors group-hover:bg-danger/10" />
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-8">Total Expenses</div>
                            <div className="text-5xl font-black text-danger tracking-tighter mb-4">₹{summary.totalExpenses.toLocaleString()}</div>
                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-danger/60">
                                <TrendingDown size={12} className="mr-2" /> Expenses
                            </div>
                        </motion.div>
                    </div>

                    {/* Charts & Activity Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Weekly Trends Line Chart */}
                        <motion.div variants={itemVariants} className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">Weekly Trends</h3>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">Income vs Expenses Analysis</p>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">In</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Out</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendsData}>
                                        <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900', fontSize: 10 }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: '#0A0A0A' }}
                                            itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', color: '#FFFFFF' }}
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                        />
                                        <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={5} dot={false} activeDot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#000000' }} />
                                        <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={5} dot={false} activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 2, stroke: '#000000' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Recent Activity Panel */}
                        <motion.div variants={itemVariants} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">Recent History</h3>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-1">Latest transactions</p>
                                </div>
                                <button onClick={() => navigate('/records')} className="w-10 h-10 bg-white/5 text-white/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                    <Clock size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {recentActivity.map((act) => (
                                        <div key={act.id} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all group">
                                            <div className="flex items-center space-x-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${act.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                    {act.category.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white leading-none mb-2 uppercase">{act.category}</div>
                                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{act.date}</div>
                                                </div>
                                            </div>
                                            <div className={`text-base font-black tracking-tighter ${act.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                                                {act.type === 'INCOME' ? '+' : '-'}₹{act.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-[10px] font-black text-white/10 uppercase tracking-[0.4em] py-20">No active stream</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Spending Analytics Chart */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 p-12 rounded-[4rem] border border-white/5">
                            <div className="flex justify-between items-center mb-16">
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Spending Analysis</h3>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-2">
                                        {targetUserId ? `Categorized records for ${targetUsername}` : "Breakdown of your spending and income by category"}
                                    </p>
                                </div>
                            </div>

                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} barGap={12}>
                                        <CartesianGrid strokeDasharray="12 12" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontWeight: '900', fontSize: 10 }} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                                            contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '16px' }}
                                            itemStyle={{ color: '#FFFFFF', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                                        />
                                        <Bar dataKey="total" radius={[12, 12, 0, 0]} barSize={40}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#A3E635' : 'rgba(163, 230, 53, 0.4)'} />
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

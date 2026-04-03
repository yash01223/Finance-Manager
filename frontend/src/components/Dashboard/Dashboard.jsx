import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, LogOut, FileText, LayoutDashboard, User, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0, currency: 'INR' });
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, categoryRes] = await Promise.all([
                    api.get('/dashboard/summary'),
                    api.get('/dashboard/categories')
                ]);
                setSummary(summaryRes.data);
                setCategoryData(categoryRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
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
        <div className="flex min-h-screen bg-[#FDFDFD]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
                <div className="p-8 pb-12">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg shadow-black/10">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">Finance.</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-3 w-full px-4 py-3 bg-blue-50/50 text-blue-600 rounded-xl font-bold transition-all border border-blue-100/50"
                    >
                        <LayoutDashboard size={20} />
                        <span className="text-sm">Dashboard</span>
                    </button>
                    <button 
                        onClick={() => navigate('/records')}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl font-bold transition-all border border-transparent"
                    >
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
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100/50">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                <User size={14} className="text-gray-400" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight text-gray-500">{username}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-300 ml-11">{role}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all border border-transparent"
                    >
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
                        <h1 className="text-3xl font-black tracking-tight text-black">Financial Overview</h1>
                        <p className="text-sm text-gray-400 font-medium mt-0.5">Track your spending and income trends</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Calendar size={14} />
                                <span className="text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
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
                        <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Wallet size={24} />
                            </div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Net Balance</div>
                            <div className="text-4xl font-black text-black tracking-tight">₹{summary.netBalance.toLocaleString()}</div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Income</div>
                            <div className="text-4xl font-black text-green-600 tracking-tight">₹{summary.totalIncome.toLocaleString()}</div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingDown size={24} />
                            </div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Expenses</div>
                            <div className="text-4xl font-black text-red-600 tracking-tight">₹{summary.totalExpenses.toLocaleString()}</div>
                        </motion.div>
                    </div>

                    {/* Chart Card */}
                    <motion.div variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/[0.03]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-black tracking-tight uppercase">Spending Analytics</h3>
                                <p className="text-sm text-gray-400 font-medium">Monthly category-wise breakdown</p>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} barCategoryGap={15}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '16px', 
                                            border: '1px solid #f3f4f6',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#000', fontWeight: '800' }}
                                    />
                                    <Bar dataKey="total" radius={[12, 12, 0, 0]} barSize={65}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;

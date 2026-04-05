import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, FileText, Shield, LogOut, User as UserIcon } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Records', path: '/records', icon: FileText },
        ...(role === 'ADMIN' ? [{ name: 'Users', path: '/users', icon: Shield }] : []),
    ];

    return (
        <header className="glass-header px-8 py-4 flex justify-between items-center shadow-2xl shadow-black/40">
            <div className="flex items-center space-x-12">
                <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
                        <Wallet size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase text-white">Finance.</span>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                                location.pathname === item.path 
                                ? 'bg-primary/10 text-primary border border-primary/10' 
                                : 'text-white/40 hover:text-white border border-transparent'
                            }`}
                        >
                            <item.icon size={18} />
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex items-center space-x-6">
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <UserIcon size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-white/60">{username}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger hover:text-white transition-all border border-danger/10 shadow-lg shadow-danger/5"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

export default Header;

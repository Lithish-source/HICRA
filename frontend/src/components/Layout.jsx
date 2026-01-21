import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LineChart, Activity, Cpu, Database, Menu, X, User, ChevronDown } from 'lucide-react';

const Layout = ({ children, user, onLogout }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const adminNavItems = [
        { label: 'Home', path: '/home', icon: <Home size={20} /> },
        { label: 'Credit Risk Assessment', path: '/predict', icon: <LineChart size={20} /> },
        { label: 'Admin Dashboard', path: '/dashboard', icon: <Activity size={20} /> },
        { label: 'Model Architecture', path: '/methodology', icon: <Cpu size={20} /> },
    ];

    const userNavItems = [
        { label: 'Home', path: '/home', icon: <Home size={20} /> },
        { label: 'Risk Profile', path: '/dashboard', icon: <Activity size={20} /> },
        { label: 'Improve My Score', path: '/improve-score', icon: <LineChart size={20} /> },
        { label: 'What-If Analysis', path: '/what-if', icon: <Cpu size={20} /> },
    ];

    const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">

            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-primary text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="font-bold text-xl tracking-wide opacity-90">
                            HIC<span className="text-blue-300">RA</span>
                        </div>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-white/10 text-blue-100">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-3 py-3 rounded-lg transition-colors group ${location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/')
                                ? 'bg-white/10 text-white font-medium'
                                : 'text-blue-200 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`${location.pathname === item.path ? 'text-blue-300' : 'text-blue-300 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {isSidebarOpen && (
                    <div className="p-4 border-t border-white/10">
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-xs text-blue-300 uppercase font-bold mb-1">Status</div>
                            <div className="flex items-center space-x-2 text-xs text-white">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>System Online</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center">
                        <div className="hidden sm:block">
                            {/* Breadcrumbs or Page Title could go here */}
                            <h2 className="text-lg font-semibold text-primary">
                                {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Demo Mode Badge */}
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                            Demo Mode
                        </div>

                        {/* User Profile */}
                        {user ? (
                            <div className="flex items-center space-x-3 cursor-pointer pl-6 border-l border-gray-200 group relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-sm font-medium text-gray-700">{user.name}</div>
                                    <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                                </div>
                                <ChevronDown size={14} className="text-gray-400 group-hover:text-primary transition-colors" />

                                <div className="absolute top-10 right-0 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                                    <button
                                        onClick={onLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:font-medium transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="pl-6 border-l border-gray-200">
                                <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                    Sign In
                                </button>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Content Scroll Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
};

export default Layout;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LineChart, Activity, Cpu, Menu, X, ChevronDown, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children, user, onLogout }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();

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
        <div className="flex h-screen overflow-hidden font-sans bg-background dark:bg-dark-bg transition-colors duration-300">

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 256 : 80 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-primary dark:bg-dark-surface text-white flex flex-col shadow-xl z-20 relative"
            >
                {/* Logo Area */}
                <div className="p-6 flex items-center justify-between border-b border-white/10 dark:border-dark-border">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-xl tracking-wide"
                            >
                                HIC<span className="text-blue-300">RA</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 text-blue-100 transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </motion.button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                            ? 'bg-white/15 text-white font-medium shadow-lg'
                                            : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r"
                                        />
                                    )}

                                    <span className={`${isActive ? 'text-blue-300' : 'text-blue-300/70 group-hover:text-blue-300'}`}>
                                        {item.icon}
                                    </span>

                                    <AnimatePresence mode="wait">
                                        {isSidebarOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="ml-3 text-sm whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="p-4 border-t border-white/10 dark:border-dark-border"
                        >
                            <div className="bg-white/5 rounded-xl p-3 backdrop-blur">
                                <div className="text-xs text-blue-300 uppercase font-bold mb-1">Status</div>
                                <div className="flex items-center space-x-2 text-xs text-white">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                                    <span>System Online</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* Top Header */}
                <header className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl h-16 border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 shadow-sm z-10 transition-colors">
                    {/* Page Title */}
                    <div className="flex items-center">
                        <h2 className="text-lg font-semibold text-primary dark:text-white">
                            {navItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
                        </h2>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isDark ? 'dark' : 'light'}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isDark ? (
                                        <Sun size={18} className="text-yellow-400" />
                                    ) : (
                                        <Moon size={18} className="text-slate-600" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>

                        {/* Demo Mode Badge */}
                        <div className="hidden sm:flex bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/20 dark:border-blue-500/30">
                            Demo Mode
                        </div>

                        {/* User Profile */}
                        {user ? (
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-dark-border cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-medium text-gray-700 dark:text-white">{user.name}</div>
                                        <div className="text-xs text-gray-400 dark:text-dark-muted capitalize">{user.role}</div>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </motion.button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-12 right-0 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-100 dark:border-dark-border py-2 overflow-hidden"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                                                <p className="text-xs text-gray-400 dark:text-dark-muted">Signed in as</p>
                                                <p className="text-sm font-medium text-gray-700 dark:text-white truncate">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onLogout();
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Sign In
                                </motion.button>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Content Scroll Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-dark-bg p-6 transition-colors">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Click outside to close profile dropdown */}
            {isProfileOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsProfileOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;

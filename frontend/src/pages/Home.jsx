import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GitBranch, Network, Layout, Users, BarChart3, Settings, Sparkles } from 'lucide-react';

const Home = ({ user }) => {
    const isAdmin = user?.role === 'admin';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            {/* Hero Section */}
            <motion.section
                variants={itemVariants}
                className="bg-gradient-to-br from-primary via-blue-800 to-indigo-900 dark:from-dark-surface dark:via-blue-900/50 dark:to-indigo-900/50 rounded-3xl p-10 md:p-14 text-white shadow-2xl relative overflow-hidden"
            >
                {/* Abstract Background Design */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl"
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '-10%', right: '-5%' }}
                    />
                    <motion.div
                        className="absolute w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"
                        animate={{
                            x: [0, -30, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        style={{ bottom: '-5%', left: '-5%' }}
                    />
                    <motion.div
                        className="absolute w-32 h-32 bg-purple-400/20 rounded-full blur-xl"
                        animate={{
                            x: [0, 20, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '50%', left: '30%' }}
                    />
                </div>

                <div className="relative z-10 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                        <span className="text-xs font-medium tracking-wide">System Operational</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
                    >
                        {isAdmin ? 'Admin Control Panel' : 'Interpretable Hybrid DT–NN'} <br />
                        <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                            {isAdmin ? 'HICRA Management' : 'Credit Risk Assessment'}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-blue-100 text-lg mb-8 max-w-xl leading-relaxed"
                    >
                        {isAdmin
                            ? 'Manage users, view analytics, and monitor the hybrid credit risk assessment system.'
                            : 'Transparent, explainable, and responsible AI for financial risk evaluation. Combines rule-based logic with deep learning accuracy.'
                        }
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link
                            to="/dashboard"
                            className="group inline-flex items-center px-8 py-4 bg-white text-primary hover:bg-blue-50 rounded-2xl font-bold shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                            {isAdmin ? 'Go to Admin Dashboard' : 'View My Risk Profile'}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Model Cards / Admin Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {isAdmin ? (
                    <>
                        {/* Admin: User Management Card */}
                        <motion.div variants={itemVariants}>
                            <Link to="/dashboard" className="block h-full bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border hover:shadow-xl dark:hover:border-blue-500/50 transition-all group hover:-translate-y-1">
                                <div className="bg-blue-100 dark:bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">User Management</h3>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wide mb-3">Browse & Search</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    View, search, and filter users. Click any user to see detailed profile and risk assessment.
                                </p>
                            </Link>
                        </motion.div>

                        {/* Admin: Analytics Card */}
                        <motion.div variants={itemVariants}>
                            <Link to="/dashboard" className="block h-full bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border hover:shadow-xl dark:hover:border-green-500/50 transition-all group hover:-translate-y-1">
                                <div className="bg-green-100 dark:bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Analytics</h3>
                                <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide mb-3">Risk Distribution</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    Monitor average income, loan amounts, and visualize risk distribution with donut chart.
                                </p>
                            </Link>
                        </motion.div>

                        {/* Admin: New Assessment Card */}
                        <motion.div variants={itemVariants}>
                            <Link to="/predict" className="block h-full bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border hover:shadow-xl dark:hover:border-purple-500/50 transition-all group hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 opacity-50" />
                                <div className="bg-purple-100 dark:bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                                    <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 relative z-10">New Assessment</h3>
                                <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wide mb-3 relative z-10">Evaluate Applicant</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed relative z-10">
                                    Assess new applicants using the hybrid DT-NN model and add them to the database.
                                </p>
                            </Link>
                        </motion.div>
                    </>
                ) : (
                    <>
                        {/* User: Decision Tree Card */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border hover:shadow-xl dark:hover:border-green-500/50 transition-all group"
                        >
                            <div className="bg-green-100 dark:bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <GitBranch className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Decision Tree</h3>
                            <p className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide mb-3">Rule-Based Logic</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                Provides explicit formatting of rules (if-then-else) for complete transparency in decision making.
                            </p>
                        </motion.div>

                        {/* User: Neural Network Card */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border hover:shadow-xl dark:hover:border-blue-500/50 transition-all group"
                        >
                            <div className="bg-blue-100 dark:bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Network className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Neural Network</h3>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wide mb-3">Non-Linear Accuracy</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                Captures complex, non-linear relationships in data to improve predictive performance.
                            </p>
                        </motion.div>

                        {/* User: Hybrid Model Card */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border hover:shadow-xl dark:hover:border-purple-500/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 opacity-50" />
                            <div className="bg-purple-100 dark:bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                                <Layout className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 relative z-10">Hybrid Model</h3>
                            <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wide mb-3 relative z-10">Balanced Decisions</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed relative z-10">
                                Prioritizes interpretability when explaining risks while leveraging deep learning confidence.
                            </p>
                        </motion.div>
                    </>
                )}

            </section>
        </motion.div>
    );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, Network, Layout, Users, BarChart3, Settings } from 'lucide-react';

const Home = ({ user }) => {
    const isAdmin = user?.role === 'admin';

    return (
        <div className="space-y-8">

            {/* Hero Section */}
            <section className="bg-primary rounded-3xl p-10 md:p-14 text-white shadow-card relative overflow-hidden">
                {/* Abstract Background Design */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 mb-6 border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs font-medium tracking-wide">System Operational</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                        {isAdmin ? 'Admin Control Panel' : 'Interpretable Hybrid DT–NN'} <br />
                        {isAdmin ? 'CrediSafeAI Management' : 'Credit Risk Assessment'}
                    </h1>
                    <p className="text-blue-100 text-lg mb-8 max-w-xl leading-relaxed">
                        {isAdmin
                            ? 'Manage users, view analytics, and monitor the hybrid credit risk assessment system.'
                            : 'Transparent, explainable, and responsible AI for financial risk evaluation. Combines rule-based logic with deep learning accuracy.'
                        }
                    </p>

                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-1"
                    >
                        {isAdmin ? 'Go to Admin Dashboard' : 'View My Risk Profile'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Model Cards / Admin Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {isAdmin ? (
                    <>
                        {/* Admin: User Management Card */}
                        <Link to="/dashboard" className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-card transition-all group hover:-translate-y-1 block">
                            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">User Management</h3>
                            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">Browse & Search</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                View, search, and filter users. Click any user to see detailed profile and risk assessment.
                            </p>
                        </Link>

                        {/* Admin: Analytics Card */}
                        <Link to="/dashboard" className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-card transition-all group hover:-translate-y-1 block">
                            <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                                <BarChart3 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics</h3>
                            <p className="text-green-600 font-semibold text-sm uppercase tracking-wide mb-3">Risk Distribution</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Monitor average income, loan amounts, and visualize risk distribution with donut chart.
                            </p>
                        </Link>

                        {/* Admin: New Assessment Card */}
                        <Link to="/predict" className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-card transition-all group hover:-translate-y-1 block relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors relative z-10">
                                <Settings className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">New Assessment</h3>
                            <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide mb-3 relative z-10">Evaluate Applicant</p>
                            <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                                Assess new applicants using the hybrid DT-NN model and add them to the database.
                            </p>
                        </Link>
                    </>
                ) : (
                    <>
                        {/* User: Decision Tree Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-card transition-shadow group">
                            <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                                <GitBranch className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Decision Tree</h3>
                            <p className="text-green-600 font-semibold text-sm uppercase tracking-wide mb-3">Rule-Based Logic</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Provides explicit formatting of rules (if-then-else) for complete transparency in decision making.
                            </p>
                        </div>

                        {/* User: Neural Network Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-card transition-shadow group">
                            <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <Network className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Neural Network</h3>
                            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-3">Non-Linear Accuracy</p>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Captures complex, non-linear relationships in data to improve predictive performance.
                            </p>
                        </div>

                        {/* User: Hybrid Model Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-card transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors relative z-10">
                                <Layout className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Hybrid Model</h3>
                            <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide mb-3 relative z-10">Balanced Decisions</p>
                            <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                                Prioritizes interpretability when explaining risks while leveraging deep learning confidence.
                            </p>
                        </div>
                    </>
                )}

            </section>
        </div>
    );
};

export default Home;

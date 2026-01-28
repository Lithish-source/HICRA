import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Network, GitBranch, Layout, Loader2, AlertCircle, Search, User, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import { toast } from 'sonner';

const Dashboard = ({ user }) => {
    const location = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');

            // 1. If we have immediate result from Predict page, use it (only for User view context)
            if (location.state?.result) {
                setData(location.state.result);
                setLoading(false);
                return;
            }

            // 2. If no user (should be handled by App router, but safety check)
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                if (user.role === 'admin') {
                    const response = await axios.get('http://localhost:8000/admin/all-data');
                    setData(response.data); // Expecting Array
                } else {
                    const response = await axios.get(`http://localhost:8000/user-data/${user.email}`);
                    if (response.data.error) {
                        setError(response.data.error);
                    } else {
                        // Backend returns { user_profile, prediction_result }
                        setData(response.data);
                    }
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, location.state]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-medium animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-600">
                <AlertCircle size={24} className="mr-2" />
                <span className="font-semibold">{error}</span>
            </div>
        );
    }

    if (!data) return null;

    // Refresh function for admin
    const handleRefresh = async () => {
        if (user?.role === 'admin') {
            try {
                const response = await axios.get('http://localhost:8000/admin/all-data');
                setData(response.data);
            } catch (err) {
                console.error("Refresh failed:", err);
            }
        }
    };

    // Render logic based on Role
    if (user?.role === 'admin') {
        return <AdminView data={data} onRefresh={handleRefresh} />;
    }

    // For User, normalize data structure
    // If coming from Predict page, 'data' is the result directly.
    // If coming from Backend, 'data' is { user_profile, prediction_result }.
    const viewData = data.prediction_result || data;
    const profile = data.user_profile || null; // Might be null if from Predict page

    return <UserView data={viewData} profile={profile} />;
};

// --- Sub Components ---

const AdminView = ({ data, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Calculate summary statistics
    const stats = React.useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return { total: 0, avgIncome: 0, avgLoan: 0, riskDistribution: { low: 0, medium: 0, high: 0 } };
        }

        const total = data.length;
        const avgIncome = data.reduce((sum, d) => sum + (d.AnnualIncome || 0), 0) / total;
        const avgLoan = data.reduce((sum, d) => sum + (d.LoanAmount || 0), 0) / total;

        const riskDistribution = { low: 0, medium: 0, high: 0 };
        data.forEach(d => {
            const score = d.RiskScore || 50;
            if (score < 40) riskDistribution.low++;
            else if (score < 70) riskDistribution.medium++;
            else riskDistribution.high++;
        });

        return { total, avgIncome, avgLoan, riskDistribution };
    }, [data]);

    // Aggregate feature importance (simulated based on common factors)
    const aggregateImportance = {
        'Debt to Income': 0.32,
        'Annual Income': 0.24,
        'Credit History': 0.18,
        'Loan Amount': 0.12,
        'Employment': 0.08,
        'Age': 0.04,
        'Existing Loans': 0.02
    };

    // Filter and sort data
    const filteredData = React.useMemo(() => {
        if (!Array.isArray(data)) return [];

        let result = data.filter(row => {
            const matchesSearch = !searchTerm ||
                row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const score = row.RiskScore || 50;
            let riskLevel = 'medium';
            if (score < 40) riskLevel = 'low';
            else if (score >= 70) riskLevel = 'high';

            const matchesRisk = riskFilter === 'all' || riskLevel === riskFilter;

            return matchesSearch && matchesRisk;
        });

        result.sort((a, b) => {
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'income') return (b.AnnualIncome || 0) - (a.AnnualIncome || 0);
            if (sortBy === 'loan') return (b.LoanAmount || 0) - (a.LoanAmount || 0);
            return 0;
        });

        return result;
    }, [data, searchTerm, riskFilter, sortBy]);

    const getRiskBadge = (score) => {
        if (score < 40) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Low</span>;
        if (score < 70) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Medium</span>;
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">High</span>;
    };

    const getRiskLevel = (score) => {
        if (score < 40) return 'Low';
        if (score < 70) return 'Medium';
        return 'High';
    };

    // CSV Export function
    const exportToCSV = () => {
        if (!filteredData.length) return;

        const headers = ['Name', 'Email', 'Income', 'Loan Amount', 'Credit History', 'Risk Score'];
        const rows = filteredData.map(row => [
            row.name,
            row.email,
            row.AnnualIncome,
            row.LoanAmount,
            row.LengthOfCreditHistory,
            row.RiskScore || 50
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Simple Donut Chart component
    const DonutChart = ({ low, medium, high }) => {
        const total = low + medium + high || 1;
        const lowPct = (low / total) * 100;
        const mediumPct = (medium / total) * 100;
        const highPct = (high / total) * 100;

        const lowDeg = (lowPct / 100) * 360;
        const mediumDeg = (mediumPct / 100) * 360;

        return (
            <div className="relative w-32 h-32 mx-auto">
                <div
                    className="w-full h-full rounded-full"
                    style={{
                        background: `conic-gradient(
                            #22c55e 0deg ${lowDeg}deg,
                            #eab308 ${lowDeg}deg ${lowDeg + mediumDeg}deg,
                            #ef4444 ${lowDeg + mediumDeg}deg 360deg
                        )`
                    }}
                />
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">{total}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                    {selectedUser.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{selectedUser.name}</h3>
                                    <p className="text-gray-500">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Income</p>
                                    <p className="text-lg font-semibold">${selectedUser.AnnualIncome?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Loan Amount</p>
                                    <p className="text-lg font-semibold">${selectedUser.LoanAmount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Credit History</p>
                                    <p className="text-lg font-semibold">{selectedUser.LengthOfCreditHistory} years</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Debt-to-Income</p>
                                    <p className="text-lg font-semibold">{((selectedUser.DebtToIncomeRatio || 0) * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Employment</p>
                                    <p className="text-lg font-semibold capitalize">{selectedUser.EmploymentStatus || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Risk Score</p>
                                    <p className="text-lg font-semibold">{selectedUser.RiskScore?.toFixed(1) || 50}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 uppercase mb-2">Risk Level</p>
                                {getRiskBadge(selectedUser.RiskScore || 50)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-soft border border-slate-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Users</p>
                    <p className="text-3xl font-bold text-primary">{stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-soft border border-slate-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Avg Income</p>
                    <p className="text-3xl font-bold text-gray-800">${Math.round(stats.avgIncome).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-soft border border-slate-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Avg Loan</p>
                    <p className="text-3xl font-bold text-gray-800">${Math.round(stats.avgLoan).toLocaleString()}</p>
                </div>
                {/* Donut Chart Card */}
                <div className="bg-white rounded-xl p-5 shadow-soft border border-slate-100 col-span-2 md:col-span-2">
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">Risk Distribution</p>
                    <div className="flex items-center gap-6">
                        <DonutChart
                            low={stats.riskDistribution.low}
                            medium={stats.riskDistribution.medium}
                            high={stats.riskDistribution.high}
                        />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-sm text-gray-600">Low: {stats.riskDistribution.low}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="text-sm text-gray-600">Medium: {stats.riskDistribution.medium}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="text-sm text-gray-600">High: {stats.riskDistribution.high}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Refresh Data
                    </button>
                )}
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* Feature Importance Chart */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
                <h3 className="font-bold text-gray-700 mb-4">Model Feature Importance (Aggregate)</h3>
                <div className="space-y-3">
                    {Object.entries(aggregateImportance).map(([key, value], index) => {
                        const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500", "bg-yellow-500"];
                        return (
                            <div key={key} className="flex items-center">
                                <div className="w-32 text-sm font-medium text-gray-600">{key}</div>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${colors[index % colors.length]} rounded-full`} style={{ width: `${value * 100}%` }}></div>
                                </div>
                                <div className="w-12 text-right text-sm font-bold text-gray-700">{Math.round(value * 100)}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Header with Search & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                <div className="flex flex-wrap gap-3">
                    <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="outline-none text-sm w-40"
                        />
                    </div>
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="bg-white border rounded-lg px-3 py-2 text-sm shadow-sm"
                    >
                        <option value="all">All Risks</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border rounded-lg px-3 py-2 text-sm shadow-sm"
                    >
                        <option value="name">Sort: Name</option>
                        <option value="income">Sort: Income</option>
                        <option value="loan">Sort: Loan Amount</option>
                    </select>
                </div>
            </div>

            <p className="text-sm text-gray-500">
                Showing {paginatedData.length} of {filteredData.length} users (Page {currentPage} of {totalPages}) • Click a row for details
            </p>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Hist.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(row)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {row.name ? row.name.charAt(0) : 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{row.name}</div>
                                                    <div className="text-sm text-gray-500">{row.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${row.AnnualIncome?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {row.LengthOfCreditHistory} yrs
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${row.LoanAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRiskBadge(row.RiskScore || 50)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No users match your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <div className="flex items-center gap-2">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                                if (pageNum > totalPages || pageNum < 1) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 text-sm rounded-lg ${currentPage === pageNum ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const UserView = ({ data, profile }) => {
    const [showRules, setShowRules] = useState(false);

    // Fallback if data is empty (shouldn't happen with loading check)
    if (!data || !data.risk_level) {
        return (
            <div className="text-center py-20">
                <Link to="/predict" className="text-primary hover:underline flex items-center justify-center gap-2">
                    <User size={20} />
                    Run a prediction to see your risk profile.
                </Link>
            </div>
        );
    }

    const { risk_level, final_confidence, dt_prediction, nn_prediction, agreement, explanation, nn_confidence } = data;

    const getRiskColor = (level) => {
        if (level === 'Low') return 'bg-green-500';
        if (level === 'Medium') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getRiskText = (level) => {
        if (level === 'Low') return 'text-green-600';
        if (level === 'Medium') return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {profile && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-slate-100 dark:border-dark-border flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Welcome, {profile.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">Here is your latest credit risk assessment.</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-400 dark:text-dark-muted">Email</div>
                        <div className="font-medium text-gray-700 dark:text-white">{profile.email}</div>
                    </div>
                </motion.div>
            )}

            {/* Risk Gauge Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-dark-surface dark:via-dark-surface dark:to-dark-card rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center relative overflow-hidden"
            >
                {/* Background effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.2),transparent_50%)]" />

                <div className="relative z-10">
                    <RiskGauge score={Math.round(final_confidence * 100)} size={220} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 text-center relative z-10"
                >
                    <p className="text-blue-200 text-sm">Hybrid Model Confidence</p>
                    <p className={`text-xs mt-1 ${agreement ? 'text-green-400' : 'text-yellow-400'}`}>
                        {agreement ? '✓ DT & NN Models Agree' : '⚠ Models Disagree - DT Priority'}
                    </p>
                </motion.div>
            </motion.div>

            {/* 3-Column Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Decision Tree Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border flex flex-col h-full"
                >
                    <div className="flex items-center space-x-3 mb-4 text-gray-700 dark:text-white">
                        <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-lg">
                            <GitBranch size={20} className="text-green-700 dark:text-green-400" />
                        </div>
                        <h3 className="font-bold text-lg">Decision Tree Result</h3>
                    </div>
                    <div className="flex-grow space-y-4">
                        <div className={`text-xl font-bold ${getRiskText(dt_prediction)}`}>
                            {dt_prediction} Risk
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowRules(!showRules)}
                                className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-primary transition-colors"
                            >
                                Rule Path
                                <span className={`transform transition-transform ${showRules ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${showRules ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <ul className="text-sm text-gray-600 space-y-1 pt-2">
                                    {explanation && explanation.rules && explanation.rules.map((rule, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="mr-2 text-accent">›</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Neural Network Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border flex flex-col h-full"
                >
                    <div className="flex items-center space-x-3 mb-4 text-gray-700 dark:text-white">
                        <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg">
                            <Network size={20} className="text-blue-700 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-lg">Neural Network Result</h3>
                    </div>
                    <div className="flex-grow space-y-4">
                        <div className={`text-xl font-bold ${getRiskText(nn_prediction)}`}>
                            Probability: {Math.round(nn_confidence * 100)}%
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wide">Analysis</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Non-linear patterns analyzed. Deep learning model focuses on complex interactions.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Hybrid Model Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-soft dark:shadow-none border border-slate-100 dark:border-dark-border flex flex-col h-full relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Layout size={100} />
                    </div>
                    <div className="flex items-center space-x-3 mb-4 text-gray-700 dark:text-white relative z-10">
                        <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg">
                            <Layout size={20} className="text-purple-700 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-lg">Hybrid Model</h3>
                    </div>
                    <div className="flex-grow space-y-4 relative z-10">
                        <div className={`${getRiskColor(risk_level)} text-white inline-block px-4 py-1.5 rounded-lg font-bold shadow-md`}>
                            {risk_level} Risk
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-900 dark:text-white">Weighted Confidence: {Math.round(final_confidence * 100)}%</p>
                            <p className={`mt-1 ${agreement ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'} font-medium flex items-center`}>
                                {agreement ? "DT & NN Agree" : "Models Disagree - DT Priority"}
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Feature Importance Bars */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-dark-surface rounded-2xl p-8 shadow-card dark:shadow-none border border-slate-100 dark:border-dark-border"
            >
                <h3 className="font-bold text-gray-700 dark:text-white mb-6">Feature Importance</h3>

                <div className="space-y-4">
                    {explanation && explanation.feature_importance && Object.entries(explanation.feature_importance)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, value], index) => {
                            const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500", "bg-yellow-500", "bg-red-500"];
                            const colorClass = colors[index % colors.length];
                            const widthPct = Math.min(value * 200, 100);

                            return (
                                <motion.div
                                    key={key}
                                    className="flex items-center"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                >
                                    <div className="w-40 text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{key.replace(/_/g, ' ')}</div>
                                    <div className="flex-1 h-4 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${colorClass} rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${widthPct}%` }}
                                            transition={{ duration: 0.8, delay: 0.8 + index * 0.05 }}
                                        />
                                    </div>
                                    <div className="w-14 text-right text-sm font-bold text-gray-700 dark:text-white">{Math.round(value * 100)}%</div>
                                </motion.div>
                            )
                        })}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg rounded-lg p-4">
                    <span className="font-semibold text-gray-700 dark:text-white text-sm">Top Factors: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {explanation ? "Identified from your financial profile." : "Loading..."}
                    </span>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link to="/what-if" className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-0.5">
                        Try What-If Analysis
                    </Link>
                </div>
            </motion.div>

        </div>
    );
};

export default Dashboard;

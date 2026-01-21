import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sliders, RefreshCw, AlertCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const WhatIfAnalysis = ({ user }) => {
    const navigate = useNavigate();
    const [baseProfile, setBaseProfile] = useState(null);
    const [inputs, setInputs] = useState({
        age: 30,
        income: 50000,
        credit_history_length: 5,
        existing_loans: 1,
        debt_to_income_ratio: 0.3,
        loan_amount: 10000,
        repayment_duration: 24,
        employment_type: 'employed'
    });
    const [prediction, setPrediction] = useState(null);
    const [basePrediction, setBasePrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predicting, setPredicting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBaseProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/user-data/${user.email}`);
                if (!response.data.error) {
                    const profile = response.data.user_profile;
                    setBaseProfile(profile);
                    setBasePrediction(response.data.prediction_result);
                    setPrediction(response.data.prediction_result);
                    setInputs({
                        age: profile.age,
                        income: profile.income,
                        credit_history_length: profile.credit_history_length,
                        existing_loans: profile.existing_loans,
                        debt_to_income_ratio: profile.debt_to_income_ratio,
                        loan_amount: profile.loan_amount,
                        repayment_duration: profile.repayment_duration,
                        employment_type: profile.employment_type
                    });
                }
            } catch (err) {
                setError('Failed to load your profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchBaseProfile();
    }, [user, navigate]);

    const runPrediction = async () => {
        setPredicting(true);
        try {
            const response = await axios.post('http://localhost:8000/predict', inputs);
            setPrediction(response.data);
        } catch (err) {
            console.error('Prediction failed:', err);
        } finally {
            setPredicting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const resetToOriginal = () => {
        if (baseProfile) {
            setInputs({
                age: baseProfile.age,
                income: baseProfile.income,
                credit_history_length: baseProfile.credit_history_length,
                existing_loans: baseProfile.existing_loans,
                debt_to_income_ratio: baseProfile.debt_to_income_ratio,
                loan_amount: baseProfile.loan_amount,
                repayment_duration: baseProfile.repayment_duration,
                employment_type: baseProfile.employment_type
            });
            setPrediction(basePrediction);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-medium">Loading your profile...</p>
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

    const getRiskColor = (level) => {
        if (level === 'Low') return 'bg-green-500';
        if (level === 'Medium') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getConfidenceChange = () => {
        if (!basePrediction || !prediction) return null;
        const diff = prediction.final_confidence - basePrediction.final_confidence;
        return diff;
    };

    const confidenceChange = getConfidenceChange();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Sliders size={32} />
                    <h1 className="text-2xl font-bold">What-If Analysis</h1>
                </div>
                <p className="text-blue-100">Adjust your financial inputs to see how they affect your risk score.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Controls */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Adjust Parameters</h2>
                        <button
                            onClick={resetToOriginal}
                            className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                        >
                            <RefreshCw size={14} /> Reset
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age: <span className="font-bold text-primary">{inputs.age}</span>
                            </label>
                            <input
                                type="range"
                                min="18"
                                max="70"
                                value={inputs.age}
                                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Income */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Annual Income: <span className="font-bold text-primary">${inputs.income.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="10000"
                                max="200000"
                                step="5000"
                                value={inputs.income}
                                onChange={(e) => handleInputChange('income', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Credit History Length */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Credit History: <span className="font-bold text-primary">{inputs.credit_history_length} years</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                value={inputs.credit_history_length}
                                onChange={(e) => handleInputChange('credit_history_length', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Existing Loans */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Open Credit Lines: <span className="font-bold text-primary">{inputs.existing_loans}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={inputs.existing_loans}
                                onChange={(e) => handleInputChange('existing_loans', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Debt to Income Ratio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Debt-to-Income Ratio: <span className="font-bold text-primary">{(inputs.debt_to_income_ratio * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={inputs.debt_to_income_ratio}
                                onChange={(e) => handleInputChange('debt_to_income_ratio', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Loan Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Amount: <span className="font-bold text-primary">${inputs.loan_amount.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="1000"
                                max="100000"
                                step="1000"
                                value={inputs.loan_amount}
                                onChange={(e) => handleInputChange('loan_amount', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Repayment Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Repayment Duration: <span className="font-bold text-primary">{inputs.repayment_duration} months</span>
                            </label>
                            <input
                                type="range"
                                min="6"
                                max="72"
                                step="6"
                                value={inputs.repayment_duration}
                                onChange={(e) => handleInputChange('repayment_duration', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Employment Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                            <select
                                value={inputs.employment_type}
                                onChange={(e) => handleInputChange('employment_type', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="employed">Employed</option>
                                <option value="self-employed">Self-Employed</option>
                                <option value="unemployed">Unemployed</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={runPrediction}
                        disabled={predicting}
                        className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                        {predicting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Sliders size={20} />
                                Run Prediction
                            </>
                        )}
                    </button>
                </div>

                {/* Result Panel */}
                <div className="space-y-4">
                    {/* Current Prediction */}
                    {prediction && (
                        <div className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Predicted Risk</h3>
                            <div className={`${getRiskColor(prediction.risk_level)} text-white px-6 py-4 rounded-xl text-2xl font-bold text-center shadow-md`}>
                                {prediction.risk_level} Risk
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">Confidence</p>
                                <p className="text-3xl font-bold text-gray-800">{Math.round(prediction.final_confidence * 100)}%</p>

                                {confidenceChange !== null && confidenceChange !== 0 && (
                                    <p className={`text-sm mt-2 flex items-center justify-center gap-1 ${confidenceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {confidenceChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        {confidenceChange > 0 ? '+' : ''}{(confidenceChange * 100).toFixed(1)}% vs original
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Model Agreement */}
                    {prediction && (
                        <div className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Model Insights</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Decision Tree:</span>
                                    <span className="font-semibold">{prediction.dt_prediction}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Neural Network:</span>
                                    <span className="font-semibold">{prediction.nn_prediction}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Agreement:</span>
                                    <span className={`font-semibold ${prediction.agreement ? 'text-green-600' : 'text-orange-500'}`}>
                                        {prediction.agreement ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatIfAnalysis;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, AlertCircle, Loader2, Lightbulb, ArrowRight } from 'lucide-react';

const ImproveScore = ({ user }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/user-data/${user.email}`);
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    setData(response.data);
                }
            } catch (err) {
                setError('Failed to load your profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-medium">Analyzing your profile...</p>
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

    const profile = data?.user_profile;
    const prediction = data?.prediction_result;
    const explanation = prediction?.explanation;

    // Generate recommendations based on feature importance
    const generateRecommendations = () => {
        if (!explanation?.feature_importance) return [];

        const recommendations = [];
        const importance = explanation.feature_importance;

        // Sort by importance and generate tips for top factors
        const sortedFeatures = Object.entries(importance)
            .sort(([, a], [, b]) => b - a);

        sortedFeatures.forEach(([feature, weight]) => {
            if (weight < 0.05) return; // Skip low importance features

            switch (feature) {
                case 'debt_to_income_ratio':
                    if (profile.debt_to_income_ratio > 0.4) {
                        recommendations.push({
                            title: 'Reduce Debt-to-Income Ratio',
                            description: `Your current ratio is ${(profile.debt_to_income_ratio * 100).toFixed(1)}%. Aim for below 40% by paying down existing debts or increasing income.`,
                            impact: 'High',
                            icon: '💳'
                        });
                    }
                    break;
                case 'income':
                    if (profile.income < 40000) {
                        recommendations.push({
                            title: 'Increase Income Sources',
                            description: 'Higher income significantly improves your risk profile. Consider skill development or secondary income streams.',
                            impact: 'High',
                            icon: '💰'
                        });
                    }
                    break;
                case 'credit_history_length':
                    if (profile.credit_history_length < 5) {
                        recommendations.push({
                            title: 'Build Credit History',
                            description: `Your credit history is ${profile.credit_history_length} years. Maintain accounts in good standing to extend this over time.`,
                            impact: 'Medium',
                            icon: '📈'
                        });
                    }
                    break;
                case 'existing_loans':
                    if (profile.existing_loans > 2) {
                        recommendations.push({
                            title: 'Consolidate Existing Loans',
                            description: `You have ${profile.existing_loans} open credit lines. Consider consolidating to reduce complexity and improve your profile.`,
                            impact: 'Medium',
                            icon: '📋'
                        });
                    }
                    break;
                case 'employment_type':
                    if (profile.employment_type === 'unemployed' || profile.employment_type === 'self-employed') {
                        recommendations.push({
                            title: 'Stable Employment',
                            description: 'Stable employment status (full-time) is viewed favorably by risk models.',
                            impact: 'High',
                            icon: '💼'
                        });
                    }
                    break;
                default:
                    break;
            }
        });

        // Add a generic tip if no specific ones generated
        if (recommendations.length === 0) {
            recommendations.push({
                title: 'Maintain Good Standing',
                description: 'Your profile looks healthy! Continue with timely payments and responsible credit usage.',
                impact: 'Low',
                icon: '✅'
            });
        }

        return recommendations;
    };

    const recommendations = generateRecommendations();

    const getImpactColor = (impact) => {
        if (impact === 'High') return 'bg-red-100 text-red-700';
        if (impact === 'Medium') return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={32} />
                    <h1 className="text-2xl font-bold">Improve Your Score</h1>
                </div>
                <p className="text-green-100">Personalized recommendations based on your credit risk assessment.</p>
            </div>

            {/* Current Score Banner */}
            {prediction && (
                <div className="bg-white rounded-xl p-6 shadow-card border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Current Risk Level</p>
                        <p className={`text-3xl font-bold ${prediction.risk_level === 'Low' ? 'text-green-600' :
                                prediction.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {prediction.risk_level} Risk
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className="text-2xl font-bold text-gray-800">{Math.round(prediction.final_confidence * 100)}%</p>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Lightbulb className="text-yellow-500" />
                    Actionable Recommendations
                </h2>

                {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-soft border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">{rec.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-gray-800">{rec.title}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getImpactColor(rec.impact)}`}>
                                        {rec.impact} Impact
                                    </span>
                                </div>
                                <p className="text-gray-600">{rec.description}</p>
                            </div>
                            <ArrowRight className="text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">Want to see how changes affect your score?</p>
                <button
                    onClick={() => navigate('/what-if')}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                    Try What-If Analysis →
                </button>
            </div>
        </div>
    );
};

export default ImproveScore;

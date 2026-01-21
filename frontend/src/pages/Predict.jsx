import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';

const Predict = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: 30,
        income: 50000,
        employment_type: 'employed',
        credit_history_length: 5,
        existing_loans: 1,
        debt_to_income_ratio: 0.3,
        loan_amount: 10000,
        repayment_duration: 12
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'employment_type' ? value : Number(value)
        }));
    };

    const handleReset = () => {
        setFormData({
            age: 30,
            income: 50000,
            employment_type: 'employed',
            credit_history_length: 5,
            existing_loans: 1,
            debt_to_income_ratio: 0.3,
            loan_amount: 10000,
            repayment_duration: 12
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Get prediction
            const response = await axios.post('http://localhost:8000/predict', formData);
            const result = response.data;

            // 2. Generate name and email for new applicant
            const timestamp = Date.now();
            const newApplicant = {
                name: `Applicant ${timestamp % 10000}`,
                email: `applicant${timestamp}@demo.com`,
                ...formData,
                risk_level: result.risk_level,
                risk_score: result.risk_level === 'Low' ? 30 : result.risk_level === 'Medium' ? 55 : 80
            };

            // 3. Save to backend
            try {
                await axios.post('http://localhost:8000/add-applicant', newApplicant);
                console.log('Applicant saved to backend');
            } catch (saveError) {
                console.warn('Could not save applicant:', saveError);
            }

            // 4. Navigate to dashboard
            navigate('/dashboard', { state: { result: result, input: formData } });
        } catch (error) {
            console.error("Prediction failed:", error);
            alert("Failed to get prediction. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">

            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">New Applicant Assessment</h2>
                        <p className="text-sm text-gray-500">Enter financial details below.</p>
                    </div>
                    <button onClick={handleReset} className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium">
                        <RotateCcw size={14} className="mr-1" /> Reset Form
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                        </div>

                        <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} min="18" max="100" />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                            <div className="relative">
                                <select
                                    name="employment_type"
                                    value={formData.employment_type}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 rounded-lg border-gray-200 border p-3 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all outline-none appearance-none"
                                >
                                    <option value="employed">Employed (Salaried)</option>
                                    <option value="self-employed">Self-Employed / Business</option>
                                    <option value="unemployed">Unemployed</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Financial Profile</h3>
                        </div>

                        <InputField label="Annual Income" name="income" type="number" value={formData.income} onChange={handleChange} prefix="$" />

                        <InputField label="Combined Debt-to-Income Ratio" name="debt_to_income_ratio" type="number" step="0.01" value={formData.debt_to_income_ratio} onChange={handleChange} placeholder="0.30" />

                        <InputField label="Credit History Length" name="credit_history_length" type="number" value={formData.credit_history_length} onChange={handleChange} suffix="Years" />

                        <InputField label="Number of Existing Loans" name="existing_loans" type="number" value={formData.existing_loans} onChange={handleChange} />

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Loan Request</h3>
                        </div>

                        <InputField label="Requested Loan Amount" name="loan_amount" type="number" value={formData.loan_amount} onChange={handleChange} prefix="$" />

                        <InputField label="Repayment Duration" name="repayment_duration" type="number" value={formData.repayment_duration} onChange={handleChange} suffix="Months" />

                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center items-center py-3.5 px-8 rounded-xl shadow-lg shadow-blue-900/10 text-base font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-70 transition-all transform active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Processing Model...
                                </>
                            ) : (
                                <>
                                    Evaluate Risk
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

const InputField = ({ label, name, type = "text", prefix, suffix, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative flex items-center">
            {prefix && <span className="absolute left-4 text-gray-400 font-medium">{prefix}</span>}
            <input
                type={type}
                name={name}
                className={`w-full bg-gray-50 rounded-lg border-gray-200 border p-3 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all outline-none font-medium text-gray-800 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-16' : ''}`}
                {...props}
            />
            {suffix && <span className="absolute right-4 text-gray-400 text-sm font-medium">{suffix}</span>}
        </div>
    </div>
);

export default Predict;

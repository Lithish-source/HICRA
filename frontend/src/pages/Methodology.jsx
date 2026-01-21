import React from 'react';

const Methodology = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-12">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">Methodology & Architecture</h1>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                    A deep dive into how our Hybrid Decision Tree–Neural Network model maximizes both accuracy and transparency.
                </p>
            </div>

            {/* Architecture Diagram (Conceptual) */}
            <section>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Hybrid Architecture flow</h2>
                    {/* Simple CSS Illustration of the flow */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                        <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 w-full md:w-auto">
                            <span className="font-bold">Input Data</span>
                            <div className="text-xs text-gray-500">Applicant Details</div>
                        </div>
                        <div className="hidden md:block text-gray-400">➜</div>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-bold text-blue-800">Decision Tree</span>
                                <div className="text-xs text-blue-600">Explicit Rules</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="font-bold text-purple-800">Neural Network</span>
                                <div className="text-xs text-purple-600">Pattern Recognition</div>
                            </div>
                        </div>
                        <div className="hidden md:block text-gray-400">➜</div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 w-full md:w-auto">
                            <span className="font-bold text-green-800">Hybrid Logic Layer</span>
                            <div className="text-xs text-green-600">Conflict Resolution</div>
                        </div>
                        <div className="hidden md:block text-gray-400">➜</div>
                        <div className="p-4 bg-gray-800 text-white rounded-lg w-full md:w-auto">
                            <span className="font-bold">Final Risk Score</span>
                            <div className="text-xs text-gray-400">+ Explanation</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interpretability First Statement */}
            <section className="bg-accent/5 p-8 rounded-2xl border border-accent/20">
                <h2 className="text-xl font-bold text-accent mb-4">Interpretability First Policy</h2>
                <p className="text-gray-700 leading-relaxed font-medium">
                    "In case of conflict, the Decision Tree explanation is prioritized over Neural Network probability."
                </p>
                <p className="text-gray-600 mt-2 text-sm">
                    This design choice ensures that every high-stakes financial decision can be traced back to clear, human-understandable rules (e.g., "Debt-to-income ratio &gt; 50%"), satisfying regulatory requirements for transparency commonly found in banking (e.g., GDPR, ECOA).
                </p>
            </section>

            {/* Dataset Info */}
            <section className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-3">Dataset Description</h3>
                    <p className="text-gray-600 text-sm">
                        We utilize a <strong>synthetic dataset</strong> generated to mirror real-world credit risk distributions. Key features include demographics (Age, Employment) and financial metrics (Income, Debt, Credit History).
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-3">Evaluation Metrics</h3>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                        <li><strong>Accuracy:</strong> Overall correctness of risk labels.</li>
                        <li><strong>Precision/Recall:</strong> Crucial for identifying high-risk applicants without false alarms.</li>
                        <li><strong>Fidelity:</strong> How well the decision tree rules explain the model's actual behavior.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Methodology;

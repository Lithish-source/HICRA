import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Risk Score Gauge Component
 * Displays a semi-circular gauge that animates from 0 to the target score
 */
const RiskGauge = ({ score = 50, size = 200, strokeWidth = 16 }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    // Animate the score on mount
    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    // Calculate dimensions
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Half circle
    const center = size / 2;

    // Calculate stroke offset based on score (0-100)
    const progress = animatedScore / 100;
    const strokeDashoffset = circumference * (1 - progress);

    // Determine color based on score
    const getColor = (score) => {
        if (score < 40) return { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' }; // Green
        if (score < 70) return { main: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' }; // Yellow
        return { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }; // Red
    };

    const color = getColor(animatedScore);

    // Get risk level text
    const getRiskLevel = (score) => {
        if (score < 40) return 'LOW RISK';
        if (score < 70) return 'MEDIUM RISK';
        return 'HIGH RISK';
    };

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg
                width={size}
                height={size / 2 + 20}
                viewBox={`0 0 ${size} ${size / 2 + 20}`}
                className="transform"
            >
                {/* Background arc */}
                <path
                    d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="text-gray-200 dark:text-gray-700"
                />

                {/* Animated progress arc */}
                <motion.path
                    d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
                    fill="none"
                    stroke={color.main}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${color.glow})`,
                    }}
                />

                {/* Tick marks */}
                {[0, 25, 50, 75, 100].map((tick, i) => {
                    const angle = Math.PI - (tick / 100) * Math.PI;
                    const x1 = center + (radius - 25) * Math.cos(angle);
                    const y1 = center - (radius - 25) * Math.sin(angle);
                    const x2 = center + (radius - 35) * Math.cos(angle);
                    const y2 = center - (radius - 35) * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-300 dark:text-gray-600"
                        />
                    );
                })}

                {/* Center score display */}
                <motion.text
                    x={center}
                    y={center - 10}
                    textAnchor="middle"
                    className="fill-gray-800 dark:fill-white"
                    style={{ fontSize: size / 5, fontWeight: 'bold' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.tspan
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                    >
                        {Math.round(animatedScore)}
                    </motion.tspan>
                </motion.text>

                <text
                    x={center}
                    y={center + 15}
                    textAnchor="middle"
                    className="fill-gray-500 dark:fill-gray-400"
                    style={{ fontSize: size / 14 }}
                >
                    / 100
                </text>
            </svg>

            {/* Risk level badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider"
                style={{
                    backgroundColor: `${color.main}20`,
                    color: color.main,
                    boxShadow: `0 0 20px ${color.glow}`,
                }}
            >
                {getRiskLevel(animatedScore)}
            </motion.div>
        </div>
    );
};

export default RiskGauge;

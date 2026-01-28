import React from 'react';
import { motion } from 'framer-motion';

/**
 * Page Transition Wrapper Component
 * Wraps page content with smooth enter/exit animations
 */
const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
        },
    },
};

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * Stagger Container for animating children sequentially
 */
export const StaggerContainer = ({ children, className = "", delay = 0.1 }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            className={className}
            variants={{
                animate: {
                    transition: {
                        staggerChildren: delay,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Fade In Up animation for individual items
 */
export const FadeInUp = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Scale In animation
 */
export const ScaleIn = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                delay,
                ease: "easeOut"
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Slide In from Left
 */
export const SlideInLeft = ({ children, className = "", delay = 0 }) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

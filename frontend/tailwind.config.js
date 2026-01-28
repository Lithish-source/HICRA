/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: "#1e3a8a", // Deep Royal Blue
        "primary-dark": "#172554", // Darker Blue
        secondary: "#64748b", // Slate 500
        accent: "#2563eb", // Bright Blue
        "accent-hover": "#1d4ed8",
        background: "#f1f5f9", // Very light slate gray
        surface: "#ffffff",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        "risk-high": "#ef4444",
        "risk-medium": "#f59e0b",
        "risk-low": "#10b981",

        // Dark mode specific
        dark: {
          bg: "#0f172a",        // Slate 900
          surface: "#1e293b",   // Slate 800
          card: "#1e293b",
          border: "#334155",    // Slate 700
          text: "#f1f5f9",      // Slate 100
          muted: "#94a3b8",     // Slate 400
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'gradient': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
}

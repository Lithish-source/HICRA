/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        "risk-low": "#10b981"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}

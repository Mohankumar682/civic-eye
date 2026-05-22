export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 70px rgba(59, 130, 246, 0.22)',
        'glow-primary': '0 20px 70px rgba(255, 107, 107, 0.3)',
        'glow-secondary': '0 20px 70px rgba(78, 205, 196, 0.3)',
        'glow-accent': '0 20px 70px rgba(69, 183, 209, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#45b7d1',
        midnight: '#020617',
        'midnight-2': '#08101f',
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-color': 'pulse-color 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-color': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 107, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 107, 107, 0)' },
        },
      },
    },
  },
  plugins: [],
}

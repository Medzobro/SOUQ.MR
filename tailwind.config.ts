import type { Config } from 'tailwindcss';

/**
 * SOUQ.MR — Tailwind config wired to the design system.
 * Tokens mirror .kiro/steering/design-system.md.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        'bg-card': '#12121A',
        'bg-card-2': '#1A1A26',
        accent: '#FF6B35',
        'accent-2': '#FFB347',
        gold: '#F0C040',
        text: '#F0EDE8',
        'text-muted': '#8A8799',
        border: '#2A2A3A',
        success: '#2ECC71',
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'Bebas Neue', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        'card-lg': '20px',
        'card-xl': '28px',
      },
      boxShadow: {
        glow: '0 4px 20px rgba(255,107,53,0.3)',
        'glow-lg': '0 6px 28px rgba(255,107,53,0.5)',
        card: '0 12px 40px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #FF6B35, #FFB347)',
        'gradient-logo': 'linear-gradient(135deg, #FF6B35, #F0C040)',
      },
      animation: {
        pulse: 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;

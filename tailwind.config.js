/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#070E1B',
          secondary: '#0C1525',
          elevated:  '#101D33',
          card:      '#101D33',
        },
        accent: {
          primary:   '#2563EB',
          secondary: '#3B82F6',
          glow:      'rgba(37,99,235,0.10)',
          deep:      '#1D4ED8',
        },
        text: {
          primary:   '#EDF4FC',
          secondary: '#7A9BB8',
          muted:     '#3D5A74',
        },
        success: '#5CB88A',
        warning: '#F5894A',
        border: {
          DEFAULT: '#1A2D42',
          accent:  '#2563EB',
          subtle:  '#0E1929',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm:      '2px',
        md:      '4px',
        lg:      '6px',
        xl:      '8px',
        '2xl':   '12px',
        full:    '9999px',
      },
      boxShadow: {
        glow:         '0 0 16px rgba(37,99,235,0.25)',
        'glow-sm':    '0 0 8px rgba(37,99,235,0.15)',
        'glow-xs':    '0 0 4px rgba(37,99,235,0.10)',
        card:         '0 1px 3px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-blue':    'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'gradient-card':    'linear-gradient(135deg, #101D33 0%, #0C1525 100%)',
        'gradient-hero':    'linear-gradient(160deg, #070E1B 0%, #0C1525 100%)',
        'gradient-workout': 'linear-gradient(135deg, #0C1525 0%, #101D33 100%)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

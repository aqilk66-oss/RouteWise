/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        brand: {
          navy: '#183B56',
          blue: '#2563EB',
          teal: '#14B8A6',
          slate: '#64748B',
          white: '#FFFFFF',
          dark: '#0F172A',
        },
        primary: {
          DEFAULT: '#183B56',
          hover: '#132E43',
          active: '#0E2333',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          teal: '#14B8A6',
          'teal-hover': '#0D9488',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          subtle: '#F1F5F9',
          elevated: '#FFFFFF',
          dark: '#1E293B',
          'dark-elevated': '#334155',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
          dark: '#334155',
        },
        status: {
          success: '#10B981',
          'success-bg': '#ECFDF5',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          danger: '#EF4444',
          'danger-bg': '#FEF2F2',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
        }
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 23, 42, 0.05)',
        'soft': '0 4px 20px -2px rgba(24, 59, 86, 0.08)',
        'medium': '0 10px 30px -4px rgba(24, 59, 86, 0.12)',
        'floating': '0 20px 40px -10px rgba(24, 59, 86, 0.18)',
        'glass': '0 8px 32px 0 rgba(24, 59, 86, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(37, 99, 235, 0.16)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        'content': '1440px',
      }
    },
  },
  plugins: [],
}

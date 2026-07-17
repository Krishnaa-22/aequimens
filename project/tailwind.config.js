/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          primary: '#667A3E',
          deep: '#3E4A27',
          forest: '#26301A',
          soft: '#9BAE70',
          tint: '#E9EEDC',
        },
        silver: {
          DEFAULT: '#C5C8C6',
          light: '#E6E8E7',
          dark: '#888E8B',
          metallic: '#F4F5F4',
        },
        canvas: {
          DEFAULT: '#F5F5F1',
          secondary: '#ECEEE8',
        },
        ink: {
          DEFAULT: '#1E251B',
          soft: '#687064',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(38, 48, 26, 0.18)',
        'soft-lg': '0 18px 50px -20px rgba(38, 48, 26, 0.25)',
        'inner-silver': 'inset 0 1px 0 rgba(244,245,244,0.7)',
        glow: '0 0 0 1px rgba(155,174,112,0.25), 0 12px 40px -16px rgba(102,122,62,0.45)',
      },
      backgroundImage: {
        'olive-gradient': 'linear-gradient(135deg, #3E4A27, #71894A, #A7B77D)',
        'silver-gradient': 'linear-gradient(145deg, #F5F6F5, #C9CDCA, #EEF0EF)',
        'olive-shine': 'linear-gradient(160deg, #71894A 0%, #667A3E 45%, #3E4A27 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        ringFill: {
          '0%': { strokeDashoffset: 'var(--ring-circumference)' },
          '100%': { strokeDashoffset: 'var(--ring-offset)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out both',
        fadeInScale: 'fadeInScale 0.5s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        breathe: 'breathe 8s ease-in-out infinite',
        slideUp: 'slideUp 0.5s ease-out both',
        slideInRight: 'slideInRight 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

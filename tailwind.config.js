/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // ============================================
            // COLOR PALETTE - Linear.app Inspired Dark Mode
            // ============================================
            colors: {
                // Teal Brand Color
                'teal-brand': {
                    900: '#005149', // Primary Sidebar/Brand
                    800: '#006B60',
                    700: '#008577',
                    600: '#00A090',
                    50: '#F0FDFA', // Light tint for backgrounds
                },
                // Override slate but keep it usable for light mode text
                slate: {
                    50: '#F9FAFB', // Off-white background
                    100: '#F3F4F6',
                    200: '#E5E7EB', // Borders
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280', // Text secondary
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937', // Text primary
                    900: '#111827',
                    950: '#030712',
                },
            },

            // ============================================
            // TYPOGRAPHY - Inter Font with 1.25 Scale
            // ============================================
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                // Base 16px with 1.25 Major Third scale
                'xs': ['0.75rem', { lineHeight: '1.4' }],      // 12px
                'sm': ['0.875rem', { lineHeight: '1.5' }],    // 14px
                'base': ['0.938rem', { lineHeight: '1.6' }],  // 15px (body)
                'lg': ['1rem', { lineHeight: '1.5' }],        // 16px
                'xl': ['1.25rem', { lineHeight: '1.3' }],     // 20px
                '2xl': ['1.563rem', { lineHeight: '1.2' }],   // 25px
                '3xl': ['1.953rem', { lineHeight: '1.2' }],   // 31px
                '4xl': ['2.441rem', { lineHeight: '1.1' }],   // 39px
                '5xl': ['3.052rem', { lineHeight: '1.1' }],   // 49px
            },

            // ============================================
            // BORDER RADIUS - Consistent Rounding
            // ============================================
            borderRadius: {
                'sm': '4px',
                'DEFAULT': '6px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
            },

            // ============================================
            // SHADOWS - Layered Elevation System
            // ============================================
            boxShadow: {
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.25)',
                '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.35)',
                'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.25)',
                'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
                'glow-rose': '0 0 20px rgba(244, 63, 94, 0.25)',
                'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
                'none': 'none',
            },

            // ============================================
            // ANIMATIONS - CSS Keyframes
            // ============================================
            animation: {
                // Skeleton shimmer
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
                // Slide animations
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'slide-out-right': 'slideOutRight 0.2s ease-in forwards',
                'slide-in-up': 'slideInUp 0.3s ease-out',
                'slide-in-down': 'slideInDown 0.3s ease-out',
                // Fade animations
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-out': 'fadeOut 0.2s ease-in',
                // Bounce
                'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
                // Pulse
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                // Spin
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(100%)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideOutRight: {
                    '0%': { opacity: '1', transform: 'translateX(0)' },
                    '100%': { opacity: '0', transform: 'translateX(100%)' },
                },
                slideInUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                gentleBounce: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },

            // ============================================
            // TRANSITIONS
            // ============================================
            transitionDuration: {
                'fast': '150ms',
                'normal': '200ms',
                'slow': '300ms',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },

            // ============================================
            // SPACING & SIZING
            // ============================================
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },

            // ============================================
            // Z-INDEX SCALE
            // ============================================
            zIndex: {
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
            },

            // ============================================
            // BACKDROP BLUR
            // ============================================
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Habilita el cambio manual de claro/oscuro
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores base de tu configuración
        indigo: {
          50: '#f5f7ff',
          600: '#4f46e5',
          700: '#4338ca',
        },
        slate: {
          50: '#f8fafc',
          900: '#0f172a',
        },
        // Añadimos ROSE y ORANGE para el modo oscuro Pro (como la imagen)
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      // --- ADICIONES PARA EL EFECTO PRO ---
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
      backgroundImage: {
        // Para crear ese efecto de profundidad en las tarjetas
        'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        // Sombra de neón suave para el plan destacado
        'neon-rose': '0 0 20px rgba(244, 63, 94, 0.2)',
      }
    },
  },
  plugins: [],
}
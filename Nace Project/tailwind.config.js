/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07080a',
        surface: '#09090d',
        'surface-2': '#0d0e12',
        line: '#24282f',
        'line-strong': '#3a3f48',
        'line-soft': '#2c3037',
        bone: '#e8e4da',
        mute: '#868c96',
        dim: '#6a707a',
        fire: '#FF5A1F',
        alert: '#FF3B30',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      maxWidth: {
        'chat-window': '420px',
      },
      borderRadius: {
        none: '0px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};

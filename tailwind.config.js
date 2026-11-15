/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './Nace Project/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07080a',
        panel: 'rgba(9,10,13,0.86)',
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
        data: '#00E5FF',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
}

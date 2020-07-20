// Theme definition for Tailwind Styles. 
// Only overrides the default colors and set up purging for un-used classes in production

module.exports = {

  theme: {
    colors: {
      ambient: {
        default: '#4F6576',
        dark: '#1E252C',
        light: '#7c8b98',
        lightest: '#cdd5de',
        darkest: '#0d1217',
      },
      primary: {
        default: '#e8cd86',
        light: '#f1e3be',
        dark: '#b79437',
      }
    }
  },
  variants: {},
  plugins: [],
    purge: [
        './src/popup/popup.html',
        './src/results/results.html',
        './src/results/results.js',
      ],
}

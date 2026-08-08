module.exports = {
  plugins: {
    // Tailwind 4 ships its PostCSS integration as a separate package, and handles
    // vendor prefixing itself so autoprefixer is no longer needed here.
    '@tailwindcss/postcss': {},
  },
}

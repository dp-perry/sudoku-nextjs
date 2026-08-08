const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // publicRuntimeConfig is not supported by the App Router. `env` is inlined at
  // build time, so the version still comes from package.json and only from there.
  env: {
    APP_VERSION: version,
  },
}

module.exports = nextConfig

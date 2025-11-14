/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Suppress webpack cache serialization warnings and autoprefixer warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/ag-grid-community/,
      },
      {
        message: /autoprefixer/,
      },
      {
        message: /No serializer registered for Warning/,
      },
      {
        message: /end value has mixed support/,
      },
    ];

    // Reduce infrastructure logging to suppress cache warnings
    if (!isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }

    return config;
  },
  // Suppress build warnings in console
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

module.exports = nextConfig


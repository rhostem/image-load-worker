/** @type {import("snowpack").SnowpackUserConfig } */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    [
      '@snowpack/plugin-webpack',
      {
        extendConfig: (config) => {
          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilefame: 'docs/bundleAnalyze.html',
              defaultSizes: 'parsed',
              openAnalyzer: false,
              generateStatsFile: true,
              statsFilename: 'docs/bundleAnalyze.json',
            }),
          );
          return config;
        },
      },
    ],
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    baseUrl: '/image-load-worker', // to use gh-pages
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    /* ... */
  },
};

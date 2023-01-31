exports.optimizationLayer = ({ isDev, vendorTest, vendorMinChunks }) => ({
    optimization: isDev
        ? {
              removeAvailableModules: false,
              removeEmptyChunks: false,
              splitChunks: false,
          }
        : {
              minimize: true,
              providedExports: true,
              usedExports: true,
              mergeDuplicateChunks: true,
              innerGraph: true,
              splitChunks: {
                  chunks: 'all',
                  maxInitialRequests: 4,
                  cacheGroups: {
                      uiKit: {
                          test: /@yandex-levitan/,
                          name: 'uiKit',
                          priority: 101,
                      },
                      commons: {
                          name: 'vendor',
                          test: vendorTest,
                          minChunks: vendorMinChunks,
                          chunks: 'all',
                          enforce: true,
                          priority: 100,
                      },
                  },
              },
          },
});

const WorkboxPlugin = require('workbox-webpack-plugin');

exports.swLayer = ({ isDev }) => ({
    plugins: [
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            cleanupOutdatedCaches: true,
            maximumFileSizeToCacheInBytes: isDev ? 50000000 : 1500000,
            // Define runtime caching rules.
            runtimeCaching: [
                {
                    urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,

                    handler: 'CacheFirst',

                    options: {
                        // Use a custom cache name.
                        cacheName: 'images',

                        expiration: {
                            maxEntries: 100,
                            maxAgeSeconds: 60 * 60 * 24 * 365,
                        },
                    },
                },
            ],
        }),
    ],
});

exports.devServerLayer = (config) => ({
    devServer: {
        hot: config.hmr,
        host: 'localhost',
        port: '8080',
        allowedHosts: 'all',
        static: {
            publicPath: config.publicPath,
            directory: config.distPath,
        },
        historyApiFallback: {
            rewrites: [{ from: /^\/ui\//, to: '/ui/index.html' }],
        },
        client: {
            progress: true,
            overlay: {
                errors: true,
                warnings: false,
            },
            webSocketTransport: 'ws',
            reconnect: 5,
        },
        proxy: require('./proxy'),
        open: ['/ui'], // Here
    },
});

module.exports = [
    {
        context: [
            '/receiving',
            '/autostart',
            '/api',
            '/infor',
            '/picking',
            '/packing2',
            '/dropping',
            '/shipping',
            '/ui/resources',
            '/transportation',
            '/replenishment',
            '/shippingsorter',
            '/consolidation',
            '/info',
            '/reporter',
            '/scheduler2',
            '/clean-cookie',
            '/core',
            '/ordermanagement',
            '/inventorization',
            '/auth',
            '/placement',
            '/balancers',
            '/yt-util',
            '/constraints',
        ],
        changeOrigin: true,
        secure: false,
        target: process.env.API_HOST,
    },
    {
        context: ['/employee-performance'],
        changeOrigin: true,
        secure: false,
        target: 'http://vla1-5743-vla-market-test-time-b93-12661.gencfg-c.yandex.net:12661',
    },
    {
        context: [
            '/employee-status-plan',
            '/employee-status-plan-details',
            '/employee-status',
            '/putawayzone',
            '/itrn',
            '/notification',
        ],
        changeOrigin: true,
        secure: false,
        target: 'http://time-tracking-system.pre.vs.market.yandex.net',
    },
    process.env.API_HOST && {
        context: ['/packing2/packing-stomp', '/reporter/reporter-stomp', '/taskrouter'],
        target: process.env.API_HOST.replace(/^http/, 'ws'),
        changeOrigin: true,
        secure: false,
        ws: true,
    },
].filter(Boolean);
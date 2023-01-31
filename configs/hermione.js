require('./babel/register');

const { GRID_URL = 'http://localhost:4444/wd/hub', BASE_URL = 'http://localhost:8080/ui/inbound' } = process.env;

module.exports = {
    gridUrl: GRID_URL,
    baseUrl: BASE_URL,

    sessionsPerBrowser: 5,
    testsPerSession: 5,
    retry: 0,

    windowSize: {
        width: 1024,
        height: 768,
    },

    sets: {
        desktop: {
            files: '**/hermione/**/*.hermione.ts',
        },
    },

    system: {
        fileExtensions: ['.ts'],
    },

    browsers: {
        chrome: {
            desiredCapabilities: {
                browserName: 'chrome', // this browser should be installed on your OS
                version: '73.0',
                chromeOptions: {
                    args: ['--headless'],
                },
            },
        },
    },

    plugins: {
        'json-reporter/hermione': {
            enabled: true,
            path: 'hermione-report/result.json',
        },
        'html-reporter/hermione': {
            enabled: true,
            path: 'hermione-report',
            defaultView: 'all',
        },
    },
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectPreload = require('@principalstudio/html-webpack-inject-preload');
const VersionFile = require('webpack-version-file-plugin');
const path = require('path');

const { hash: commitHash, branch: branchName } = JSON.parse(require('child_process').execSync('arc info --json').toString())
const { effective_login: userName } = JSON.parse(require('child_process').execSync('arc user-info --json').toString())

exports.staticLayer = (config) => ({
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            minify: false,
            favicon: 'src/assets/images/favicon.png',
        }),
        new HtmlWebpackInjectPreload({
            files: [
                {
                    match: /.*\.woff2$/,
                    attributes: { as: 'font', type: 'font/woff2', crossorigin: true },
                },
            ],
        }),
        new VersionFile({
            packageFile: path.join(config.repoRoot, 'package.json'),
            templateString: '<%= [userName, branchName, "(", currentTime.toLocaleString("ru"), ")"].join(" ") -%>',
            outputFile: path.join(config.distPath, 'version'),
            branchName: branchName !== 'HEAD' ? branchName : commitHash,
            userName,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
});

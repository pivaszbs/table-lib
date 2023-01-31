/**
 *   Краткий отчёт об ошибках unit-test.
 */
/* eslint-disable no-undef */

const fs = require('fs');
const path = require('path');

const entities = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
]);
function html(t) {
    // eslint-disable-next-line no-control-regex
    return String(t).replace(/\x1B[[]\d+m|[&<]/g, c => entities.get(c) || '');
}

function report(results, rootDir = '.') {
    const branch = html(process.env.CURRENT_GIT_BRANCH || '');
    const header = `<!doctype html>
    <meta charset="utf-8">
    <title>Jest ${branch}</title>
    <p><code>${branch}</code></p>`;

    let body = `<h1>PASSED: ${results.numPassedTests} / ${results.numTotalTests}</h1>`;
    if (results.numFailedTests + results.numFailedTestSuites > 0) {
        body = `<h1>FAILED: ${results.numFailedTests} / ${results.numTotalTests}</h1>`;
        for (const suite of results.testResults) {
            const {failureMessage} = suite;
            if (failureMessage) {
                const testFile = path.relative(rootDir, suite.testFilePath);
                body += `<h3><code>${html(testFile)}</code></h3>
                <pre style="white-space: pre-wrap">${html(failureMessage)}</pre>`;
            }
        }
    }

    let trailer = '<hr>';
    const {GSID} = process.env; // HACK sandbox task log
    if (GSID) {
        const [, task] = /MARKET_FRONT_CI:(\d{9,})\b/.exec(GSID) || [];
        if (task) {
            trailer = `<hr>
            <p><a href="/task/${task}/log1/ci_check_command.out.log">ci_check_command.out.log</a></p>
            <pre id="log" data-task="${task}" style="white-space: pre-wrap"></pre>
            <script>(${injection})()</script>`;
        }
    }

    return [header, body, trailer].join('\n');
}

async function injection() {
    const log = document.getElementById('log');
    const task = log.dataset.task;
    const text = await (await fetch(`/task/${task}/log1/ci_check_command.out.log`)).text();
    const cut = text.replace(/^[^]*? npm test\b[^\n]*|\nRan all test suites.\n[^]*?$/g, '');
    log.textContent = cut.replace(/(\nPASS [^\n]+)+(\nPASS [^\n]+)/g, '$2');
}

class PartnerNodeUnitReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onRunComplete(contexts, results) {
        const {filename, dumpResults = false} = this._options;
        const dirPath = path.dirname(filename);
        const {rootDir} = this._globalConfig;

        if (!filename) return;
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, {recursive: true});

        fs.writeFileSync(filename, report(results, rootDir), 'utf-8');
        if (dumpResults) {
            fs.writeFileSync(`${filename}.json`, JSON.stringify(results, null, 1), 'utf-8');
        }
        // eslint-disable-next-line no-console
        console.log('PartnerNode report: ', filename);
    }
}

module.exports = PartnerNodeUnitReporter;

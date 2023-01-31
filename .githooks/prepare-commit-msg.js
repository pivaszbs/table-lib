#!/usr/bin/env node

const fs = require('fs');
const childProcessExec = require('child_process').exec;
const util = require('util');
const exec = util.promisify(childProcessExec);
const { isValidCommitMessage, showError } = require('./helpers');
const { TICKET_PATTERN } = require('./constants');

const PATH_TO_COMMIT_MESSAGE = process.argv[2];

/**
 * Автоматически добавляет в commit-message информацию о тикете, если название ветки в определённом формате.
 *
 * Формат именования ветки: "<type>/<queue>-<task_number>-<description>".
 * Например, feature/MARKETFRONT-123-description.
 */
executeHook();

async function executeHook() {
    // Получаем первоначальный `commit message`.
    const message = fs.readFileSync(PATH_TO_COMMIT_MESSAGE, 'utf8').trim();

    // Если он корректный – ничего не делаем.
    if (isValidCommitMessage(message)) {
        return process.exit(0);
    }

    // Иначе пытаемся извлечь номер тикета из названия ветки.
    const ticketNameFromBranch = await extractTicketFromCurrentBranch();

    // Если ветку назвали не формату – ничего не делаем.
    if (!ticketNameFromBranch) {
        process.exit(0);
    }

    // Иначе добавляем извлечённый номер тикета в начало `commit message`.
    const enhancedCommitMessage = `${ticketNameFromBranch}: ${message}`;

    fs.writeFileSync(PATH_TO_COMMIT_MESSAGE, enhancedCommitMessage);

    process.exit(0);
}

async function extractTicketFromCurrentBranch() {
    let branchName;

    try {
        branchName = await exec('git symbolic-ref HEAD');
    } catch (error) {
        if (process.env.DEBUG) {
            showError(error);
        }
    }

    if (!branchName || !branchName.stdout) {
        return undefined;
    }

    branchName = branchName.stdout.trim();

    const match = branchName.match(new RegExp(`(.*\/)?(${TICKET_PATTERN}).*`));

    if (!match) {
        return undefined;
    }

    return match[match.length - 1];
}

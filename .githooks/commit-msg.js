#!/usr/bin/env node

const fs = require('fs');
const { showError, isValidCommitMessage } = require('./helpers');

const PATH_TO_COMMIT_MESSAGE = process.argv[2];

/**
 * Валидирует commit message на наличие номера тикета.
 */
executeHook();

async function executeHook() {
    const message = fs.readFileSync(PATH_TO_COMMIT_MESSAGE, 'utf8').trim();

    await validateCommitMessage(message);

    process.exit(0);
}

async function validateCommitMessage(message) {
    if (!isValidCommitMessage(message)) {
        showError(
            '\nОшибка! Commit message должен содержать номер тикета.',
            `\nНапример, "MARKETFRONT-123: Добавляет поясняющий комментарий к виджету".`,
            `\n\nУзнать как можно не писать номер тикета в каждом коммите – https://nda.ya.ru/3Vnc2n\n`
        );

        process.exit(1);
    }
}

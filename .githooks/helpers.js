'use strict';

const { TICKET_PATTERN } = require('./constants');

const RED_COLOR = '\x1b[31m';
const RESET_COLOR = '\x1b[0m';

const VALID_COMMIT_MESSAGE = new RegExp(`.*(${TICKET_PATTERN}).*`);
const MERGE_COMMIT_PART_REGEXP = /Merge/i;

exports.showError = (...message) => console.log(RED_COLOR, ...message, RESET_COLOR);

exports.VALID_COMMIT_MESSAGE = VALID_COMMIT_MESSAGE;

exports.isValidCommitMessage = (message) =>
    VALID_COMMIT_MESSAGE.test(message) || MERGE_COMMIT_PART_REGEXP.test(message);

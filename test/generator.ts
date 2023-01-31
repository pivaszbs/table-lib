import {
    arrayGeneratorFabric,
    generateBoolean,
    generateNumber,
    generateOneOfList, generateRandomWord,
} from '../src/TableDataPage/utils/generators';
import { ROLE_PREFIX, RolesMapper } from './roles';

export type Nullable<T> = T | null;

export type User = {
    active: boolean;
    fullName: string;
    login: string;
    externLogin: string;
    emailAddress: string;
    locale: string;
    fullyQualifiedId: string;
    roleNames: Nullable<string[]>;
    ssoUserName: string;
    tenant: string;
    userId: string;
};

export const roles = Object.keys(RolesMapper).map((role) => role.replace(ROLE_PREFIX, ''));

const rolesGenerator = arrayGeneratorFabric(generateOneOfList(roles));

export const generateUser = (): User => {
    const a = generateNumber();

    return {
        active: generateBoolean(),
        fullName: `AD${a}`,
        login: `AD${a}`,
        externLogin: `AD${a}`,
        emailAddress: `ad${a}@yandex-team.com`,
        locale: generateBoolean() ? 'en' : 'ru',
        fullyQualifiedId: generateRandomWord(),
        ssoUserName: generateRandomWord(),
        tenant: generateRandomWord(),
        userId: `AD${a}`,
        roleNames: rolesGenerator(),
    };
};

export const generateUserList = arrayGeneratorFabric(generateUser);

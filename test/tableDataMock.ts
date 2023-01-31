import { generateUserList, User } from "./generator";
import { Content, PagerTableDataContent } from "../src";

export const contentItems: User[] = generateUserList();

export const TableDataMock: PagerTableDataContent<User> = {
    total: 10,
    offset: 0,
    limit: 10,
    content: contentItems,
};

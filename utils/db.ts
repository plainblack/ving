
export * from './db/_Base';
import Users from './db/Users';
import APIKeys from './db/APIKeys';

export const db = {
    Users,
    APIKeys
};

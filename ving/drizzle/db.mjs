import mysql from 'mysql2/promise';
import { drizzle } from '#ving/drizzle/orm.mjs';

const dbConfig = new URL(process.env.DATABASE || '');

let db = undefined;

export const useDB = () => {
    if (db) {
        return db
    }
    const poolConnection = mysql.createPool({
        host: dbConfig.hostname,
        port: parseInt(dbConfig.port),
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.pathname.slice(1),
    })
    return db = drizzle(poolConnection);
}

db = useDB();
import mysql from 'mysql2/promise';
import { drizzle } from '#ving/drizzle/orm.mjs';

const dbConfig = new URL(process.env.VING_MYSQL || '');

let db = undefined;

/**
 * Connects to the MySQL database.
 * 
 * @returns a `mysql2` connection pool
 */
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
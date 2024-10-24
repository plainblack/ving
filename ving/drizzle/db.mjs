import mysql from 'mysql2/promise';
import { drizzle } from '#ving/drizzle/orm.mjs';
import { log } from '#ving/log.mjs';
import dotenv from 'dotenv';

dotenv.config({ debug: true });
const dbUrl = process.env.VING_MYSQL || '';
if (!dbUrl) {
    throw new Error('VING_MYSQL environment variable is not set');
}
const dbConfig = new URL(dbUrl);

class VingDrizzleLogger {
    logQuery(query, params) {
        log('drizzle').debug(JSON.stringify({ query, params }))
    }
}

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
    });

    const options = {};
    if (dbConfig.searchParams.get('log') === 'yes') {
        options.logger = new VingDrizzleLogger();
    }
    return db = drizzle(poolConnection, options);
}

db = useDB();
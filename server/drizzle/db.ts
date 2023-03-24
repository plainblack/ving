import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2'; // https://github.com/drizzle-team/drizzle-orm/issues/163

// TODO: Needed for tests/cli
import * as dotenv from 'dotenv';
dotenv.config();
const dbConfig = new URL(process.env.DATABASE || '');

export let db: any = undefined;

export const useDB = () => {
    if (db) {
        return db
    }
    // Create the connection
    const poolConnection = mysql.createPool({
        //  type: dbConfig.protocol.slice(0, -1) as "mysql" | "postgres",
        host: dbConfig.hostname,
        port: parseInt(dbConfig.port),
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.pathname.slice(1),
    })
    db = drizzle(poolConnection);
    return db
}

db = useDB();
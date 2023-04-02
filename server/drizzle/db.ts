import mysql from 'mysql2/promise';
import { drizzle } from './orm';

// TODO: Needed for tests/cli
import * as dotenv from 'dotenv';
dotenv.config();
const dbConfig = new URL(process.env.DATABASE || '');

let db: any = undefined;

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
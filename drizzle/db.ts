import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();
const dbConfig = new URL(process.env.DRIZZLE_DATABASE || '');


// create the connection
export const poolConnection = mysql.createPool({
    //  type: dbConfig.protocol.slice(0, -1) as "mysql" | "postgres",
    host: dbConfig.hostname,
    port: parseInt(dbConfig.port),
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.pathname.slice(1),
});

export const db = drizzle(poolConnection);
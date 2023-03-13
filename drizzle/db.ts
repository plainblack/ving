import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// create the connection
export const poolConnection = mysql.createPool({
    host: 'localhost',
    user: 'ving',
    password: 'vingPass',
    database: 'drizzle',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
});

export const db = drizzle(poolConnection);
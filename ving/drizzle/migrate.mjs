
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();
const dbConfig = new URL(process.env.DATABASE || '');

export async function runMigrations() {
    const con = await mysql.createConnection({
        host: dbConfig.hostname,
        port: parseInt(dbConfig.port),
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.pathname.slice(1),
        multipleStatements: true,
    });

    const db = drizzle(con);
    await migrate(db, { migrationsFolder: 'ving/drizzle/migrations' });
    await con.end();
    console.log('Migration complete!');
}
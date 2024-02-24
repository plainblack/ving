
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
const dbConfig = new URL(process.env.VING_MYSQL || '');
import ving from '#ving/index.mjs';

/**
 * Runs all available drizzle migrations.
 */
export async function runMigrations() {
    ving.log('migration').info('Establishing database connection.');
    const con = await mysql.createConnection({
        host: dbConfig.hostname,
        port: parseInt(dbConfig.port),
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.pathname.slice(1),
        multipleStatements: true,
    });

    const db = drizzle(con);
    ving.log('migration').info('Starting migrations.');
    await migrate(db, { migrationsFolder: 'ving/drizzle/migrations' });
    ving.log('migration').info('Disconnecting from database.');
    await con.end();
    ving.log('migration').info('Migration complete!');
}
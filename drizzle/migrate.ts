import { db, poolConnection } from './db';
import { migrate } from 'drizzle-orm/mysql2/migrator';

async function main() {
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
}
main().then(() => {
    poolConnection.end();
})

import { defineCommand, showUsage } from "citty";
import { exec } from "child_process";
import { runMigrations } from '#ving/drizzle/migrate.mjs';
import { makeTableFile } from '#ving/generator/drizzletable.mjs';
import { vingSchemas } from '#ving/schema/map.mjs';
import ving from '#ving/index.mjs';
import crypto from "node:crypto";
import fs from "node:fs";

export default defineCommand({
    meta: {
        name: "drizzle",
        description: "Manage Drizzle ORM migrations and code generation",
    },
    cleanup: ving.close,
    args: {
        tables: {
            type: "boolean",
            description: "Generate drizzle table files from ving schemas",
            alias: "t",
        },
        prepare: {
            type: "boolean",
            description: "Generate migration files from table changes",
            alias: "p",
        },
        up: {
            type: "boolean",
            description: "Run migrations",
            alias: "u",
        },
        status: {
            type: "boolean",
            description: "Report the status of migrations available vs what has been applied",
            alias: "s",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.tables) {
                for (const schema of vingSchemas) {
                    await makeTableFile({ schema });
                }
            }
            else if (args.status) {
                const migrationFolderTo = './ving/drizzle/migrations';
                const migrations = [];
                const journalAsString = fs.readFileSync(`${migrationFolderTo}/meta/_journal.json`).toString();
                const journal = JSON.parse(journalAsString);
                for (const journalEntry of journal.entries) {
                    const query = fs.readFileSync(`${migrationFolderTo}/${journalEntry.tag}.sql`).toString();
                    migrations.push({
                        tag: journalEntry.tag,
                        hash: crypto.createHash("sha256").update(query).digest("hex")
                    });
                }
                ving.log('cli').info(`Last Migration Available: ${migrations[migrations.length - 1].tag}  [${migrations[migrations.length - 1].hash}]`);
                try {
                    const [rows] = await ving.useDB().session.client.pool.promise().query('SELECT * from __drizzle_migrations order by created_at desc limit 1');
                    const applied = migrations.find(m => m.hash == rows[0].hash);
                    if (applied) {
                        ving.log('cli').info(`Last Migration Applied:   ${applied.tag}  [${applied.hash}]`);
                    }
                    else {
                        ving.log('cli').error(`Last Migration Applied: None`);
                    }
                }
                catch {
                    ving.log('cli').error(`Last Migration Applied: Database not initialized`);
                }

            }
            else if (args.up) {
                runMigrations();
            }
            else if (args.prepare) {
                exec("npx drizzle-kit generate:mysql --out ./ving/drizzle/migrations --schema ving/drizzle/schema", (error, stdout, stderr) => {
                    if (error) {
                        ving.log('cli').error(error.message);
                        return;
                    }
                    if (stderr) {
                        ving.log('cli').error(stderr);
                        return;
                    }
                    ving.log('cli').info(stdout);
                });
            }
            else {
                await showUsage(cmd, { meta: { name: 'ving.mjs' } });
            }
        }
        catch (e) {
            ving.log('cli').error(e.message);
        }
    },
});
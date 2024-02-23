import { defineCommand } from "citty";
import { exec } from "child_process";
import { runMigrations } from '#ving/drizzle/migrate.mjs';
import { makeTableFile } from '#ving/generator/drizzletable.mjs';
import { vingSchemas } from '#ving/schema/map.mjs';
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "Drizzle ORM",
        description: "Manage Drizzle migrations and code generation",
    },
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
    },
    async run({ args }) {
        if (args.tables) {
            for (const schema of vingSchemas) {
                await makeTableFile({ schema });
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
        await ving.close();
    },
});
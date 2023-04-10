import { defineCommand } from "citty";
import { exec } from "child_process";
import { runMigrations } from '../server/drizzle/migrate';

export default defineCommand({
    meta: {
        name: "Drizzle ORM",
        description: "Manage Drizzle migrations",
    },
    args: {
        prepare: {
            type: "boolean",
            description: "Generate a migration",
        },
        up: {
            type: "boolean",
            description: "Run migrations",
        },
    },
    async run({ args }) {
        if (args.up) {
            runMigrations();
        }
        else if (args.prepare) {
            exec("npx drizzle-kit generate:mysql --out ./server/drizzle/migrations --schema server/drizzle/schema", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(stdout);
            });
        }
    },
});
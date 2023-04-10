import { defineCommand } from "citty";
import { makeTableFile } from '../server/vingschema/gentable'
import { vingSchemas } from '../server/vingschema/index';

export default defineCommand({
    meta: {
        name: "Ving Schema",
        description: "Manage Ving Schemas",
    },
    args: {
        makeTables: {
            type: "boolean",
            description: "Generate table files",
        },
    },
    async run({ args }) {
        if (args.makeTables) {
            for (const schema of vingSchemas) {
                makeTableFile(schema);
            }
        }
    },
});
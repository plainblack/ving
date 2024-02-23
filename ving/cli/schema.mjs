import { defineCommand } from "citty";
import { generateSchema } from '#ving/generator/vingschema.mjs';
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "Ving Schema",
        description: "Ving Schema code generation",
    },
    args: {
        new: {
            type: "string",
            description: "Generate a new schema skeleton file",
            valueHint: "name",
            alias: "n",
        },
    },
    async run({ args }) {
        if (args.new) {
            await generateSchema({ name: args.new });
        }
        await ving.close();
    },
});
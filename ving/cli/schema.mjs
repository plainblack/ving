import { defineCommand, showUsage } from "citty";
import { generateSchema } from '#ving/generator/vingschema.mjs';
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "schema",
        description: "Ving Schema code generation",
    },
    cleanup: ving.close,
    args: {
        new: {
            type: "string",
            description: "Generate a new schema skeleton file",
            valueHint: "name",
            alias: "n",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.new) {
                await generateSchema({ name: args.new });
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
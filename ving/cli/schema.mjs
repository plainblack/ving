import { defineCommand, showUsage } from "citty";
import { generateSchema } from '#ving/generator/vingschema.mjs';
import ving from '#ving/index.mjs';
import { validateSchema, validateAllSchemas } from '#ving/schema/validator.mjs';

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
        validate: {
            type: "string",
            description: "Validate the named schema",
            valueHint: "name",
            alias: "v",
        },
        validateAll: {
            type: "boolean",
            description: "Validate all schemas",
            default: false,
            alias: "V",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.new) {
                await generateSchema({ name: args.new });
            }
            else if (args.validate) {
                validateSchema(args.validate);
                ving.log('cli').info(`Schema ${args.validate} validated successfully.`);
            }
            else if (args.validateAll) {
                validateAllSchemas();
                ving.log('cli').info('All schemas validated successfully.');
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
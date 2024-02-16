import { defineCommand } from "citty";
import { generateRecord } from '../server/vingrecord/genskeleton.mjs';
import { generateRest } from '../server/vingrecord/genrest.mjs';
import { generateWeb } from '../server/vingrecord/genpages.mjs';
import { findVingSchema } from '../server/vingrecord/VingRecord.mjs';
import { vingSchemas } from '../server/vingschema/index.mjs';

export default defineCommand({
    meta: {
        name: "Ving Record",
        description: "Ving Record code generation",
    },
    args: {
        new: {
            type: "string",
            description: "Generate a new Ving Record file",
            valueHint: "ClassName",
            alias: "n",
        },
        missingRest: {
            type: "boolean",
            description: "Generate missing REST APIs for all records",
            alias: "R",
        },
        rest: {
            type: "string",
            description: "Generate REST APIs for this record",
            valueHint: "ClassName",
            alias: "r",
        },
        web: {
            type: "string",
            description: "Generate Web Pages for this record",
            valueHint: "ClassName",
            alias: "w",
        },
    },
    async run({ args }) {
        if (args.new) {
            await generateRecord({ name: args.new, schema: findVingSchema(args.new, 'kind') });
        }
        else if (args.rest) {
            await generateRest({ name: args.rest, schema: findVingSchema(args.rest, 'kind') });
        }
        else if (args.web) {
            await generateWeb({ name: args.web, schema: findVingSchema(args.web, 'kind') });
        }
        else if (args.missingRest) {
            console.log('got here')
            for (const schema of vingSchemas) {
                console.log(schema.kind)
                await generateRest({ name: schema.kind, schema, skipExisting: true });
            }
        }
    },
});
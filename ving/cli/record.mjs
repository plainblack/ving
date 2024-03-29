import { defineCommand } from "citty";
import { generateRecord } from '#ving/generator/vingrecord.mjs';
import { generateRest } from '#ving/generator/nuxtapis.mjs';
import { generateWeb } from '#ving/generator/nuxtpages.mjs';
import { vingSchemas, findVingSchema } from '#ving/schema/map.mjs';
import ving from '#ving/index.mjs';

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
            for (const schema of vingSchemas) {
                await generateRest({ name: schema.kind, schema, skipExisting: true });
            }
        }
        await ving.close();
    },
});
import { defineCommand } from "citty";
import { generateRecord } from '../server/vingrecord/genskeleton';
import { generateApis } from '../server/vingrecord/genrest';
import { generatePages } from '../server/vingrecord/genpages';
import { getContext } from '@feathershq/pinion';
import { findVingSchema } from '../server/vingrecord/VingRecord';

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
        rest: {
            type: "string",
            description: "Generate REST APIs for this record",
            valueHint: "ClassName",
            alias: "r",
        },
        pages: {
            type: "string",
            description: "Generate Web Pages for this record",
            valueHint: "ClassName",
            alias: "p",
        },
    },
    async run({ args }) {
        if (args.new) {
            await generateRecord({ ...getContext({}), name: args.new, schema: findVingSchema(args.new, 'kind') });
        }
        else if (args.rest) {
            await generateApis({ ...getContext({}), name: args.rest, schema: findVingSchema(args.rest, 'kind') });
        }
        else if (args.pages) {
            await generatePages({ ...getContext({}), name: args.pages, schema: findVingSchema(args.pages, 'kind') });
        }
    },
});
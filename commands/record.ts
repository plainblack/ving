import { defineCommand } from "citty";
import { generateRecord } from '../server/vingrecord/genskeleton';
import { generateApis } from '../server/vingrecord/genapis';
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
        apis: {
            type: "string",
            description: "Generate APIs for this record",
            valueHint: "ClassName",
            alias: "a",
        },
        pages: {
            type: "string",
            description: "Generate Pages for this record",
            valueHint: "ClassName",
            alias: "p",
        },
    },
    async run({ args }) {
        if (args.new) {
            await generateRecord({ ...getContext({}), name: args.new, schema: findVingSchema(args.new, 'kind') });
        }
        else if (args.apis) {
            await generateApis({ ...getContext({}), name: args.apis, schema: findVingSchema(args.apis, 'kind') });
        }
        else if (args.pages) {
            await generatePages({ ...getContext({}), name: args.pages, schema: findVingSchema(args.pages, 'kind') });
        }
    },
});
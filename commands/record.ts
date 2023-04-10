import { defineCommand } from "citty";
import { generateRecord } from '../server/vingrecord/genskeleton';
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
        },
    },
    async run({ args }) {
        if (args.new) {
            await generateRecord({ ...getContext({}), name: args.new, schema: findVingSchema(args.new, 'kind') });
        }
    },
});
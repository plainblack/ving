import { defineCommand, showUsage } from "citty";
import ving from '#ving/index.mjs';
import { stringifyId, parseId } from '#ving/utils/int2str.mjs';

export default defineCommand({
    meta: {
        name: "id",
        description: "Convert an ID between integer and string.",
    },
    cleanup: ving.close,
    args: {
        makeString: {
            type: "number",
            description: "Encrypt integer into string",
            alias: "s",
        },
        makeInteger: {
            type: "string",
            description: "Decrypt string into integer",
            alias: "i",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.makeString) {
                console.log(`${args.makeString} becomes ${stringifyId(args.makeString)}`);
            }
            else if (args.makeInteger) {
                console.log(`${args.makeInteger} back to ${parseId(args.makeInteger)}`);
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
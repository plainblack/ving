import { defineCommand, showUsage } from "citty";
import crypto from 'crypto';
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "token",
        description: "Sometimes you need to generate a random token",
    },
    cleanup: ving.close,
    args: {
        new: {
            type: "boolean",
            description: "Generate a new token",
            alias: "n",
        },
        bytes: {
            type: "string",
            description: "How many bytes to generate, default 64",
            default: "64",
            alias: "b",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.new) {
                console.log(crypto.randomBytes(Number(args.bytes)).toString('hex'))
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
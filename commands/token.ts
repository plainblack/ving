import { defineCommand } from "citty";
import crypto from 'crypto';

export default defineCommand({
    meta: {
        name: "Token Generator",
        description: "Sometimes you need to generate a random token",
    },
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
    async run({ args }) {
        if (args.new) {
            console.log(crypto.randomBytes(Number(args.bytes)).toString('hex'))
        }
    },
});
import { defineCommand, showUsage } from "citty";
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "cache",
        description: "CRUD cache entries",
    },
    cleanup: ving.close,
    args: {
        clear: {
            type: "boolean",
            description: "Delete everything in the cache",
            alias: "c",
        },
        get: {
            type: "string",
            valueHint: "name",
            description: "Fetch a cache entry",
            alias: "g",
        },
        delete: {
            type: "string",
            valueHint: "name",
            description: "Remove a cache entry",
            alias: "d",
        },
        set: {
            type: "string",
            valueHint: "name",
            description: "Set a cache entry",
            alias: "s",
        },
        value: {
            type: "string",
            valueHint: "string|json",
            description: "The value of the entry to set",
            alias: "v",
        },
        ttl: {
            type: "string",
            description: "Timeout in milliseconds for the cache entry to live",
            valueHint: 'ms',
            default: (1000 * 60 * 60 * 24).toString(),
            alias: "t",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.clear) {
                await ving.useCache().clear();
                ving.log('cli').info('Cache cleared');
            }
            else if (args.get) {
                const value = await ving.useCache().get(args.get);
                ving.log('cli').info(`Value of ${args.get} is ${JSON.stringify(value)}`);
            }
            else if (args.delete) {
                await ving.useCache().delete(args.delete);
                ving.log('cli').info(`${args.delete} deleted`);
            }
            else if (args.set) {
                await ving.useCache().set(args.set, args.value, Number(args.ttl));
                ving.log('cli').info(`${args.set} set to ${args.value} for ${args.ttl}ms`);
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
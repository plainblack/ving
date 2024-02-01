import { defineCommand } from "citty";
import { useCache } from '../server/cache.mjs'

export default defineCommand({
    meta: {
        name: "Cache",
        description: "CRUD cache entries",
    },
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
    async run({ args }) {
        const cache = useCache();
        if (args.clear) {
            await cache.clear();
            console.log('Cache cleared');
        }
        if (args.get) {
            const value = await cache.get(args.get);
            console.log(`Value of ${args.get} is: ${value}`);
        }
        if (args.delete) {
            await cache.delete(args.delete);
            console.log(`${args.delete} deleted`);
        }
        if (args.set) {
            await cache.set(args.set, args.value, Number(args.ttl));
            console.log(`${args.set} set to ${args.value} for ${args.ttl}ms`);
        }
        await cache.disconnect();
    },
});
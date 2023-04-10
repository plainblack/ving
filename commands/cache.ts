import { defineCommand } from "citty";
import { useCache } from '../server/cache'

export default defineCommand({
    meta: {
        name: "Cache",
        description: "CRUD cache entries",
    },
    args: {
        clear: {
            type: "boolean",
            description: "Delete everything in the cache",
        },
        get: {
            type: "string",
            description: "Fetch a cache entry",
        },
        delete: {
            type: "string",
            description: "Remove a cache entry",
        },
        set: {
            type: "string",
            description: "Set a cache entry",
        },
        value: {
            type: "string",
            description: "The value of the entry to set",
        },
        ttl: {
            type: "string",
            description: "Timeout in milliseconds for the cache entry to live",
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
    },
});
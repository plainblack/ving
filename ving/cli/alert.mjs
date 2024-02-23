import { defineCommand } from "citty";
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "System Wide Alert",
        description: "Manage system wide alerts from the command line",
    },
    args: {
        message: {
            type: "string",
            description: "Set a message",
            valueHint: "'Hi there'",
            alias: "m",
        },
        severity: {
            type: "string",
            description: "Set a severity level which changes the color",
            default: 'info',
            valueHint: "info|error|success|warn",
            alias: "s",
        },
        ttl: {
            type: "number",
            description: "How many hours should the message last",
            default: 1,
            valueHint: "24",
            alias: "t",
        },
        delete: {
            type: "boolean",
            description: "Delete the current alert",
            default: false,
            alias: "d",
        },
        get: {
            type: "boolean",
            description: "Get the current alert and display it",
            default: false,
            alias: "g",
        },
    },
    async run({ args }) {
        if (args.message) {
            await ving.cache.set('system-wide-alert', {
                message: args.message,
                severity: args.severity,
                ttl: 60 * 60 * 1000 * args.ttl,
            }, 60 * 60 * 1000 * args.ttl);
        }
        if (args.get) {
            ving.log('cli').info(await ving.cache.get('system-wide-alert'));
        }
        if (args.delete) {
            await ving.cache.delete('system-wide-alert');
        }
        await ving.close();
    },
});
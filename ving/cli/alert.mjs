import { defineCommand, showUsage } from "citty";
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "alert",
        description: "Manage system wide alerts from the command line",
    },
    cleanup: ving.close,
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
    async run({ args, cmd }) {
        try {
            if (args.message) {
                const ttl = 60 * 60 * 1000 * args.ttl;
                await ving.useCache().set('system-wide-alert', {
                    message: args.message,
                    severity: args.severity,
                    ttl,
                }, ttl);
                ving.log('cli').info(`Message set: "${args.message}"`);
            }
            else if (args.get) {
                ving.log('cli').info(await ving.useCache().get('system-wide-alert'));
            }
            else if (args.delete) {
                await ving.useCache().delete('system-wide-alert');
                ving.log('cli').info('Message deleted.');
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
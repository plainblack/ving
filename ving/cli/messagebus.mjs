import { defineCommand, showUsage } from "citty";
import { publishUserToast } from '#ving/messagebus.mjs';
import { eq } from '#ving/drizzle/orm.mjs';
import ving from '#ving/index.mjs';
import { useKind } from '#ving/record/utils.mjs';

export default defineCommand({
    meta: {
        name: "messagebus",
        description: "Useful for testing the message bus",
    },
    cleanup: ving.close,
    args: {
        user: {
            type: "string",
            description: "Who to send it to",
            valueHint: "username",
            alias: "u",
            required: true,
        },
        message: {
            type: "string",
            description: "Send a message",
            alias: "m",
            default: "1 ping only",
        },
        severity: {
            type: "string",
            description: "Choose `info` or `warning` or `success` or `danger`",
            default: "info",
            alias: "s",
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.user) {
                const users = await useKind('User');
                const user = await users.findOne(eq(users.table.username, args.user));
                if (user) {
                    const severity = args.severity == 'info' || 'danger' || 'success' || 'warning' ? args.type : 'info';
                    const pub = await publishUserToast(user.get('id'), args.message, severity);
                    await pub.quit();
                }
                else {
                    ving.log('cli').error('user not found');
                }
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
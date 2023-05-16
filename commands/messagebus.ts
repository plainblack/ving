import { defineCommand } from "citty";
import { publishUserNotify } from '../server/messagebus';
import { useUsers } from '../server/vingrecord/records/User'
import { eq } from '../server/drizzle/orm';

export default defineCommand({
    meta: {
        name: "Message Bus",
        description: "Useful for testing the message bus",
    },
    args: {
        user: {
            type: "string",
            description: "Who to send it to",
            valueHint: "username",
            alias: "u",
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
    async run({ args }) {
        if (args.user) {
            const Users = useUsers();
            const user = await Users.findOne(eq(Users.table.username, args.user));
            if (user) {
                const severity = args.severity == 'info' || 'danger' || 'success' || 'warning' ? args.type : 'info';
                const pub = await publishUserNotify(user.get('id'), args.message, severity as 'info' | 'danger' | 'success' | 'warning');
                console.log('1 ping only');
                await pub.quit();
            }
            else {
                console.log('user not found');
            }
        }
        else {
            console.log('user is required');
        }
    },
});
import { defineCommand, showUsage } from "citty";
import { like, or, eq } from '#ving/drizzle/orm.mjs';
import ving from '#ving/index.mjs';
import { useKind } from '#ving/record/utils.mjs';

export default defineCommand({
    meta: {
        name: "user",
        description: "Basic CRUD for users, use web UI for more",
    },
    cleanup: ving.close,
    args: {
        list: {
            type: "boolean",
            description: "List all users",
            alias: "l",
        },
        admins: {
            type: "boolean",
            description: "List all users that are admins"
        },
        search: {
            type: "string",
            description: "Search all users by keyword",
            valueHint: "keyword",
            alias: "s",
        },
        add: {
            type: "string",
            description: "Create a new user",
            valueHint: "username",
            alias: "a",
        },
        modify: {
            type: "string",
            description: "Change an existing user",
            valueHint: "username",
            alias: "m",
        },
        email: {
            type: "string",
            description: "Set email address",
        },
        password: {
            type: "string",
            description: "Set password",
        },
        admin: {
            type: "boolean",
            description: "Should user be admin",
        },
        notAdmin: {
            type: "boolean",
            description: "Should user NOT be admin",
        },
        verifiedEmail: {
            type: "boolean",
            description: "Set users email verified",
        },
        notVerifiedEmail: {
            type: "boolean",
            description: "Set users email NOT verified",
        },
    },
    async run({ args, cmd }) {
        try {
            const users = await useKind('User');
            if (args.list) {
                formatList(await users.findMany());
            }
            else if (args.admins) {
                formatList(await users.findMany(eq(users.table.admin, true)));
            }
            else if (args.search) {
                formatList(await users.findMany(or(like(users.table.username, `%${args.search}%`), like(users.table.realName, `%${args.search}%`), like(users.table.email, `%${args.search}%`))));
            }
            else if (args.add) {
                if (!args.email)
                    throw ving.ouch(441, 'Email address required');
                const user = users.mint({
                    username: args.add,
                    realName: args.add,
                    email: args.email,
                    admin: args.admin,
                    verifiedEmail: args.verifiedEmail,
                });
                await user.insert();
                await user.setPassword(args.password);
                await user.update();
                formatList([user]);
            }
            else if (args.modify) {
                const user = await users.findOne(eq(users.table.username, args.modify));
                if (user) {
                    if (args.email)
                        user.set('email', args.email);
                    if (args.password)
                        await user.setPassword(args.password);
                    if (args.admin)
                        user.set('admin', true);
                    if (args.notAdmin)
                        user.set('admin', false);
                    if (args.verifiedEmail)
                        user.set('verifiedEmail', true);
                    if (args.notVerifiedEmail)
                        user.set('verifiedEmail', false);
                    await user.update();
                    formatList([user]);
                }
                else {
                    ving.log('cli').error(`Could not find user: ${args.modify}`);
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

function formatList(users) {
    console.log(
        'Username'.padEnd(30),
        'Email'.padEnd(60),
        'Admin'.padEnd(10),
        'Verified Email'.padEnd(10),
    )
    for (const user of users) {
        console.log(
            user.get('username').padEnd(30),
            user.get('email').padEnd(60),
            user.get('admin').toString().padEnd(10),
            user.get('verifiedEmail').toString().padEnd(10),
        )
    }
}
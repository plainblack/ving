import { defineCommand } from "citty";
import { useUsers } from '../../server/vingrecord/records/User.mjs'
import { useCache } from '#ving/cache.mjs';
import { like, or, eq } from '../../server/drizzle/orm.mjs';

export default defineCommand({
    meta: {
        name: "User Administration",
        description: "Basic CRUD for users, use web UI for more",
    },
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
    },
    async run({ args }) {
        const Users = useUsers();
        if (args.list) {
            formatList(await Users.findMany());
        }
        else if (args.admins) {
            formatList(await Users.findMany(eq(Users.table.admin, true)));
        }
        else if (args.search) {
            formatList(await Users.findMany(or(like(Users.table.username, `%${args.search}%`), like(Users.table.realName, `%${args.search}%`), like(Users.table.email, `%${args.search}%`))));
        }
        else if (args.add) {
            const user = Users.mint({
                username: args.add,
                realName: args.add,
                email: args.email,
                password: args.password,
                admin: args.admin,
            });
            await user.insert();
            formatList([user]);
        }
        else if (args.modify) {
            const user = await Users.findOne(eq(Users.table.username, args.modify));
            if (user) {
                if (args.email)
                    user.set('email', args.email);
                if (args.password)
                    await user.setPassword(args.password);
                if (args.admin)
                    user.set('admin', true);
                if (args.notAdmin)
                    user.set('admin', false);
                await user.update();
                formatList([user]);
            }
            else {
                console.log(`Could not find user: ${args.modify}`);
            }
        }
        await Users.db.session.client.pool.end();
        await useCache().disconnect();
    },
});

function formatList(users) {
    console.log(
        'Username'.padEnd(30),
        'Email'.padEnd(60),
        'Admin',
    )
    for (const user of users) {
        console.log(
            user.get('username').padEnd(30),
            user.get('email').padEnd(60),
            user.get('admin').toString(),
        )
    }
}
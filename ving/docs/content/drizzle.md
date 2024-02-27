# Drizzle
The database layer is controlled by [Drizzle](https://github.com/drizzle-team/drizzle-orm). Drizzle table definitions should be generated from your [ving schema](ving-schema.html). Drizzle provides a convenient way to write SQL queries in Javascript. Drizzle's table definitions keep track of changes to your database schema over time allowing it to automatically generate database change migrations.

## Migrations
Migrations are files created to help you migrate changes from one version of your database to another. In some systems you have to manually write migrations. But in ving you don't, thanks to our use of Drizzle.

### Generate Database Migrations

Drizzle can automatically generate database migrations based upon changes in the Drizzle table definitions. You run that command like this:

```bash
./ving.mjs drizzle --prepare
```

### Apply Database Migrations 

Drizzle can automatically apply migrations to your database by running this command:

```bash
./ving.mjs drizzle --up
```

## Writing Queries
Normally you shouldn't have to write many queries as [ving records](ving-record.html) should handle a lot of that for you. But if you write complex backends like we do then inevitably you'll need to write some.

Writing Drizzle queries looks a lot like how you would write them with SQL, only in Javascript. You probably want to check out the [official Drizzle documentation](https://orm.drizzle.team/docs/overview).

We've exported a list of the useful drizzle utilities into a single file called `#ving/drizzle/orm.mjs`. Below is an example of how you might use this:

```js
import {eq} from '#ving/drizzle/orm.mjs';
import {UsersTable} from '#ving/drizzle/schema/User.mjs';
import {useDB} from '#ving/drizzle/db.mjs';

const db = useDB()
const result = await db.select().from(UsersTable).where(eq(UsersTable.email, 'joe@example.com'));
```

Or if you are using [ving records](ving-record.html) then its even easier:

```js
import {useKind} from '#ving/record/VingRecord.mjs';
import {eq} from '#ving/drizzle/orm.mjs';

const users = await useKind('User');
const result = await users.select.where(eq(Users.table.email, 'joe@example.com'));
```

## Debugging
You can enable logging by adding `?log=yes` to the end of your `VING_MYSQL` url like so:

```
VING_MYSQL="mysql://ving:vingPass@localhost:3306/ving?log=yes"
```

Queries will be logged at level `debug` in the `drizzle` topic.
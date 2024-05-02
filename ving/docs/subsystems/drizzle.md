---
outline: deep
---
# Drizzle
The database layer is controlled by [Drizzle](https://github.com/drizzle-team/drizzle-orm). Drizzle table definitions should be generated from your [ving schema](ving-schema). Drizzle provides a convenient way to write SQL queries in Javascript. Drizzle's table definitions keep track of changes to your database schema over time allowing it to automatically generate database change migrations.

## Migrations
Migrations are files created to help you migrate changes from one version of your database to another. In some systems you have to manually write migrations. But in ving you don't, thanks to our use of Drizzle.

### Generate Database Migrations

Drizzle can automatically generate database migrations based upon changes in the Drizzle table definitions. You run that command like this:

```bash
./ving.mjs drizzle --prepare
```

### Compare Generated Migrations With Database

If you want to compare what migrations you have generated vs what migration has been applied to the database, then use this:

```bash
./ving.mjs drizzle --status
```

### Apply Database Migrations 

Drizzle can automatically apply migrations to your database by running this command:

```bash
./ving.mjs drizzle --up
```

## Writing Queries
Normally you shouldn't have to write many queries as [ving records](ving-record) should handle a lot of that for you. But if you write complex backends like we do then inevitably you'll need to write some.

Writing Drizzle queries looks a lot like how you would write them with SQL, only in Javascript. You probably want to check out the [official Drizzle documentation](https://orm.drizzle.team/docs/overview).

We've exported a list of the useful drizzle utilities into a single file called `#ving/drizzle/orm.mjs`. Below is an example of how you might use this:

```js
import {eq} from '#ving/drizzle/orm.mjs';
import {UsersTable} from '#ving/drizzle/schema/User.mjs';
import {useDB} from '#ving/drizzle/db.mjs';

const db = useDB()
const result = await db.select().from(UsersTable).where(eq(UsersTable.email, 'joe@example.com'));
```

Or if you are using [ving records](ving-record) then its even easier:

```js
import {useKind} from '#ving/record/VingRecord.mjs';
import {eq} from '#ving/drizzle/orm.mjs';

const users = await useKind('User');
const result = await users.select.where(eq(Users.table.email, 'joe@example.com'));
```

### Queries Against Very Large Datasets
If you are running queries against extremely large datasets and don't want to load all that data into memory at once, we've partnered with the Drizzle Team to implement [an asynchronous iterator](https://orm.drizzle.team/docs/select#iterator) that you can use. It works like this:

```js
const iterator = await db.select().from(UsersTable).iterator();

for await (const row of iterator) {
  console.log(row);
}
```
This returns row results, not `VingRecord` instances. However, the `findaAll()` method in `VingRecord` does it with records:

```js
const allUsers = await Users.findAll();
for await (const user of allUsers) {
  console.log(user.get('id'));
}
```

## Debugging
You can enable logging by adding `?log=yes` to the end of your `VING_MYSQL` url like so:

```
VING_MYSQL="mysql://ving:vingPass@localhost:3306/ving?log=yes"
```

Queries will be logged at level `debug` in the `drizzle` topic.
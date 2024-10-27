---
outline: deep
---
# Ving Record
Records are the functional implementation of a [ving schema](ving-schema). They automatically generate a ton of functionality from making queries easier, to building web services, to setting up privileges and more.

## Records vs Kinds
A ving record is technically 2 separate classes. The first is called a "Kind", which is technically a group or list of records. In relational database terms, think of a kind as a table. The second type is the record, which is an instance of a kind, which in relational database terms is a row within a table. Both classes exist inside the record file. See `#ving/record/records/User.mjs` as an example implementation of a record, or `#ving/record/VingRecord.mjs` to see the base class that all ving records inherit from.

## Creating Records
You can use the [CLI](cli) to automatically generate a new record file for you from a [Drizzle table](drizzle). So if you've created a table called `Foo` then you could create a new record file like this:

```bash
./ving.mjs record --new Foo
```

> Note that you will need a [Ving Schema](ving-schema) for `Foo` before the record can function.

That will generate the file `#ving/record/records/Foo.mjs`. And in there you could add any custom functionality you may need. Or if you don't need any custom functionality, then it may work just as it is.

Once you're done adding functionality you can then generate a Rest API for it by invoing the CLI again like this:

```bash
./ving.mjs record --rest Foo
```

Those files will be placed in `server/api/v1/foo` and you can modify them as needed, but they should work without modification. And you can access them at `http://localhost:3000/api/v1/foo`.

And if you want to build a user interface for your services, you can generate that too by invoking the CLI once more.

```bash
./ving.mjs record --web Foo
```

Those files will be placed in `pages/foo` and you can modify them as needed as well. And you can access them at `http://localhost:3000/foo`.


## Kind API
The Kind is akin to a relational database table. To start with you need to get a reference to it:

```js
import {useKind} from '#ving/record/VingKind.mjs';
const users = await useKind('User');
```

### Creating Records
You can create records many different ways. In all three methods you'll pass in a list of `props` which is an object containing the values (or columns) to set on the record.

#### copy
Creates an in-memory copy of an existing record, but with a new `id`. You'd later have to call `insert()` (from the [Record API](#record-api)) on the record to insert it into the database. This is essentially the same as passing the properties of an exsiting record to the `mint()` method.

```js
const copyOfRecord = Users.copy(existingRecord);
```

#### create
Creates a new record in the database, but doesn't validate the inputs according to the ving schema. That doesn't mean it will get inserted. If you haven't given enough information to pass the database table's own schema, then it will fail. You are just bypassing the extra validation provided by ving's schema. In general, you shouldn't use this unless you know what you are doing.

```js
const record = await Users.create({username: 'Fred'});
```

#### createAndVerify
Creates a new record in memory, validates it against ving's schema, and then inserts it into the database. This is almost always what you want.

```js
const record = await Users.createAndVerify({username: 'Fred'});
```

#### insert
Use this to write your own custom insert statement. Also see the `insert()` method on the [Record API](#record-api).

```js
const result = await Users.insert.values({username:'Fred'});
```

#### mint
Creates a record in memory. You'd later have to call `insert()` (from the [Record API](#record-api)) on the record to insert it into the database.

```js
const record = Users.mint({username: 'Fred'});
```

### Reading Records
There are many different ways to find a record or list of records in ving.

#### describeList
Instead of returning records like the rest of this list, `describeList()` returns an array of objects that is suitable for using in web services. You can use it like this:

```js
const list = await Users.describeList(params, where)
```

#### Result
```js
{
    paging: {
        page: 1,
        nextPage: 2,
        previousPage: 1,
        itemsPerPage: 10,
        totalItems: 43,
        totalPages: 5
    },
    items: [ 
        { // same as the describe() method from a Record
            props : { id: 'xxx', ... }, // database properties
            meta : { displayName : 'Freddy', ... }, // calculated properties
            links: { 
                self : { 
                    href : "/api/v1/user/xxx", 
                    methods: ['GET','PUT','DELETE'] 
                }, 
                ... 
            }, // urls for various web services 
            options : { useAsDisplayName : [
                { label : 'Username', value : 'username' },
                ...
            ]}, // options for enumerated / boolean fields
            related: { }, // records with a parent/sibling relationship to this record
        },
        ...
    ]
}
```

#### Parameters

 - **params** - An object to modify the output.
   - **itemsPerPage** - An integer between `1` and `100` that defaults to `10` and represents how many items should be included per page.
   - **page** - An integer between `1` and `1000000` that defaults to `1` and represents the current page number of the result set.
   - **sortBy** - A string that represents a valid `prop` of the record and defaults to `createdAt`. 
   - **sortOrder** - A string that defaults to `asc` but could also be `desc` if you want the order of the records to be sorted in descending order.
   - **maxItems** - An integer between `1` and `100000000000` that defaults to `100000000000` that limits the total number of items that can ever be paginated through.
   - **objectParams** - See the params of the `describe()` method in the [Record API](#record-api).
 - **where** - A drizzle where clause like you would use with the `findMany()` method below.

#### find
Locates and returns a single [record](#record-api) by it's `id` or `undefined` if no record is found.

```js
const record = await Users.find('xxx');
```

#### findMany
Locates and returns a list of [record](#record-api)s by a drizzle where clause or an empty array if no records are found.

```js
const listOfFredRecords = await Users.findMany(like(Users.realName, 'Fred%'));
```

#### findAll
Does the same thing as `findMany` except with an iterator so not all records are loaded into memory at the same time.

```js
const allFreds = await Users.findMany(like(Users.realName, 'Fred%'));
for await (const fred of allFreds) { 
    console.log(fred.get('id'));
}
```

#### findOne
Locates and returns a single [record](#record-api) by a drizzle where clause or `undefined` if no record is found.

```js
const fredRecord = await Users.findOne(eq(Users.username, 'Fred'));
```

#### findOrDie
Locates and returns a single [record](#record-api) by it's `id` or throws a `404` error if no record is found.

```js
const record = await Users.findOrDie('xxx');
```

#### select
Write your own custom select function. Returns a drizzle result set, not a list of records.

```js
const results = await Users.select.where(like(Users.realName, 'Fred%'));
```

### Updating Records
Updating existing records.

#### update
Update records already in the database without first selecting them by writing your own custom query.

```js
const results = await Users.update.set({admin: false}).where(like(Users.realName, 'Fred%'))
```

> Note that this where clause is raw. To use it safeley you should wrap the `like(Users.realName, 'Fred%')` portion in the `calcWhere()` method below.

See also the `update()` method in the [Record API](#record-api) for updating a record you've already fetched.

### Deleting Records

#### delete
Delete records by writing your own custom query. 

```js
const results = await Users.delete.where(like(Users.realName, 'Fred%'));
```

> Note that this where clause is raw. To use it safeley you should wrap the `like(Users.realName, 'Fred%')` portion in the `calcWhere()` method below.

See also the `delete()` method in the [Record API](#record-api) for deleting a record you've already fetched.

#### deleteMany
A safer version of `delete` above as it uses `calcWhere()`.

```js
await Users.deleteMany(like(Users.realName, 'Fred%'));
```

### Utility Methods

#### calcWhere
Adds `propDefaults` (if any) into a where clause to limit the scope of affected records. As long as you're using the built in queries you don't need to use this method. But you might want to use it if you're using `create`, `select`, `update`, or `delete` directly.

```js
const results = await Users.delete.where(Users.calcWhere(like(Users.realName, 'Fred%')));
```

#### count
Returns an integer representing how many records match a given where clause.

```ts
const usersNamedFred = await Users.count(like(Users.realName, 'Fred%'));
```

### Properties

#### propDefaults
An array of objects containing a list of properties used in building relationships between this record and another. For example the `User` record uses it like this to establish related `APIKey` records:

```js
apikeys.propDefaults.push({
    prop: 'userId',
    field: apikeys.table.userId,
    value: this.get('id')
});
```

It is then used with `calcWhere()` to limit the scope of a where clause to related records. So for this example it would limite the list of `APIKey`s to the ones related to the current `User`. 

## Record API
The Record is akin to a relational database table row. You'll get a record via the [Kind API](#kind-api), perhaps like this:

```js
import {useKind} from '#ving/record/VingRecord.mjs';
const users = await useKind('User');
const record = users.findOrDie('xxx');
```

Once you have a record you can use the following methods to manipulate it.


### Reading Data

#### describe
Formats everything known about a record into an object that is easily serializable and sanitized for privileges. This is used by the [Rest API](rest) to format a record for public consumption.

```js
const description = await record.describe(params)
```

##### Result
```js
{
    props : { id: 'xxx', ... }, // database properties
    meta : { displayName : 'Freddy', ... }, // calculated properties
    links: { self : { 
        href : "/api/v1/user/xxx", 
        methods: ['GET','PUT','DELETE'] 
        }, 
        ... 
    }, // urls for various web services 
    options : { useAsDisplayName : [
        { label : 'Username', value : 'username' },
        ...
    ]}, // options for enumerated / boolean fields
    related: { }, // records with a parent/sibling relationship to this record
    extra : {}, // an object that include literally anything special defined by the object
}
```

##### Parameters

 - **currentUser** - Either a `User` record or a `Session` object can be used to determine what data should be included in the description based upon user privileges.
 - **include** - An object to modify the output.
   - **options** - A boolean that if `true` will add list of enumerated options for props on this record.
   - **related** - An array that can contain the names of parent relationships to this object that should be included in the description.
   - **extra** - An array that include the names of special extras that will be included the description.
   - **meta** - A boolean that if `true` will include calculated properties.
   - **links** - A boolean that if `true` will include a list of API links.
   - **private** - A boolean that if `true` will ignore the privileges of the `currentUser` passed in and include all private information.


#### get
Returns the value of a single prop on this record using the name of the prop.

```js
const value = record.get('id');
```

#### getAll
Returns an object containing key value pairs of all the props stored in the database for this record.

```js
const props = record.getAll();
```

#### refresh
Refetches the data from the database for this record.

```js
await record.refresh();
```

### Writing Data


#### createAndVerify

Calls `testCreationProps()`, `setPostedProps()` and `insert()` in a single method call.

```js
await record.createAndVerify({foo: 'bar', one: 1}, currentUserOrSession);
```

#### delete
Delete the current record from the database.

```js
await record.delete();
```

#### insert
Insert the current record into the database. Can only be called if it hasn't already been inserted.

```js
await record.insert();
```

#### set
Set the value of a prop on this record. Returns the value set or throws an error if there is a validation problem, which then throws an error. Updates the in memory prop, but doesn't write it to the database; call `update()` or `insert()` for that.

```js
user.set('admin', true);
```

#### setAll
Set the values of multiple props on this record at the same time. Returns an object containing all the props unless there is a validation problem, which then throws an error. Updates the in memory props, but doesn't write it to the database; call `update()` or `insert()` for that.

```js
record.set({foo: 'bar', one: 1});
```

#### setPostedProps
Sets props on the current record from an untrusted source, and thus checks whether a specific user has the privileges to set the prop. Returns `true` if everything sets properly, or throws an error if there are privilege problems. Updates the in memory props, but doesn't write it to the database; call `update()` or `insert()` for that.

```js
await record.setPostedProps({foo: 'bar', one: 1}, currentUserOrSession);
```

#### update
Updates the current record in the database.


#### updateAndVerify
Calls `setPostedProps()` and `update()` in a single method call.

```js
await record.updateAndVerify({foo: 'bar', one: 1}, currentUserOrSession);
```

### Pseudo Properties
In addition to all the methods above, every [schema](ving-schema) prop except those of type `virtual` will also get pseudo props added to the record. The means that in addition to using `get('username')` and `set('username', 'adufresne')` methods you can use the pseudo props as getters and setters like this:

```js
const username = user.username;
user.username = 'adufresne';
```


### Privileges

#### canEdit
Returns `true` if the current user has edit rights on this record or throws a `403` error if not.

```js
await record.canEdit(currentUserOrSession);
```

#### isOwner
Returns `true` if the current user or session is defined as the owner of this record, or returns `false` if not.

```js
if (await record.isOwner(currentUserOrSession) {
    console.log('they own it!')
}
else {
    console.log('they do NOT own it!')
}
```

### Utility Methods

#### addWarning
Add a warning to the list of `warnings` so that the user can be notified in the [UI](ui.html).

```js
record.addWarning({
        code : 418,
        message : "I'm a little teapot."
    });
```

#### isInserted
Returns `true` if this record has been inserted into the database, or `false` if not.

#### parent
Returns a parent relationship record by name.

```js
const user = apikey.parent('user');
```

#### propOptions
Returns a list of validation options for fields in this record.

```js
const options = await user.propOptions(params, false);
```

#### Result
```js
{ 
    useAsDisplayName : [
        { label : 'Username', value : 'username' },
        ...
    ],
    avatar : [ 'png', 'jpg' ],
    ...
}
```

#### Parameters

 - **params** - an object of all the same paramters as the `describe()` method.
 - **includeAll** - A boolean, that if true, will return all the options regardless of privileges.

#### testCreationProps
Tests the properties trying to be set on a new object, and if all the required values are present and valid then it returns `true`, otherwise it throws a `441` error.

```js
await record.testCreationProps({foo:'bar'});
```

### Properties

#### warnings
An array of warnings for this record that have been added by `addWarnings()` since this record was instanciated.

```js
[
    {
        code : 418,
        message : "I'm a little teapot."
    },
    ...
]
```
---
outline: deep
---
# Ving Schema
You'll find the schemas in `#ving/schema/schemas`. A schema looks like this:

```js
{
    kind: 'User',
    tableName: 'users',
    owner: ['$id', 'admin'],
    props: [
        ...baseSchemaProps,
        {
            type: "string",
            name: "username",
            required: true,
            unique: true,
            length: 60,
            default: '',
            db: (prop) => dbString(prop),
            zod: (prop) => zodString(prop),
            view: [],
            edit: ['owner'],
        },
    ],
}
```

## Creating a New Schema

Use the [CLI](cli) to generate a new schema skeleton to work from.

```bash
./ving.mjs schema --new=Foo
```

## Attributes

### kind
A string that represents the unique name of the schema and everything generated from it. 

### tableName 
A string that is name of the MySQL database table it will be stored in.

### owner
An array containing the method for determining who owns this object. Owners can be assigned special rights on `props`. 

The owner can be any field that contains a User ID, so in the case of the `User` schema, it can use its own id by specifying `$id`, but in another table it might be `$userId`. 

It can also contain any number of roles. By default there are 3 roles: `admin`, `developer`, `verifiedEmail`, but you could add more. Roles can be defined inside the `User` schema (`#ving/schema/schemas/User.mjs`). They have to be added as a [boolean prop type](#boolean-props), and then also added to the `RoleOptions` at the bottom of the file.

It can also defer to a parent object. So let's say you had a record called Invoice and another called LineItem. Each LineItem would have a parent relation to the Invoice called `invoice`. So you could then use `^invoice` (notice the carat) to indicate that you'd like to ask the Invoice if the User owns it, and if the answer is yes, then the LineItem will be considered to also be owned by that user. The carat means "look for a parent relation in the schema" and whatever comes after the carat is the name of that relation.

### props
All schemas should have the base props of `id`, `createdAt`, and `updatedAt` by using `...baseSchemaProps`. After that it's up to you to add your own props to the list. There are many different types of props for different field types.

Props all have the fields `type`, `name`, `required`, `default`, `db`, `zod`, `view`, and `edit`, but can have more or less fields from there.

#### Prop Privileges

The `view` and `edit` props are arrays that can:

- Be empty, if no one should be able to view or edit that prop
- Contain the special keyword `public`, if everyone should be able to view or edit that prop
- Contain any role (such as `admin`)
- Contain the special keyword `owner`, so that whoever was defined as the owner in the attributes of the schema can view or edit that prop

If a user can `edit` a prop it can automatically `view` a prop.

#### Prop Types

##### Boolean Props
```js
{
    type: "boolean",
    name: 'admin',
    required: true,
    default: false,
    db: (prop) => dbBoolean(prop),
    enums: [false, true],
    enumLabels: ['Not Admin', 'Admin'],
    view: ['owner'],
    edit: ['admin'],
},
```

##### Date Props
```js
{
    type: "date",
    name: "startAt",
    required: true,
    autoUpdate: true,
    default: () => new Date(),
    db: (prop) => dbDateTime(prop),
    view: ['public'],
    edit: [],
},
```

##### Enum Props
```js
{
    type: "enum",
    name: 'useAsDisplayName',
    required: true,
    length: 20,
    default: 'username',
    db: (prop) => dbEnum(prop),
    enums: ['username', 'email', 'realName'],
    enumLabels: ['Username', 'Email Address', 'Real Name'],
    view: [],
    edit: ['owner'],
},
```

##### Id Props
These are used to add a parent relationship.
```js
{
    type: "id",
    name: 'userId',
    required: true,
    length: 36,
    db: (prop) => dbRelation(prop),
    relation: {
        type: 'parent',
        name: 'user',
        kind: 'User',
    },
    default: undefined,
    view: ['public'],
    edit: ['owner'],
},
```

##### String Props

```js
{
    type: "string",
    name: "email",
    required: true,
    unique: true,
    length: 256,
    default: '',
    db: (prop) => dbString(prop),
    zod: (prop) => zodString(prop).email(),
    view: [],
    edit: ['owner'],
},

```

##### Text Props

```js
{
    type: "string",
    name: "memo",
    required: true,
    length: 256,
    default: '',
    db: (prop) => dbText(prop),
    zod: (prop) => zodText(prop),
    view: [],
    edit: ['owner'],
},

```

##### MediumText Props

```js
{
    type: "string",
    name: "description",
    required: true,
    default: '',
    db: (prop) => dbMediumText(prop),
    zod: (prop) => zodMediumText(prop),
    view: [],
    edit: ['owner'],
},

```

##### Virtual Props

These are used to add a child relationship. They are virtual because they make no modification to the database table they represent.
```js
{
    type: "virtual",
    name: 'userId',  // the name of the column in the child table that connects it to this table
    required: false,
    view: ['public'],
    edit: [],
    relation: {
        type: 'child',
        name: 'apikeys', // the name of the relationship, think of it like the method name
        kind: 'APIKey', // the class name of the child table
    },
},
```

## Generate Drizzle Tables from Ving Schema

Now that you've created or updated your schema, you can generate [Drizzle](drizzle) tables from  with this command:

```bash
./ving.mjs drizzle --tables
```

> Note that you shouldn't ever need to modify these table files directly. If you need to change them, update the ving schema and run the above command again.
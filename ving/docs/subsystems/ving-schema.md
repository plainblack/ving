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
        { ...baseSchemaId },
        { ...baseSchemaCreatedAt },
        { ...baseSchemaUpdatedAt },
        {
            type: "string",
            name: "username",
            required: true,
            unique: true,
            length: 60,
            default: '',
            db: (prop) => dbVarChar(prop),
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

## Validating a Schema

Use the [CLI](cli) to validate a schema:

```bash
./ving.mjs schema -v Foo
```

Or all schemas:

```bash
./ving.mjs schema -V  
```

The schema validator is automatically run when you generate a [ving record](ving-record) or a [drizzle table](drizzle).

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
All schemas should have the base props of `id`, `createdAt`, and `updatedAt` by using `{...baseSchemaId}`, `{...baseSchemaCreatedAt}`, and `{...baseSchemaUpdatedAt}`. After that it's up to you to add your own props to the list. There are many different types of props for different field types.

Props all have the fields `type`, `name`, `required`, `default`, `db`, `zod`, `view`, and `edit`, but can have more or less fields from there.

#### Prop Fields

Schema Props have a lot of varying fields. This section defines the purpose and implementation of all those props.

##### type
The `type` field determines how the prop will react to data it is given. Below you'll find examples of all the various types allowed. It is required. It also can determine what other fields are available in the prop definition.

###### Boolean Type Example
```js
{
    type: "boolean",
    name: 'admin',
    required: true,
    default: false,
    filterQualifier: true,
    db: (prop) => dbBoolean(prop),
    enums: [false, true],
    enumLabels: ['Not Admin', 'Admin'],
    view: ['owner'],
    edit: ['admin'],
},
```

###### Int Type Example

```js
{
    type: "int",
    name: "sizeInBytes",
    filterRange: true,
    required: false,
    default: 0,
    db: (prop) => dbInt(prop),
    zod: (prop) => zodNumber(prop).positive(),
    view: ['public'],
    edit: [],
},
```

###### Date Type Example
```js
{
    type: "date",
    name: "startAt",
    required: true,
    filterRange: true,
    default: () => new Date(),
    db: (prop) => dbDateTime(prop),
    view: ['public'],
    edit: [],
},
```

###### Enum Type Example
```js
{
    type: "enum",
    name: 'useAsDisplayName',
    required: true,
    filterQualifier: true,
    default: 'username',
    db: (prop) => dbEnum(prop),
    enums: ['username', 'email', 'realName'],
    enumLabels: ['Username', 'Email Address', 'Real Name'],
    view: [],
    edit: ['owner'],
},
```

###### Id Type Example
These are used to add a parent relationship.
```js
{
    type: "id",
    name: 'userId',
    required: true,
    filterQualifier: true,
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

###### String Type Examples

**VarChar**
```js
{
    type: "string",
    name: "email",
    required: true,
    unique: true,
    length: 256,
    filterQuery: true,
    default: '',
    db: (prop) => dbVarChar(prop),
    zod: (prop) => zodString(prop).email(),
    view: [],
    edit: ['owner'],
},

```

**Text**
```js
{
    type: "string",
    name: "memo",
    required: true,
    length: 65535,
    filterQuery: true,
    default: '',
    db: (prop) => dbText(prop),
    zod: (prop) => zodString(prop),
    view: [],
    edit: ['owner'],
},

```

**MediumText**
```js
{
    type: "string",
    name: "description",
    required: true,
    default: '',
    length: 16777215,
    db: (prop) => dbMediumText(prop),
    zod: (prop) => zodString(prop),
    view: [],
    edit: ['owner'],
},

```

###### JSON Type Example
```js
{
    type: "json",
    name: "metadata",
    required: false,
    default: '{}',
    db: (prop) => dbJson(prop),
    zod: (prop) => zodJsonObject(prop).passthrough(), // or replace .passthrough() with something like .extends({foo: z.string()})
    view: ['public'],
    edit: [],
},
```

###### Virtual Type Example

These are used to add a child relationship. They are virtual because they make no modification to the database table they represent.
```js
{
    type: "virtual",
    name: 'userId',  // the name of the column in the child table that connects it to this table
    required: false,
    default: undefined,
    view: ['public'],
    edit: [],
    relation: {
        type: 'child',
        name: 'apikeys', // the name of the relationship, think of it like the method name
        kind: 'APIKey', // the class name of the child table
    },
},
```

##### name

The `name` field determines how you will access the prop through all the various APIs and how it will be stored in the database. It is required.

##### required

The `required` field whether the prop is required to create an instance of the record. It is required.

##### default

The `default` field sets the default value that this prop should be set to both in code and as the default in the database schema. It is required. It can be a function or whatever the appropriate type is for this field, including explicitly `undefined` in some cases.

##### db

The `db` field is a required function that should return a [Drizzle column type definition](https://orm.drizzle.team/docs/column-types/mysql). It is used for generating the Drizzle database tables where ving records are stored. There are a lot of drizzle helper functions defined in `ving/schema/helpers.mjs` and they all start with the keyword "db".

##### zod

The `zod` field is a required function that should return a [zod](https://zod.dev) schema. It is used for validation of the data before allowing an insert/update of the database. There are a lot of zod schema functions defined in `ving/schema/helpers.mjs` and they all start with the keyword "zod".

The helper functions can even be extended. For example, one of the helpers is `zodString()`, which returns a function that looks like: 

```js
z.string().min(0).max(prop.length)
```
But you can extend it with additional zod functions, like this one that further says the string should look like an email address:
```js
zodString().email()
```

##### view

The `view` field is an array that can:

- Be empty, if no one should be able to view that prop
- Contain the special keyword `public`, if everyone should be able to view that prop
- Contain any role (such as `admin`)
- Contain the special keyword `owner`, so that whoever was defined as the owner in the attributes of the schema can view that prop

The `view` prop is required, but can be empty.

##### edit

The `edit` field works exactly the same as the `view` field, except that if a user can `edit` a prop it can automatically `view` a prop. It is required, but can be empty.

##### relation

The `relation` field is an object that defines a relationship between this record and another record. It is only available if the prop type is `id` or `virtual` and is only required if the prop type is `virtual`. 

The object has the following attributes:

###### type

The `type` attribute can be one of `parent` or `child` and is required.

###### name

The `name` attribute is a required string and defines the name of the relationship this record has with the other record. If it is of type `parent` it should be signular noun and if the type is `child` it should be a plural noun. This name will also be used in the database key.

###### kind

The `kind` attribute is required and should be the name of a VingKind such as `User`, `APIKey`, `S3File` or some other VingKind you define.

###### skipOwnerCheck

The `skipOwnerCheck` attribute is an optional boolean. It tells VingRecord's `setPostedProps()` method that it does not need to check whether the user linking a record to this relationship `isOwner()` on that record.

###### acceptedFileExtensions

If the relation `type` is `parent` and the `kind` is an `S3File` then you can also set this attribute to an array of file types that are to be accepted by this relationship. For example

```js
    acceptedFileExtensions : ['jpg','gif','png']
```

The listed extensions must be in the S3File `extensionMap`.

##### enums

The `enums` field is reqiured only if the prop type is `boolean` or `enum`. It is an array containing the values that are possible for this prop to have. In the case of `boolean` that is `true` or `false`, but in the case of `enum` it can be an array of any strings. The order the values appear in the array is the order they will be displayed to the user.

##### enumLabels

The `enums` field is reqiured only if the prop type is `boolean` or `enum`. It is an array containing the labels for the `enums` field values. Note that the labels should appear in the order to match the values in the `enums` array.

##### options

The `options` field is an optional function name that returns an array of objects that can be used to populate the `options` in the [rest api](rest). It is a way to simulate an `enum` with dynamic values. However, the value set to the prop is only validated against the options in VingRecord's `setPostedProps()` method, not in `set()` or `setAll()`. Don't forget to define the named function in the VingRecord class.

##### noSetAll

Boolean, optional, default `false`. If set to `true` then this attribute will be skipped on a VingRecord when `setAll()` is called. You will have to `set()` the field specifically in order to set its value.

##### length

The `length` field is required when the prop is of type `string`. It can be greater than `1` and less than whatever the MySQL field type max length is: `256` for varchar, `65535` for Text, and `16777215` for MediumText. It is used for validating the length of the prop's value and also sets the prop field size in the database. 

##### unique

The `unique` field is an optional boolean. When set to `true` a unique index will be created on this prop in the database, and the record will test that the data being set to the prop is unqiue. 

##### uniqueQualifiers

The `uniqueQualifiers` field is an optional array of other prop names. It can be used with the `unique` field is set to `true`. Then instead of this prop being unique across the entire table, must be unique amongst the qualifiers. For example, if you had a schema with props that looked like:

```js
{
    type: 'string',
    name: 'name',
    unique: true,
    uniqueQualifiers: ['category'],
},
{
    type: 'enum',
    name: 'category',
    default: 'Food',
    enums: ['Food','Weapons','Armor'],
},
```

Then each `name` would have to be unique within the specified `category`. 

##### filterQuery

An optional boolean that if true will allow searching via the [rest api](rest) for keyword matches against this field. This is an alternative to overriding the `describeListFilter()` method in [VingRecord](ving-record). Only use on `enum` and `string` type props.

##### filterQualifier

An optional boolean that if true will allow searching via the [rest api](rest) for exact match filtering against this field. This is an alternative to overriding the `describeListFilter()` method in [VingRecord](ving-record). Only use on `id`, `int`, `boolean`, `enum` and `string` type props.

##### filterRange

An optional boolean that if true will allow searching via the [rest api](rest) for range matching against this field. This is an alternative to overriding the `describeListFilter()` method in [VingRecord](ving-record). Only use on `int` and `date` type props.


##### allowRealPubicId

An optional boolean that if true will do 2 things if added to an `id` prop `type`: 

* Allows searching via the [rest api](rest) for exact match filtering against this id using its integer value in addiont to the encrypted string assuming `filterQualifier` or `filterQuery` is true. 
* Adds the real id to the `meta.realId` object in the [rest api](rest) response.

##### autoUpdate

The `autoUpdate` field is an optional boolean that is only used on a prop with type `date`. If `true` the date will automatically get set every time `update()` is called on the record. This is generally never needed by anything other than the built in `dateUpdated` record that every record already has.

## Generate Drizzle Tables from Ving Schema

Now that you've created or updated your schema, you can generate [Drizzle](drizzle) tables from  with this command:

```bash
./ving.mjs drizzle --tables
```

> Note that you shouldn't ever need to modify these table files directly. If you need to change them, update the ving schema and run the above command again.
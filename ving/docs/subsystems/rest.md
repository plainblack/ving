---
outline: deep
---
# Rest API
The restful web services that ving creates are not only used to drive the UI, but also are intended to be used by your fans, customers, and the general public to interact with your web site in an automated fashion. This is the core reason we generate REST endpoints rather than using something like tRPC.

This document will tell you about the general premise of the Rest interface.

## Generation
Your Rest endpoints will be generated from your [Ving Schema](ving-schema) by using the [CLI](cli):

```bash
./ving.mjs record --rest Foo
```

> Note that you will need a [Ving Schema](ving-schema) and [Ving Record](ving-record) for `Foo` before the rest interface can function.

These will be placed in the `server/api/v1/foos` folder and can be modified by you after the fact.


## Conventions

There are several conventions used in this documentation to keep things shorter. They are documented here.

### Ellipsis

We often shorten pieces of return values with ellipsis (three dots: ...) to show that there would be additional data there, but it is not directly relevent to the documentation at hand.

### ID's

ID's are often represented as 3 x's: `xxx`. If you see `xxx` anywhere that means that would be replaced by a legitimate ID and shouldn't be interpreted literally. Also, ID's are case-sensitive strings, so store them as such.

### Prefix

When referencing any API herein we omit the domain for the site. So you should prefix it with whatever site you are trying to access like:

```
http://some.example.com/api/v1/user/xxx
```

## Versioning

The API is versioned with a `v1` in the URL. In this context `v1` actually just represents the default version number which is set in `ving.json`. If you want to make API breaking changes, increment the version number in `ving.json`, then copy all your APIs from the `server/api/v1` folder into a `server/api/v2` folder and then make your changes to the `v2` version of the API. That way your users on the `v1` API will be able to continue using the service until you deprecate it. 

##  Requests and Responses

To make a request to a Wing web service you need nothing more than a command line tool like `curl`, or better yet use the [VS Code Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client). You can of course use any network aware programming language as well. Here's an example request using the VS Code Rest Client:

### Create a record

```
POST http://ving.example.com/api/v1/articles
Content-Type: application/json

{ 
    "title" : "Ethics in Prisons", 
    "author" : "Andy Dufresne" 
}
```

Response:
```json
{
   "props" : {
     "id" : "xxx",
     "author" : "Andy Dufresne",
     "title" : "Ethics in Prisons",
     "body" : ""
   }
}
```

### Read a record

```
GET http://wing.example.com/api/v1/articles/xxx
```

Response:
```json
{
   "props" : {
     "id" : "xxx",
     "author" : "Andy Dufresne",
     "title" : "Ethics in Prisons",
     "body" : ""
   }
}
```

### Update a record

```
PUT http://ving.example.com/api/v1/articles/xxx
Content-Type: application/json

{
    "body" : "..."
}
```

Response:
```json
 {
   "props" : {
     "id" : "xxx",
     "author" : "Andy Dufresne",
     "title" : "Ethics in Prisons",
     "body" : "..."
   }
 }
```

### Delete a record
```
DELETE http://ving.example.com/api/v1/articles/xxx?includeMeta=true
```

Response
```json

 {
   "props" : { 
     "id" : "xxx",
     "author" : "Andy Dufresne",
     "title" : "Ethics in Prisons",
     "body" : "..."
   },
   "meta" : {
     "deleted" : true
   }
 }
 ```

### Get a list of records
```
GET http://ving.example.com/api/v1/articles
```

Response:
```json
{
    "paging": {
        "page": 1,
        "nextPage": 2,
        "previousPage": 1,
        "itemsPerPage": 10,
        "totalItems": 43,
        "totalPages": 5
    },
    "items" : [
        {
            "props" : {
                "id" : "xxx",
                "author" : "Andy Dufresne",
                "title" : "Ethics in Prisons",
                "body" : "..."
            }
        },
        ...
    ]
}
```

### Authenticated Requests
With each request you can `vingSessionId` cookie header if you want to get an 
authenticated result. If you choose not to pass the `vingSessionId`, then
the result you receive will be the public result set. If you do pass the
`vingSessionId` then you'll get the private result set (provided your session
has the privileges to receive the private result set). For example, if you
request information about your user account without specifying a `vingSessionId`
then all you'd get back is an ID and some other basic information, like this:

```
GET http://wing.example.com/api/v1/users/xxx?includeMeta=true
```

Response:
```json
{
   "props" : {
     "id" : "xxx",
     "createdAt" : "2012-04-23T18:25:43.511Z",
     "createdAt" : "2023-04-25T08:13:10.001Z",
     ...
   },
   "meta" : {
     "displayName" : "Andy Dufresne",
     ...
   },
}
```

But if you request your account information with your `vingSessionId`, then you'd
get a result set with everything we know about you:

```
GET http://wing.example.com/api/v1/users/xxx?includeMeta=true
Cookie: vingSessionId="yyy"
```

Response:
```json
{
   "props" : {
     "id" : "xxx",
     "createdAt" : "2012-04-23T18:25:43.511Z",
     "createdAt" : "2023-04-25T08:13:10.001Z",
     "realName" : "Andy Dufresne",
     "username" : "andy",
     "email" : "andy@shawshank.jail",
     "useAsDisplayName" : "realName",
     ...
   },
   "meta" : {
     "displayName" : "Andy Dufresne",
     ...
   },
}
```

However, if I requested information about your account, and specified my own
`vingSessionId`, then I would only get the public data. Because I don't have
the privileges necessary to access your private information.

See also [Session](/rest/Session) and [User](/rest/User).

## Consistency

A big part of the ving specification is that you can reliably expect it to do the same thing in all circumstances. Here are a few key points of consistency.

### Records

All record objects contain the following minimum shared set of attributes.

#### props

An object of database stored properties.

##### id

A unique id that will never change, which is an encrypted string based upon the integer value stored in the database. The ID's always begin with a `v` and are safe to use as CSS ID's or Javascript object property names.

##### createdAt

The date this record came into existence.

##### updatedAt

The last time this record was written to the database.

#### links

An object of links to API endpoints related to this record.

##### base

A link to create records of this type or list all records in the system of this type.

##### self

A link to get/delete this sepecfic record.

#### meta

An object of generated properties.

##### kind

A string representing the type of object this is in case you need to identify it in the future.

### Dates
Dates are always returned in the format of `YYYY-MM-DDTHH:MM:SS.mmmZ` (the Javascript/JSON stringified date format) and are represented as the UTC time zone.

### Response Format

Ving will always return a JSON response in the form of an object.

```json
{
   "props" : { "success" : 1 }
}
```

#### Success

Results will always start with a top level object, and if its a [Ving Record](ving-record) it will at minimum have a `prop` object nested within it.

```json
{
    "props" : {
      "id" : "xxx",
      ...
    }
}
```

#### Success With Pagination

Paginated lists are always handled exactly the same way, and always have the same minimum set of parameters for manipulation.

```
GET /api/v1/article?itemsPerPage=25&page=3
```

You can tell how many items per page to return and which page number to return. That will give you a result set like this:

```json
{
    "paging": {
        "page": 3,
        "nextPage": 4,
        "previousPage": 2,
        "itemsPerPage": 25,
        "totalItems": 937,
        "totalPages": 38
    },
    "items" : [
        {
            "props" : {
                "id" : "xxx",
                "author" : "Andy Dufresne",
                "title" : "Ethics in Prisons",
                "body" : "..."
            }
        },
        ...
    ]
}
```

##### Pagination Query Params

- **itemsPerPage** - An integer between `1` and `100` that defaults to `10` and represents how many items should be included per page.
- **page** - An integer between `1` and `1000000` that defaults to `1` and represents the current page number of the result set.
- **sortBy** - A string that represents a valid `prop` of the record and defaults to `createdAt`. 
- **sortOrder** - A string that defaults to `asc` but could also be `desc` if you want the order of the records to be sorted in descending order.
- **maxItems** - An integer between `1` and `100000000000` that defaults to `100000000000` that limits the total number of items that can ever be paginated through.


#### Exceptions
Exceptions will always start with a top level element called `error` and then will have an object of 3 properties: `code`, `message`, `data`.

```json
 {
   "error" : {
     "code" : 500,
     "message" : "An unknown error has occurred.",
     "data" : null
   }
 }
```

The `code` is always an integer and conforms to the standard list of [Error Codes](/error-codes). These numbers are used consistently so that app developers can trap and handle specific types of exceptions more gracefully.

The `message` is a human readable message that you can display to a user.

The `data` element many times will be null, but it can have important debug information. For example, if a required field was left empty, the field name could be put in the data element so that the app could highlight the field for the user.

#### Warnings

In addition to exceptions there can be less severe issues that come up. These are handled via warnings. Warnings are just like exceptions, but they don't cause execution to halt. As such there can be any number of warnings. And warnings are returned with the result.

```json
 {
    "warnings" : [
        {
            "code" : 445,
            "message" : "Logo image is too big.",
            "data" : "logo"
        }
    ],
    ...
 }
```

### Relationships

All objects can have relationships to each other. When you fetch an object, you can pass `includeLinks=true` as a parameter if you want to get the relationship data as well.

```
GET /api/v1/articles/xxx?includeLinks=true
```

Response:
```json
 {
   "props" : {
     "id" : "xxx",
     ...
    },
    "links" : {
        "base" : {
          "href": "/api/v1/users",
          "methods": ["GET","POST"],
          "usage" : "rest"
        }, 
        "self" : {
          "href": "/api/v1/users/xxx",
          "methods": ["GET","PUT","DELETE"],
          "usage" : "rest"
        },
        "articles" : {
          "href": "/api/v1/users/xxx/articles",
          "methods": ["GET"],
          "usage" : "rest"
        },
        "list" : {
          "href": "/users/admin",
          "methods": ["GET"],
          "usage" : "page"
        },
         "profile" : {
          "href": "/users/xxx/profile",
          "methods": ["GET"],
          "usage" : "page"
        },
        ...
     }
   }
 }
```
You can then in-turn call the URI provided by each relationship to fetch the items in that list.


### Related Records

Likewise you can request related objects (those with relationship type of parent) be included directly in the result by adding the name of the related record relationship like `includeRelated=user as a parameter:

```
GET /articles/xxx?includeRelated=user
```

Response:
```json
 {
   "props" : {
     "id" : "xxx",
     "author" : "Andy Dufresne",
     "title" : "Ethics in Prisons",
     "body" : "...",
     "userId" : "xxx",
   },
   "related" : {
     "user" : {
        "props" : {
            "id" : "xxx",
            ...
        }
     }
   }
 }
 ```

All related objects are also inherently relationships of the object. Therefore the documentation will leave them out of the list of relationships in each object, but will include them in the list of related objects.

> **NOTE:** The only related objects that can be returned in this manner are 1:1 relationships. If the relationship is 1:N as in the case of related articles above, then those cannot not be included in the result, and must be fetched separately.


### Filters
Filters allow you to modify the result set when querying a list of records.

#### Queryable
Some relationships will allow you to use a `search` parameter on the URL that will allow you to search the result set. The documentation will tell you when this is the case and which fields will be searched to provide you with a result set.

```
GET /api/v1/articles/xxx/related-articles?search=prison
```

#### Qualifiers
In search engines these are sometimes called facets. They are criteria that allow you to filter the result set by specific values of a specfic field. The documentation will tell you when a relationship has a qualifier. To use it you'd add a parameter of the name of the qualifier to the URL along with the value you want to search for.

```
GET /api/v1/articles/xxx/related-articles?userId=xxx
```

That will search for all related articles with a `userId` of `xxx`.

You can also modify the qualifier by prepending operators such as `>`, `>=`, `<=`, and `<>` (or `!=`) onto the value. For example:

```
 GET /api/v1/articles/xxx/related-articles?wordCount=>=100
```

Get all related articles with a word count greater than or equal to `100`.

You can also request that a qualifier be limited to a `null` value.

```
GET /api/v1/articles/xxx/related-articles?userId=null
```

If you did this with an empty `''` or `undefined` value rather than specifically `null` then this qualifier will be skipped.

#### Ranged
You can also use ranged filters to limit data that must fall between 2 values by prepending `_start_` or `_end_` to the name of the prop you wish to filter on range.

```
GET /api/v1/articles/xxx/related-articles \
  ?_start_createdAt=2012-04-23T18:25:43.511Z \
  &_end_createdAt=2023-04-25T08:13:10.001Z
```


### Extra Includes
Some records will allow for extra includes, and will show this in the documenation. Extra includes are extra bits of data you can pull back when you request the record, that are unique to that record.

```
GET /api/v1/articles/xxx/related-articles?includeExtra=foo
```

The result will then have `foo` in an `extras` block like:

```json
 {
    "props" : {
        "id" : "xxx",
        ...
    }
    "extras" : {
        "foo" : {...}
    }
 }
```

### Options

Sometimes a record will have fields that require you to choose an option from an enumerated list. There are two ways to see what those options are:

This way would be most often used when you need the list of options in order to create a record.

```
GET /api/v1/articles/options
```

Response:
```json 
{
    "bookType" : [
        {"label" : "Hardcover", "value" : "hard" },
        {"label" : "Paperback", "value" : "soft" }
    ],
    ...
}
```

This way would be most often used when you need the list of options to update an object, because you can get the properties of the object and the options in one call.

```
GET http://ving.example.com/api/v1/articles/xxx?includeOptions=true
```

```json
 {
   "props" : {
     "id" : "xxx",
     ...
   },
   "options" : {
        "bookType" : [
            {"label" : "Hardcover", "value" : "hard" },
            {"label" : "Paperback", "value" : "soft" }
        ],
        ...
    }
 }
 ```

## Client Examples

### useVingRecord Composable
There is a composable built into ving called [useVingRecord](ui#usevingrecord()) that will allow you to access the Rest API easily for individual records.

### useVingKind Composable
There is a composable built into ving called [useVingKind](ui#usevingkind()) that will allow you to access the Rest API easily for lists of records. It uses the useVingRecord composable underneath to give you access to the individual records within the list.

### curl
```
curl -X POST -d '{"title":"Ethics in Prisons","author":"Andy Dufresne"}' \
  -H Content-Type: application/json \
  -H Cookie: vingSessionId=yyy http://ving.example.com/api/v1/articles
```

### VS Code Rest Client
[VS Code Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

```
POST http://ving.example.com/api/v1/articles
Content-Type: application/json
Cookie: vingSessionId=yyy

{ 
    "title" : "Ethics in Prisons", 
    "author" : "Andy Dufresne" 
}
```

## Testing
If you don't want to use an available client, but instead write your own, there is a [Test API](/rest/Test) that can help make sure your client is working before you start using the real web service.
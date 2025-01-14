---
outline: deep
---
# User
Users can own records in ving. Users have privileges to access various types of data and store login credentials.

## Filters

| Prop      | Queryable | Qualifier | Range |
| ---       | ---       | ---       | ---   |
| createdAt | No        | Yes       | Yes   |
| updatedAt | No        | No        | Yes   |
| username  | Yes       | No        | No    |
| email     | Yes       | No        | No    |
| realName  | Yes       | No        | No    |
| admin     | No        | Yes       | No    |
| developer | No        | Yes       | No    |

## Relationships

| Name      | Record                        | Type      | Endpoint              |
| ---       | ---                           | ---       | ---                   |
| apikeys   | [APIKey](APIKey)   | Child     | /api/v1/users/:id/apikeys |
| avatar   | [S3File](S3File)   | Child     | /api/v1/users/:id/avatar |

## Endpoints

### List

```
GET /api/v1/users
```

### Create
```
POST /api/v1/users

{
    "username" : "adufresne",
    "realName" : "Andy Dufresne",
    "password" : "rock hammer",
    "email" : "andy@shawshank.prison"
}
```

### Read
```
GET /api/v1/users/:id
```

### Update
```
PUT /api/v1/users/:id

{
    "useAsDisplayName" : "realName"
}
```

### Delete
```
DELETE /api/v1/users/:id
```

### Options
```
GET /api/v1/users/options
```

### Who Am I?
Returns a user record for the currently logged in user based upon the session passed.
```
GET /api/v1/users/whoami
Cookie: vingSessionId=xxx
```

### Import Avatar
Attach an uploaded [S3File](S3File) to this user as an avatar.

```
PUT /api/v1/users/:id/import-avatar
Cookie: vingSessionId=xxx

{
    "s3FileId" : "xxx",
}
```
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
| apikeys   | [APIKey](APIKey)   | Child     | /api/user/:id/apikeys |
| avatar   | [S3File](S3File)   | Child     | /api/user/:id/avatar |

## Endpoints

### List

```
GET /api/user
```

### Create
```
POST /api/user

{
    "username" : "adufresne",
    "realName" : "Andy Dufresne",
    "password" : "rock hammer",
    "email" : "andy@shawshank.prison"
}
```

### Read
```
GET /api/user/:id
```

### Update
```
PUT /api/user/:id

{
    "useAsDisplayName" : "realName"
}
```

### Delete
```
DELETE /api/user/:id
```

### Options
```
GET /api/user/options
```

### Who Am I?
Returns a user record for the currently logged in user based upon the session passed.
```
GET /api/user/whoami
Cookie: vingSessionId=xxx
```

### Import Avatar
Attach an uploaded [S3File](S3File) to this user as an avatar.

```
PUT /api/user/:id/import-avatar
Cookie: vingSessionId=xxx

{
    "s3FileId" : "xxx",
}
```
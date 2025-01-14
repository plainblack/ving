---
outline: deep
---
# APIKey
Developers use an API Key to create a [Session](Session) via the Rest API and perform other functions that require validation.

## Filters

| Prop      | Queryable | Qualifier | Range |
| ---       | ---       | ---       | ---   |
| createdAt | No        | No        | Yes   |
| updatedAt | No        | No        | Yes   |
| name      | Yes       | No        | No    |

## Relationships

| Name      | Record                    | Type      | Endpoint              |
| ---       | ---                       | ---       | ---                   |
| user      | [User](User)   | Parent    | /api/v1/apikeys/:id/user  |

## Endpoints

### List

```
GET /api/v1/apikeys
```

### Create
```
POST /api/v1/apikeys
```

### Read
```
GET /api/v1/apikeys/:id
```

### Update
```
PUT /api/v1/apikeys/:id
```

### Delete
```
DELETE /api/v1/apikeys/:id
```

### Options
```
GET /api/v1/apikeys/options
```
---
outline: deep
---
# Session
In order to access privileged data you'll on any ving endpoint you'll need to pass a session id via an HTTP header cookie. 

## Relationships

| Name      | Record                        | Type      | Endpoint              |
| ---       | ---                           | ---       | ---                   |
| user      | [User](User)   | Parent    | /api/v1/sessions/:id/user  |

## Endpoints

### Login / Create
```
POST /api/v1/sessions

{
    "apiKey" : "1b8e4f16-08ca-4829-befe-865cec37679b",
    "privateKey" : "pk_fd17bc887c7a00a1fffcb06a97961806616e"
}
```

### Read
```
GET /api/v1/sessions/:id
Cookie: vingSessionId=xxx
```

### Logout / Delete
```
DELETE /api/v1/sessions/:id
Cookie: vingSessionId=xxx
```

Or

```
DELETE /api/v1/sessions
Cookie: vingSessionId=xxx
```

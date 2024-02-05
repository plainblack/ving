# Session
In order to access privileged data you'll on any ving endpoint you'll need to pass a session id via an HTTP header cookie. 

## Relationships

| Name      | Record                        | Type      | Endpoint              |
| ---       | ---                           | ---       | ---                   |
| user      | [User](User.html)   | Parent    | /api/apikey/:id/user  |

## Endpoints

### Login / Create
```
POST /api/session
```

### Read
```
GET /api/session/:id
Cookie: vingSessionId=xxx
```

### Logout / Delete
```
DELETE /api/session/:id
Cookie: vingSessionId=xxx
```

Or

```
DELETE /api/session
Cookie: vingSessionId=xxx
```

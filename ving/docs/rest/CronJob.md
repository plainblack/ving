---
outline: deep
---
# CronJob
Run background [jobs](../subsystems/jobs) on a set schedule.

## Filters

| Prop      | Queryable | Qualifier | Range |
| ---       | ---       | ---       | ---   |
| createdAt | No        | No        | Yes   |
| updatedAt | No        | No        | Yes   |
| schedule      | No       | Yes        | No    |
| handler      | No       | Yes        | No    |

## Endpoints

### List

```
GET /api/v1/cronjob
```

### Create
```
POST /api/v1/cronjob
```

### Read
```
GET /api/v1/cronjob/:id
```

### Update
```
PUT /api/v1/cronjob/:id
```

### Delete
```
DELETE /api/v1/cronjob/:id
```

### Options
```
GET /api/v1/cronjob/options
```
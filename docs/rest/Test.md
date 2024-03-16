---
outline: deep
---
# Test
Use this endpoint to test that you can post query params and body params to a ving service.

## Endpoints

```
GET /api/v1/test
```
```
POST /api/v1/test
```
```
PUT /api/v1/test
```
```
DELETE /api/v1/test
```

### Query Params
Any query params you post will be returned to you in the JSON response.

### Body Params
On `POST` and `PUT` endpoints any body params will be returned to you in the JSON response.

### Response Example

```json
{
  "success": true,
  "serverTime": "2023-05-09T00:19:35.151Z",
  "httpMethod": "GET",
  "query": {
    "foo": "bar"
  }
}
```
---
outline: deep
---
# S3File
S3File is the file upload system of Ving. 

The process of uploading a file happens in 3 steps:

- Get a presigned URL for S3
- Upload to S3
- Post back to import the file for use on some other Ving Record

Here's a bit more detail:

```
Browser / Your Code --> POST filename and content type to /api/v1/s3files
                            * creates an S3File and sets its status to pending
                            * generates a Presigned URL for S3
                    <-- Return S3File description, including meta.presignedUrl

                    --> PUT s3file.meta.presignedUrl
                            * stores file in S3
                    <-- Return nothing

                    --> PUT s3file.props.id to an import API such as /api/v1/users/:id/import-avatar
                            * post processes the file uploaded to S3
                            * verifies that the file conforms to the import rules
                    <-- Return updated record such as User
```

## Filters

| Prop          | Queryable | Qualifier | Range |
| ---           | ---       | ---       | ---   |
| createdAt     | No        | No        | Yes   |
| updatedAt     | No        | No        | Yes   |
| filename      | Yes       | No        | No    |
| sizeInBytes   | No        | Yes       | Yes   |
| extension     | No        | Yes       | No    |
| userId        | No        | Yes       | No    |

## Relationships

| Name          | Record              | Type      | Endpoint              |
| ---           | ---                 | ---       | ---                   |
| user          | [User](User)   | Parent    | /api/v1/s3files/:id/user  |
| avatarUsers   | [User](User)   | Child     | /api/v1/s3files/:id/avatarusers  |

## Endpoints

### List

```
GET /api/v1/s3files
```

### Create
```
POST /api/v1/s3files
```
You won't actually post the file here. You post the `filename`, `contentType`, and `sizeInBytes` here and it will return a `presignedUrl` in the `meta` section. 


### Read
```
GET /api/v1/s3files/:id
```

### Update
```
PUT /api/v1/s3files/:id
```

### Delete
```
DELETE /api/v1/s3files/:id
```

### Options
```
GET /api/v1/s3files/options
```
const UserSchema = {
    "name": "User",
    "dbName": null,
    "fields": [
        {
            "name": "id",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": true,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "String",
            "default": {
                "name": "uuid",
                "args": []
            },
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [],
                "viewBy": [
                    "public"
                ]
            }
        },
        {
            "name": "createdAt",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "DateTime",
            "default": {
                "name": "now",
                "args": []
            },
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [],
                "viewBy": [
                    "public"
                ]
            }
        },
        {
            "name": "updatedAt",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "DateTime",
            "default": {
                "name": "now",
                "args": []
            },
            "isGenerated": false,
            "isUpdatedAt": true,
            "ving": {
                "options": [],
                "editBy": [],
                "viewBy": [
                    "public"
                ]
            }
        },
        {
            "name": "username",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [
                    "owner"
                ],
                "viewBy": []
            }
        },
        {
            "name": "email",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": true,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [
                    "owner"
                ],
                "viewBy": []
            }
        },
        {
            "name": "password",
            "kind": "scalar",
            "isList": false,
            "isRequired": false,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [],
                "viewBy": []
            }
        },
        {
            "name": "passwordType",
            "kind": "enum",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "passwordTypes",
            "default": "bcrypt",
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [
                    {
                        "value": "bcrypt",
                        "label": "B-Crypt"
                    }
                ],
                "editBy": [],
                "viewBy": []
            }
        },
        {
            "name": "realName",
            "kind": "scalar",
            "isList": false,
            "isRequired": false,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "String",
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [
                    "owner"
                ],
                "viewBy": []
            }
        },
        {
            "name": "useAsDisplayName",
            "kind": "enum",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "displayNameTypes",
            "default": "username",
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [
                    {
                        "value": "username",
                        "label": "Username"
                    },
                    {
                        "value": "realName",
                        "label": "Real Name"
                    },
                    {
                        "value": "email",
                        "label": "Email Address"
                    }
                ],
                "editBy": [
                    "owner"
                ],
                "viewBy": []
            }
        },
        {
            "name": "admin",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "Boolean",
            "default": false,
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [
                    {
                        "value": true,
                        "label": "Admin"
                    },
                    {
                        "value": false,
                        "label": "Not Admin"
                    }
                ],
                "editBy": [
                    "admin"
                ],
                "viewBy": [
                    "owner"
                ]
            }
        },
        {
            "name": "developer",
            "kind": "scalar",
            "isList": false,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": true,
            "type": "Boolean",
            "default": false,
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [
                    {
                        "value": true,
                        "label": "Software Developer"
                    },
                    {
                        "value": false,
                        "label": "Not Software Developer"
                    }
                ],
                "editBy": [
                    "owner"
                ],
                "viewBy": [
                    "owner"
                ]
            }
        },
        {
            "name": "apiKeys",
            "kind": "object",
            "isList": true,
            "isRequired": true,
            "isUnique": false,
            "isId": false,
            "isReadOnly": false,
            "hasDefaultValue": false,
            "type": "APIKey",
            "relationName": "APIKeyToUser",
            "relationFromFields": [],
            "relationToFields": [],
            "isGenerated": false,
            "isUpdatedAt": false,
            "ving": {
                "options": [],
                "editBy": [],
                "viewBy": [
                    "owner"
                ]
            }
        }
    ],
    "ving": {
        "owner": [
            "admin",
            "$id"
        ]
    }
}
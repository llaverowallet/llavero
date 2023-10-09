 const UserSchema = {
    "format": "onetable:1.1.0",
    "indexes": {
        "primary": {
            "hash": "pk",
            "sort": "sk"
        }
    },
    "models": {
        "Networks": {
            "created": {
                "type": Date
            },
            "sk": {
                "type": String,
                "value": "Networks#${networkId}",
                "required": true
            },
            "name": {
                "type": String,
                "required": true,
                "unique": false
            },
            "networkId": {
                "type": String,
                "generate": "uuid",
                "required": true,
                "unique": true
            },
            "pk": {
                "type": String,
                "value": "User#${userId}",
                "required": true
            },
            "jsonRpc": {
                "type": String,
                "required": true,
                "unique": false
            },
            "updated": {
                "type": Date
            },
            "username": {
                "type": String,
                "required": true
            }
        },
        "User": {
            "mail": {
                "type": String,
                "required": true,
                "unique": true
            },
            "created": {
                "type": Date
            },
            "sk": {
                "type": String,
                "value": "User#{userId}",
                "required": true,
                "unique": true
            },
            "name": {
                "type": String,
                "required": true
            },
            "cellphone": {
                "type": String,
                "unique": true
            },
            "pk": {
                "type": String,
                "value": "User#${username}",
                "required": true,
                "unique": true
            },
            "updated": {
                "type": Date
            },
            "userId": {
                "type": String,
                "generate": "uuid",
                "required": true,
                "unique": true
            },
            "username": {
                "type": String,
                "required": true,
                "unique": true
            }
        },
        "Keys": {
            "keyArn": {
                "type": String,
                "required": true,
                "unique": true
            },
            "created": {
                "type": Date
            },
            "sk": {
                "type": String,
                "value": "Keys#${keyArn}",
                "required": true
            },
            "name": {
                "type": String,
                "required": true,
                "unique": false
            },
            "description": {
                "type": String,
                "nulls": true
            },
            "pk": {
                "type": String,
                "value": "User#${userId}",
                "required": true
            },
            "id": {
                "type": String,
                "generate": "uuid",
                "required": true,
                "unique": true
            },
            "updated": {
                "type": Date
            },
            "username": {
                "type": String,
                "required": true
            }
        }
    },
    "params": {
        "nulls": true,
        "isoDates": true,
        "timestamps": true,
        "typeField": "_type"
    },
    "queries": {},
    "version": "1.0.0"
}

export default UserSchema;
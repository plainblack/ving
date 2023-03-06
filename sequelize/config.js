require('dotenv').config();
const URL = require('node:url').URL;
const db = new URL(process.env.DATABASE);

module.exports =
{
  "development": {
    "username": db.username,
    "password": db.password,
    "database": db.pathname.slice(1),
    "port": db.port,
    "host": db.hostname,
    "dialect": db.protocol.slice(0, -1),
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
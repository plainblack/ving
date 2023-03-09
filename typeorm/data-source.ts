import "reflect-metadata";
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from "typeorm";
import { User } from "./entity/User.js";
import { URL } from 'node:url';
const dbConfig = new URL(process.env.TYPEORM_DATABASE || '');

export const AppDataSource = new DataSource({
    type: dbConfig.protocol.slice(0, -1) as "mysql" | "postgres",
    host: dbConfig.hostname,
    port: parseInt(dbConfig.port),
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.pathname.slice(1),
    logging: false,
    entities: [User],
    migrations: [process.cwd() + '/typeorm/migrations/*.js'],
    subscribers: [],
})

export const initialize = async () => {
    console.log('DB: Initializing DB connection')

    if (AppDataSource.isInitialized) {
        console.log('DB: Already initialized')
        return
    }

    try {
        await AppDataSource.initialize()
    } catch (error) {
        console.trace('DB: Failed to initialized database', error)
        throw error
    }

    console.log('DB: Successfully initialized database connection')
}
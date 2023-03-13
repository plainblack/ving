import "reflect-metadata";
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { APIKey } from "./entity/APIKey";
import { URL } from 'node:url';
import { ouch } from '../app/helpers';
const dbConfig = new URL(process.env.TYPEORM_DATABASE || '');

export const AppDataSource = new DataSource({
    type: dbConfig.protocol.slice(0, -1) as "mysql" | "postgres",
    host: dbConfig.hostname,
    port: parseInt(dbConfig.port),
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.pathname.slice(1),
    logging: false,
    entities: [User, APIKey],
    migrations: [process.cwd() + '/typeorm/migrations/*.js'],
    subscribers: [],
})

export const initialize = async () => {
    if (AppDataSource.isInitialized) {
        console.warn('DB: Already initialized')
        return
    }

    try {
        await AppDataSource.initialize()
    } catch (error) {
        console.trace('DB: Failed to initialized database', error)
        throw ouch(504, error);
    }
}
import { LoadStrategy, EntityCaseNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
const URL = require('node:url').URL;
const dbConfig = new URL(process.env.MIKROORM_DATABASE);

export default defineConfig({
    type: dbConfig.protocol.slice(0, -1),
    host: dbConfig.hostname,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    dbName: dbConfig.pathname.slice(1),
    entities: ['./.output/mikro-orm/modules/*.js'],
    entitiesTs: ['./mikro-orm/modules/*.ts'],
    baseDir: process.cwd(),
    debug: true,
    loadStrategy: LoadStrategy.JOINED,
    //    namingStrategy: EntityCaseNamingStrategy,
    highlighter: new SqlHighlighter(),
    forceUtcTimezone: true,
    // for vitest to get around `TypeError: Unknown file extension ".ts"` (ERR_UNKNOWN_FILE_EXTENSION)
    dynamicImportProvider: id => import(id),
    metadataProvider: TsMorphMetadataProvider,
    extensions: [Migrator, EntityGenerator],
    migrations: {
        path: './.output/mikro-orm/migrations/',
        pathTs: './mikro-orm/migrations/',
    },
});

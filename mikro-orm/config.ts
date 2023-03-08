import { LoadStrategy, EntityCaseNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { UserSchema } from './entities';

export default defineConfig({
    host: 'localhost',
    port: 3306,
    user: 'ving',
    password: 'vingPass',
    dbName: 'mikroorm',
    entities: ['this/does/not/matter'],
    entitiesTs: ['./mikro-orm/entities/*.entity.ts'],
    baseDir: process.cwd(),
    // entities: [UserSchema],
    debug: true,
    loadStrategy: LoadStrategy.JOINED,
    namingStrategy: EntityCaseNamingStrategy,
    highlighter: new SqlHighlighter(),
    forceUtcTimezone: true,
    metadataProvider: TsMorphMetadataProvider,
    extensions: [Migrator, EntityGenerator],
    migrations: {
        pathTs: './mikro-orm/migrations/',
    },
});

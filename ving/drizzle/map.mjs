import { APIKeyTable } from "#ving/drizzle/schema/APIKey.mjs";
import { UserTable } from "#ving/drizzle/schema/User.mjs";
import { CronJobTable } from "#ving/drizzle/schema/CronJob.mjs";
import { S3FileTable } from "#ving/drizzle/schema/S3File.mjs";

export const tableModules = {
    User: UserTable,
    APIKey: APIKeyTable,
    CronJob: CronJobTable,
    S3File: S3FileTable,
};
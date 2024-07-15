import { APIKeyRecord, APIKeyKind } from "#ving/record/records/APIKey.mjs";
import { UserRecord, UserKind } from "#ving/record/records/User.mjs";
import { CronJobRecord, CronJobKind } from "#ving/record/records/CronJob.mjs";
import { S3FileRecord, S3FileKind } from "#ving/record/records/S3File.mjs";

export const recordModules = {
    User: UserRecord,
    APIKey: APIKeyRecord,
    CronJob: CronJobRecord,
    S3File: S3FileRecord,
};

export const kindModules = {
    User: UserKind,
    APIKey: APIKeyKind,
    CronJob: CronJobKind,
    S3File: S3FileKind,
};
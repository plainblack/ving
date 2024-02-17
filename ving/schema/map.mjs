import { userSchema } from "#ving/schema/schemas/User.mjs";
import { apikeySchema } from "#ving/schema/schemas/APIKey.mjs";
import { s3fileSchema } from "#ving/schema/schemas/S3File.mjs";

export const vingSchemas = [
    userSchema,
    apikeySchema,
    s3fileSchema,
];
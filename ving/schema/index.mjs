import { userSchema } from "./schemas/User.mjs";
import { apikeySchema } from "./schemas/APIKey.mjs";
import { s3fileSchema } from "./schemas/S3File.mjs";

export const vingSchemas = [
    userSchema,
    apikeySchema,
    s3fileSchema,
];
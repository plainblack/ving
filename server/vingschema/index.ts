import { vingSchema } from '../../types/vingschema'
import { userSchema } from "./schemas/User";
import { apikeySchema } from "./schemas/APIKey";

export const vingSchemas: vingSchema[] = [
    userSchema,
    apikeySchema,
];
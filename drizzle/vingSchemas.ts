import { vingSchema } from '../types/db'
import { userSchema } from "./schema/users";
import { apikeySchema } from "./schema/apikeys";

export const vingSchemas: vingSchema[] = [
    userSchema,
    apikeySchema,
];
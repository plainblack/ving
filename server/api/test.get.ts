import { UserSchema } from '~~/mikro-orm/modules/User';

export default defineEventHandler(async (event) => {
    return Object.keys(new UserSchema._meta.class());
})

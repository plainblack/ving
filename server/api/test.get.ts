import { UserSchema } from '~/mikro-orm/entities/User.entity';

export default defineEventHandler(async (event) => {
    return Object.keys(new UserSchema._meta.class());
})

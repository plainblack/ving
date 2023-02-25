import { Users } from '~/utils/db';
import { vingDescribe, vingSession } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    const user = await session.user();
    return await user.describe(vingDescribe(event));
})

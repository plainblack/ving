import { Users } from '~~/app/db';
import { vingDescribe, vingSession } from '~~/app/helpers';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    const user = await session.user();
    return await user.describe(vingDescribe(event));
})

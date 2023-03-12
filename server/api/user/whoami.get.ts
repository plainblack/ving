import { vingDescribe, vingSession, ouch } from '../../../app/helpers';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    try {
        const user = await session.user();
        return await user.describe(vingDescribe(event));
    }
    catch {
        throw ouch(401, 'Session not found.')
    }
})

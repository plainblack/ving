import { describeParams, obtainSession } from '../../utils/rest';
import { ouch } from '../../../utils/ouch';
export default defineEventHandler(async (event) => {
    const session = obtainSession(event);
    try {
        const user = await session.user();
        return await user.describe(describeParams(event));
    }
    catch {
        throw ouch(401, 'Session not found.')
    }
})

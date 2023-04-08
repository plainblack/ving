import { vingSession, vingBody } from '../../helpers';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    const body = await vingBody(event);
    useCache().set('system-wide-alert', body, body.ttl);
    return body;
});
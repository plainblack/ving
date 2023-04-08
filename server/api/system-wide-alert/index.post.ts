import { vingSession, vingBody } from '../../helpers';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    console.log(session);
    session.isRoleOrDie('admin');
    const body = await vingBody(event);
    await useCache().set('system-wide-alert', body, body.ttl);
    return body;
});
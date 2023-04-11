import { obtainSessionIfRole, getBody } from '../../utils/rest';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    obtainSessionIfRole(event, 'admin');
    const body = await getBody(event);
    await useCache().set('system-wide-alert', body, body.ttl);
    return body;
});
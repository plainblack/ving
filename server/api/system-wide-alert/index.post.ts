import { vingSessionIsRole, vingBody } from '../../helpers';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    vingSessionIsRole(event, 'admin');
    const body = await vingBody(event);
    await useCache().set('system-wide-alert', body, body.ttl);
    return body;
});
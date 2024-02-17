import { obtainSessionIfRole, getBody } from '#ving/utils/rest.mjs';
import { useCache } from '#ving/cache.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    obtainSessionIfRole(event, 'admin');
    const body = await getBody(event);
    await useCache().set('system-wide-alert', body, body.ttl);
    return body;
});
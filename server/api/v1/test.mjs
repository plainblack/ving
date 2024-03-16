import { getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const httpMethod = event.method;
    const out = {
        success: true,
        serverTime: new Date(),
        httpMethod,
        query,
    }
    if (['POST', 'PUT'].includes(httpMethod)) {
        out.body = await getBody(event);
    }
    return out;
});
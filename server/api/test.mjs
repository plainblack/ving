import { getBody } from '../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const httpMethod = getMethod(event)
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
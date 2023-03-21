import { vingBody } from '../helpers';
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const httpMethod = getMethod(event)
    const out: { success: boolean, serverTime: Date, query: object, httpMethod: string, body?: object } = {
        success: true,
        serverTime: new Date(),
        httpMethod,
        query,
    }
    if (['POST', 'PUT'].includes(httpMethod)) {
        out.body = await vingBody(event);
    }
    return out;
});
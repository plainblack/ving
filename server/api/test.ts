import { ouch } from '~/utils/utils';
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    //const body = await readBody(event);
    console.log(query);
    //console.log(body);
    let error = createError({ statusCode: 911, data: { foo: 'bar' }, message: 'this is the message', statusMessage: 'status message' });
    // throw ouch(403, 'fooey', 'baz');
    return { foo: 'bar', bar: 'baddy' };
});

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    //const body = await readBody(event);
    console.log(query);
    //console.log(body);
    return { foo:'bar', bar:'baddy' };
});

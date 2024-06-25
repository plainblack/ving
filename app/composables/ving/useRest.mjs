/**
 * A wrapper around the Nuxt composable `$fetch()` that allows for streamlined fetches, but integrate's with ving's subsystems.
 * 
 * @param url An endpoint that you wish to interact with like `/api/v1/user`.
 * @param behavior An object that modifies the behavior of this function.
 * @returns It ultimately returns an object that looks like:
 *
 *```json
 *{
 *    "data" : {},
 *    "error" : null,
 *}
 *```
 *
 * The `error` is `null` unless there is an error, and the `data` contains an object response from the endpoint.
 * @example
 * const response = await useRest('/api/v1/user/xxx')
 */
export default async function (url, behavior = {}) {
    const notify = useNotify();
    const throbber = useThrobber();
    let error = null
    const response = await $fetch(url, {
        method: behavior.method || 'get',
        query: behavior.query,
        body: behavior.body,
        headers: {
            //...useRequestHeaders(),
            cookie: useRequestHeader('cookie'), // see https://github.com/plainblack/ving/issues/168
            ...behavior.headers
        },
        async onRequest(context) {
            throbber.working();
        },
        async onRequestError(context) {
            throbber.done();
        },
        async onResponse(context) {
            throbber.done();
        },
        async onResponseError(context) {
            throbber.done();
            console.dir(context)
            if (!behavior.suppressErrorNotifications)
                notify.error(context.response._data.message || context.response.statusText);
        },
    }).catch((_error) => {
        error = { response: _error.response, request: _error.request };
        return null
    })
    return {
        error: error,
        data: response,
    }
}
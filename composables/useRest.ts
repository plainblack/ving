type Behavior = {
    /** Defaults to `false`, but if `true` will hide ving error notifications in the UI. */
    suppressErrorNotifications?: boolean,
    /** HTTP method. Defaults to `get`. */
    method?: 'get' | 'post' | 'put' | 'delete',
    /** An object containing query paramters. */
    query?: any,
    /** An object containing body parameters. */
    body?: Record<string, any>,
    /** An object containing HTTP headers. */
    headers?: Record<string, string>
}

/**
 * A wrapper around the Nuxt composable `$fetch()` that allows for streamlined fetches, but integrate's with ving's subsystems.
 * 
 * Usage: `const response = await useRest('/api/user/xxx')`
 * 
  * 
 * @param url An endpoint that you wish to interact with like `/api/user`.
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
 */
export default async function (url: string, behavior: Behavior = {}) {
    const notify = useNotifyStore();
    const throbber = useThrobberStore();
    let error = null
    const response = await $fetch(url, {
        method: behavior.method || 'get',
        query: behavior.query,
        body: behavior.body,
        headers: {
            ...useRequestHeaders() as any,
            ...behavior.headers
        },
        async onRequest(context: any) {
            throbber.working();
        },
        async onRequestError(context: any) {
            throbber.done();
        },
        async onResponse(context: any) {
            throbber.done();
        },
        async onResponseError(context: any) {
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
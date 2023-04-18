type Behavior = {
    suppressErrorNotifications?: boolean,
    method?: 'get' | 'post' | 'put' | 'delete',
    query?: any,
    body?: Record<string, any>,
    headers?: Record<string, string>
}

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
                notify.error(context.response._data.message);
        },
    }).catch((_error) => {
        // console.error('Fetch error', url, _error)
        error = _error
        return null
    })
    return {
        error: ref(error),
        data: ref(response)
    }
}
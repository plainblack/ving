type Behavior = {
    suppressErrorNotifications?: boolean,
    method?: 'get' | 'post' | 'put' | 'delete',
    query?: any,
    body?: Record<string, any>,
    headers?: Record<string, string>
}

export default (url: string, behavior: Behavior) => {
    const notify = useNotifyStore();
    const throbber = useThrobberStore();
    return useFetch(url, {
        method: behavior.method || 'get',
        query: behavior.query,
        body: behavior.body,
        headers: behavior.headers,
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
    })
}
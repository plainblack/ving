// this may go nowhere
import { createHooks } from "hookable";


const sseHooks = createHooks()

export const useSSE = (event, hookName) => {
    setHeader(event, 'content-type', 'text/event-stream')
    setHeader(event, 'cache-control', 'no-cache')
    setHeader(event, 'connection', 'keep-alive')
    setResponseStatus(event, 200)

    let id = 0

    sseHooks.hook(hookName, (data) => {
        event.node.res.write(`id: ${id += 1}\n`)
        event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
        event.node.res.flushHeaders()
    })


    const send = (id) => {
        sseHooks.callHook(hookName, callback(id))
    }

    const close = () => {
        event.node.res.end()
    }

    event._handled = true
    event.node.req.on("close", close)

    return { send, close }
}
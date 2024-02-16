import { setHeader, setResponseStatus, defineEventHandler, sendNoContent } from 'h3';
import { useMessageBusSub } from '../../messagebus.mjs';
import { obtainSession } from '../../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    const user = obtainSession(event);
    if (!user) {
        return sendNoContent(event);
    }
    const messagebus = useMessageBusSub();
    const hangup = async () => {
        console.log('ending sse stream');
        await messagebus.quit()
    }
    event.node.req.on('close', hangup)
    event.node.req.on('end', hangup)
    setHeader(event, 'cache-control', 'no-cache');
    setHeader(event, 'connection', 'keep-alive');
    setHeader(event, 'content-type', 'text/event-stream');
    setResponseStatus(event, 200);
    event.node.res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
    await messagebus.subscribe("notify:" + user.get('id'), (err) => {
        if (err) {
            console.error("Failed to subscribe: %s", err.message);
        }
    });
    messagebus.on("message", (channel, message) => {
        event.node.res.write(`data: ${message}\n\n`);
    });
});
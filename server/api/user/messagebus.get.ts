import { setHeader, setResponseStatus } from 'h3';
import { useMessageBusSub } from '../../messagebus';
import { obtainSession } from '../../utils/rest';
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
    // event.node.res.writeHead(200, {
    //      'content-type': 'text/event-stream'
    // })
    //event.node.res.setHeader('content-type', 'text/event-stream');
    //event.node.res.flushHeaders();
    event.node.res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
    //await sendStream(event, 'data: hello\n\n');
    let i = 1;
    const send = () => {
        console.log(`writing ${i}`)
        event.node.res.write(`data: ${i}\n\n`);
        i++;
        setTimeout(() => send(), 1000);
    }
    // send();
    await messagebus.subscribe("notify:" + user.get('id'), (err) => {
        if (err) {
            console.error("Failed to subscribe: %s", err.message);
        }
    });
    messagebus.on("message", (channel, message) => {
        event.node.res.write(`data: ${message}\n\n`);
    });
});
import { setHeader, setResponseStatus, defineEventHandler, sendNoContent } from 'h3';
import { spawnRedis } from '#ving/redis.mjs';

import { obtainSession } from '#ving/utils/rest.mjs';
import ving from '#ving/index.mjs';

export default defineEventHandler(async (event) => {
    const user = obtainSession(event);
    if (!user) {
        return sendNoContent(event);
    }
    const messagebus = spawnRedis();
    const hangup = async () => {
        ving.log('messageBus').info('ending sse stream');
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
            ving.log('messageBus').error(`Failed to subscribe: ${err.message}`);
        }
    });
    messagebus.on("message", (channel, message) => {
        event.node.res.write(`data: ${message}\n\n`);
    });
});
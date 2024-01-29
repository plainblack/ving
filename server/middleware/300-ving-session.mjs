import { Session } from '../session.mjs';
import { defineEventHandler, getCookie } from 'h3';
export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'vingSessionId');
    if (cookie) {
        try {
            event.context.ving.session = await Session.fetch(cookie);
        }
        catch { }
    }
});
import type { Session } from '../server/session.mjs';
declare module 'h3' {
    interface H3EventContext {
        ving: { session?: InstanceType<typeof Session> }
    }
}
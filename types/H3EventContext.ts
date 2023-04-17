import type { Session } from '../server/session';
declare module 'h3' {
    interface H3EventContext {
        ving: { session?: InstanceType<typeof Session> }
    }
}
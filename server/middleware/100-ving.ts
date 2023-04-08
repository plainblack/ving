import { Session } from '../session';
export default defineEventHandler((event) => {
    const vingContext: { session?: InstanceType<typeof Session> } = {};
    event.context.ving = vingContext;
})
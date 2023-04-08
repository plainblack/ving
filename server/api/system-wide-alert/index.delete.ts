import { vingSession } from '../../helpers';
import { cache } from '../../cache';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    await cache.delete('system-wide-alert');
    return { success: true };
});
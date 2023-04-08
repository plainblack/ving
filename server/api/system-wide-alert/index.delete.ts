import { vingSession } from '../../helpers';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    await useCache().delete('system-wide-alert');
    return { success: true };
});
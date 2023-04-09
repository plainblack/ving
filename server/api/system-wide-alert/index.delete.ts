import { vingSessionIsRole } from '../../helpers';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    vingSessionIsRole(event, 'admin');
    await useCache().delete('system-wide-alert');
    return { message: '', ttl: 1000 * 60 * 60, severity: 'success' };
});
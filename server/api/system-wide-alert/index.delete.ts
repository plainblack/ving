import { obtainSessionIfRole } from '../../utils/rest';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    obtainSessionIfRole(event, 'admin');
    await useCache().delete('system-wide-alert');
    return { message: '', ttl: 1000 * 60 * 60, severity: 'success' };
});
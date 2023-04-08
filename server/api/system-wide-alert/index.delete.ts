import { vingSession } from '../../helpers';
import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    session.isRoleOrDie('admin');
    await useCache().delete('system-wide-alert');
    return { message: '', ttl: 1000 * 60 * 60, severity: 'success' };
});
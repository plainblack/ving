import { useCache } from '../../cache';
export default defineEventHandler(async (event) => {
    return (await useCache().get('system-wide-alert')) || { message: '', ttl: 1000 * 60 * 60, severity: 'success' };
});
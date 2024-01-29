import { obtainSessionIfRole } from '../../utils/rest.mjs';
import { useCache } from '../../cache';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    obtainSessionIfRole(event, 'admin');
    await useCache().delete('system-wide-alert');
    return { message: '', ttl: 1000 * 60 * 60, severity: 'success' };
});
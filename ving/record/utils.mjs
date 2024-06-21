import { useDB } from '#ving/drizzle/db.mjs';

const kindCache = {};
/**
 * Instanciates a VingKind by name. 
 * 
 * @param {string} kind The name of the kind to instanciate. eg: `User`
 * @returns {VingKind} a `VingKind` subclass
 * @example
 * const users = useKind('User');
 */
export const useKind = async (kind) => {
    if (!(kind in kindCache)) {
        kindCache[kind] = {
            table: await import(`#ving/drizzle/schema/${kind}.mjs`),
            module: await import(`#ving/record/records/${kind}.mjs`),
        }
    }
    return new kindCache[kind]['module'][`${kind}Kind`](useDB(), kindCache[kind]['table'][`${kind}Table`], kindCache[kind]['module'][`${kind}Record`]);
}
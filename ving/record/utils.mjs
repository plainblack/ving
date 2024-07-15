import { useDB } from '#ving/drizzle/db.mjs';
import { tableModules } from '#ving/drizzle/map.mjs';
import { recordModules, kindModules } from '#ving/record/map.mjs';

/**
 * Instanciates a VingKind by name. 
 * 
 * @param {string} kind The name of the kind to instanciate. eg: `User`
 * @returns {VingKind} a `VingKind` subclass
 * @example
 * const users = useKind('User');
 */

export const useKind = async (kind) => {
    return new kindModules[kind](useDB(), tableModules[kind], recordModules[kind]);
}
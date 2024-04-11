import { readJSON } from '#ving/utils/fs.mjs';

let config = undefined;
/**
 * Reads `ving.json`
 * @returns An object with the contents of `ving.json`
 */
export const getConfig = async () => {
    if (config !== undefined)
        return config;
    config = await readJSON('./ving.json');
    return config;
}
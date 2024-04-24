import { readJSON } from '#ving/utils/fs.mjs';
import { isUndefined } from '#ving/utils/identify.mjs';

let config = undefined;
/**
 * Reads `ving.json`
 * @returns An object with the contents of `ving.json`
 */
export const getConfig = async () => {
    if (!isUndefined(config))
        return config;
    config = await readJSON('./ving.json');
    return config;
}
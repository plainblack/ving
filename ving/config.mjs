import { readFile } from 'fs/promises';

let config = undefined;
/**
 * Reads `ving.json`
 * @returns An object with the contents of `ving.json`
 */
export const getConfig = async () => {
    if (config !== undefined)
        return config;
    config = JSON.parse(
        await readFile(
            new URL('../ving.json', import.meta.url)
        )
    );
    return config;
}
import { readFile } from 'fs/promises';

/**
 * Reads `ving.json`
 * @returns An object with the contents of `ving.json`
 */
export const getConfig = async () => JSON.parse(
    await readFile(
        new URL('../ving.json', import.meta.url)
    )
);
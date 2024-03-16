import { readFileSync } from 'fs';

let config = undefined;
/**
 * Reads `ving.json`
 * @returns An object with the contents of `ving.json`
 */
export const getConfig = () => {
    if (config !== undefined)
        return config;
    config = JSON.parse(
        readFileSync(
            new URL('../ving.json', import.meta.url)
        )
    );
    return config;
}
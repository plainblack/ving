import fs from 'fs';
import sanitizeFilename from 'sanitize-filename';

/**
 * Note that any file you plan to read or write must get copied to the .output folder or be provided by an exteranl source
 * as the Nuxt build process will not copy files from the root of the project.
 */


/**
 * Detects whether a path is a directory.
 * @param {string} path 
 * @returns {boolean}
 * @example
 * isDir('./ving.json')
 */
export const isDir = (path) => {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

/**
 * Detects whether a path is a file.
 * @param {string} path 
 * @returns {boolean}
 * @example
 * isFile('./ving.json')
 */
export const isFile = (path) => {
    return fs.existsSync(path) && fs.lstatSync(path).isFile();
}

/**
 * Removes problematic characters from a filename.
 * @param {string} filename 
 * @returns {string}
 * @example
 * sanitize('foo %$@*!bar')
 */
export const sanitize = (filename) => {
    const fixed = filename.replace(/\s+/g, '_');
    return sanitizeFilename(fixed);
}

/**
 * Reads in a JSON file and returns an object.
 * @param {String} path 
 * @returns {object}
 * @example
 * await readJSON('./ving.json')
 */
export const readJSON = async (path) => {
    return JSON.parse(await fs.promises.readFile(path));
}

/**
 * Writes an object out to a JSON file.
 * @param {string} path 
 * @param {object} data 
 * @example
 * await writeJSON('./ving.json')
 */
export const writeJSON = async (path, data) => {
    await fs.promises.writeFile(path, JSON.stringify(data, undefined, 2));
}

/**
 * Makes a directory in the filesystem.
 * @param {string} path 
 * @example
 * await mkdir('./path/to/dir')
 */
export const mkdir = async (path) => {
    if (!fs.existsSync(path))
        await fs.promises.mkdir(path, { recursive: true });
}
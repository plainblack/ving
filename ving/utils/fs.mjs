import fs from 'fs';
import sanitizeFilename from 'sanitize-filename';

/**
 * Detects whether a path is a directory.
 * Usage: `isDir('./ving.json')`
 * @param {String} path 
 * @returns {Boolean}
 */
export const isDir = (path) => {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

/**
 * Detects whether a path is a file.
 * Usage: `isFile('./ving.json')`
 * @param {String} path 
 * @returns {Boolean}
 */
export const isFile = (path) => {
    return fs.existsSync(path) && fs.lstatSync(path).isFile();
}

/**
 * Removes problematic characters from a filename.
 * Usage: `sanitize('foo %$@*!bar')`
 * @param {String} filename 
 * @returns {String}
 */
export const sanitize = (filename) => {
    const fixed = filename.replace(/\s+/g, '_');
    return sanitizeFilename(fixed);
}

/**
 * Reads in a JSON file and returns an object.
 * Usage: `async readJSON('./ving.json')`
 * @param {String} path 
 * @returns {object}
 */
export const readJSON = async (path) => {
    return JSON.parse(await fs.promises.readFile(path));
}

/**
 * Writes an object out to a JSON file.
 * Usage: `async writeJSON('./ving.json')`
 * @param {string} path 
 * @param {object} data 
 *
 */
export const writeJSON = async (path, data) => {
    await fs.promises.writeFile(path, JSON.stringify(data, undefined, 2));
}

/**
 * Makes a directory in the filesystem.
 * Usage: `await mkdir('./path/to/dir')`
 * @param {*} path 
 */
export const mkdir = async (path) => {
    if (!fs.existsSync(path))
        await fs.promises.mkdir(path, { recursive: true });
}
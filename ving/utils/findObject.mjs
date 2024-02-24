import { ouch } from '#ving/utils/ouch.mjs';

/**
 * Finds the index of an object in a list based upon a passed in function
 * @param {Object[]} list A list of objects to search through
 * @param {Function} func A function that takes an object from the array as a parameter and then must return `true` if it matches in the list or `false` if it doesn't
 * @returns An integer representing the index of the first object that matches the defined `func`. Returns -1 if not found.
 */
export const findObjectIndex = (list, func) => {
    return list.findIndex((obj) => func(obj));
}

/** The same as `findObjectIndex()` except that it returns the object rather than the index
 * @param {Object[]} list A list of objects to search through
 * @param {Function} func A function that takes an object from the array as a parameter and then must return `true` if it matches in the list or `false` if it doesn't
 * @throws 404 if no object is found
 * @returns the first matching object found
 */
export const findObject = (list, func) => {
    const index = findObjectIndex(list, func);
    if (index >= 0) {
        return list[index];
    }
    else {
        throw ouch(404, `cannot find matching object in list`);
    }
}
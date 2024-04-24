/**
     * Checks if `value` is classified as an `Array` object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * isArray([1, 2, 3]); // => true
     *
     * isArray(document.body.children); // => false
     *
     * isArray('abc'); // => false
     */
export const isArray = Array.isArray;

/**
     * Checks if `value` is classified as a boolean primative.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
     * @example
     *
     * isBoolean(false); // => true
     * 
     * isBoolean(true); // => true
     *
     * isBoolean(null) // => false
     */

export const isBoolean = (value) => value === true || value === false;

/**
     * Checks if `value` is a function.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * isFunction(() => {})); // => true
     *     
     * isFunction(1); // => false
     */
export const isFunction = (value) => typeof value == 'function';

/**
     * Checks if `value` is `null` or `undefined` or `''`.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
     * @example
     *
     * isNil(null); // => true
     *
     * isNil(undefined); // => true
     * 
     * isNil(''); // => true
     *
     * isNil(0); // => false
     * 
     * isNil(false); // => false
     *
     * isNil('foo'); // => false
     */
export const isNil = (value) => value == null || value === '';

/**
     * Checks if `value` is `null`.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
     * @example
     *
     * isNull(null); // => true
     *
     * isNull(undefined); // => false
     */
export const isNull = (value) => value === null;


/**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a number, else `false`.
     * @example
     *
     * isNumber(3); // => true
     *
     * isNumber('3'); // => false
     */
export const isNumber = (value) => typeof value == 'number';

/**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * isObject({}); // => true
     *
     * isObject([1, 2, 3]); // => false
     *
     * isObject(null); // => false
     * 
     * isObject(() => {}); // => false
     */
export const isObject = (value) => value != null && typeof value == 'object' && !isArray(value);

/**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * isString('abc'); // => true
     *
     * isString(1); // => false
     */
export const isString = (value) => typeof value == 'string';

/**
    * Checks if `value` is `undefined`.
    *
    * @param {*} value The value to check.
    * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
    * @example
    *
    * isUndefined(void 0); // => true
    *
    * isUndefined(null); // => false
    */
export const isUndefined = (value) => value === undefined;
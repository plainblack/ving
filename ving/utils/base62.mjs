import ving from '#ving/index.mjs';
const charset = {
    byCode: {
        '0': 'A',
        '1': 'B',
        '2': 'C',
        '3': 'D',
        '4': 'E',
        '5': 'F',
        '6': 'G',
        '7': 'H',
        '8': 'I',
        '9': 'J',
        '10': 'K',
        '11': 'L',
        '12': 'M',
        '13': 'N',
        '14': 'O',
        '15': 'P',
        '16': 'Q',
        '17': 'R',
        '18': 'S',
        '19': 'T',
        '20': 'U',
        '21': 'V',
        '22': 'W',
        '23': 'X',
        '24': 'Y',
        '25': 'Z',
        '26': 'a',
        '27': 'b',
        '28': 'c',
        '29': 'd',
        '30': 'e',
        '31': 'f',
        '32': 'g',
        '33': 'h',
        '34': 'i',
        '35': 'j',
        '36': 'k',
        '37': 'l',
        '38': 'm',
        '39': 'n',
        '40': 'o',
        '41': 'p',
        '42': 'q',
        '43': 'r',
        '44': 's',
        '45': 't',
        '46': 'u',
        '47': 'w',
        '48': 'x',
        '49': 'y',
        '50': 'z',
        '51': '9',
        '52': '8',
        '53': '7',
        '54': '6',
        '55': '5',
        '56': '4',
        '57': '3',
        '58': '2',
        '59': '1',
        '60': '0',
        '61': '_'
    },
    byChar: {
        '0': 60,
        '1': 59,
        '2': 58,
        '3': 57,
        '4': 56,
        '5': 55,
        '6': 54,
        '7': 53,
        '8': 52,
        '9': 51,
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        E: 4,
        F: 5,
        G: 6,
        H: 7,
        I: 8,
        J: 9,
        K: 10,
        L: 11,
        M: 12,
        N: 13,
        O: 14,
        P: 15,
        Q: 16,
        R: 17,
        S: 18,
        T: 19,
        U: 20,
        V: 21,
        W: 22,
        X: 23,
        Y: 24,
        Z: 25,
        a: 26,
        b: 27,
        c: 28,
        d: 29,
        e: 30,
        f: 31,
        g: 32,
        h: 33,
        i: 34,
        j: 35,
        k: 36,
        l: 37,
        m: 38,
        n: 39,
        o: 40,
        p: 41,
        q: 42,
        r: 43,
        s: 44,
        t: 45,
        u: 46,
        w: 47,
        x: 48,
        y: 49,
        z: 50,
        _: 61
    },
    length: 62
};

/**
 * Converts an integer into an encoded string. The string will always start with a `v` and can contain any of these characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz9876543210_`. The output is chosen specifically to make the string easy to double-click and copy, as well as work as a CSS id, or an unquoted Javascript property name.
 * @param {number} int The number to encode
 * @param {string} prefix Optional. It provides a way to disambiguate ids between various stores. VingRecords will use their Kind, such as 'User' as the prefix.
 * @returns {string} An an encoded string.
 * @example
 * encode(8) // vDrKVRL
 */
export const encode = (int, prefix) => {
    if (int === 0)
        return charset.byCode[0];
    let res = "";
    while (int > 0) {
        res = charset.byCode[int % charset.length] + res;
        int = Math.floor(int / charset.length);
    }
    let out = 'v' + res;
    if (prefix)
        out = prefix + out;
    return out;
};

/**
 * Undecodes an encoded integer from the `encode()` function.
 * @param {string} value 
 * @returns {number} The original number that was encoded.
 * @example
 * decode('vDrKVRL') // 8
 */
export const decode = (value) => {
    const found = value.match('.*v(.*)');
    const str = found[1];
    let res = 0;
    let length = str.length;
    for (let i = 0; i < length; i++) {
        let char = str[i];
        res += charset.byChar[char] * Math.pow(charset.length, (length - i - 1));
    }
    return res;
};
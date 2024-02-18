import { ouch } from '#ving/utils/ouch.mjs';

export const findObjectIndex = (list, func) => {
    return list.findIndex((obj) => func(obj));
}

export const findObject = (list, func) => {
    const index = findObjectIndex(list, func);
    if (index >= 0) {
        return list[index];
    }
    else {
        throw ouch(404, `cannot find matching object in list`);
    }
}
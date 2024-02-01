import { ouch } from './ouch.mjs';

export const findObjectIndex = (field, value, list) => {
    return list.findIndex((obj) => obj[field] == value);
}

export const findObject = (field, value, list) => {
    const index = findObjectIndex(field, value, list);
    if (index >= 0) {
        return list[index];
    }
    else {
        throw ouch(404, `cannot find "${value}" in "${field.toString()}" of  object`);
    }
}
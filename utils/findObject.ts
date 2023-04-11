import { ouch } from './ouch';

export const findObjectIndex = <T>(field: keyof T, value: string, list: T[]): number => {
    return list.findIndex((obj: T) => obj[field] == value);
}

export const findObject = <T>(field: keyof T, value: string, list: T[]): T => {
    const index = findObjectIndex(field, value, list);
    if (index >= 0) {
        return list[index];
    }
    else {
        throw ouch(404, `cannot find "${value}" in "${field.toString()}" of  object`);
    }
}
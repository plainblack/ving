export const findObject = <T>(field: keyof T, value: string, list: T[]): T => {
    const index = list.findIndex((obj: T) => obj[field] == value);
    if (index >= 0) {
        return list[index];
    }
    else {
        throw new Ouch(440, 'cannot find "' + value + '" in "' + field.toString() + '" of  object');
    }
}

export const ucFirst = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export class Ouch extends Error {
    constructor(public code: number, public message: string, public cause?: string) {
        super(message, { cause });
        this.name = 'Ouch';
    }
}

export class NetOuch extends Ouch {
    constructor(public response: { status: number, statusText: string }) {
        super(response.status, response.statusText);
        this.name = 'NetOuch';
    }
}

export const bleep = (error: any): string => {
    if ('message' in error) {
        return error.message;
    }
    return error;
}

export const testRequired = (list: string[], params: Record<string, any>) => {
    for (const field of list) {
        if (!(field in params) || params[field] === undefined || params[field] == '') {
            throw new Ouch(441, `${field} is required.`, field);
        }
    }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
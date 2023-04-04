import { Describe, ModelName } from '~/types';

export type QueryParams = {
    includeOptions?: boolean,
    includeMeta?: boolean,
    includeRelated?: string[],
    includeExtra?: string[],
    includeLinks?: boolean,
};


export type VRCreateOptions<T extends ModelName> = {
    onError?: (result: Describe<T>) => void,
    onCreate?: (result: Describe<T>) => void,
}

export type VRUpdateOptions<T extends ModelName> = {
    onError?: (result: Describe<T>) => void,
    onUpdate?: (result: Describe<T>) => void,
}

export type VRDeleteOptions<T extends ModelName> = {
    onError?: (result: Describe<T>) => void,
    onDelete?: (result: Describe<T>) => void,
    skipConfirm?: boolean,
}

export type VingRecordParams<T extends ModelName> = {
    id?: string,
    props?: Describe<T>['props'],
    links?: Describe<T>['links'],
    meta?: Describe<T>['meta'],
    options?: Describe<T>['options'],
    related?: Describe<T>['related'],
    query?: QueryParams,
    warnings?: Describe<T>['warnings'],
    createApi?: string | undefined,
    fetchApi?: string | undefined,
    onFetch?: (result: Describe<T>) => void,
    onCreate?: (result: Describe<T>) => void,
    onUpdate?: (result: Describe<T>) => void,
    onDelete?: (result: Describe<T>) => void,
    onError?: (result: Describe<T>) => void,
    suppressErrorNotifications?: boolean,
    extendActions?: Record<string, ((...args: any) => any)>
}
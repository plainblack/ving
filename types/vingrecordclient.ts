import { Describe, ModelName } from '~/types';

export type VRQueryParams = {
    includeOptions?: boolean,
    includeMeta?: boolean,
    includeRelated?: string[],
    includeExtra?: string[],
    includeLinks?: boolean,
};

export type VRGenericOptions<T extends ModelName> = {
    onSuccess?: (result: Describe<T>) => void,
    onError?: (result: Describe<T>) => void
}

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
    query?: VRQueryParams,
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

export interface VingRecord<T extends ModelName> {
    props: Describe<T>['props'],
    links?: Describe<T>['links'],
    meta?: Describe<T>['meta'],
    options?: Describe<T>['options'],
    related?: Describe<T>['related'],
    warnings: Describe<T>['warnings'],
    query?: VRQueryParams,
    behavior: VingRecordParams<T>,
    setState(result: Describe<T>): void,
    dispatchWarnings(): void,
    getCreateApi(): string,
    getFetchApi(): string,
    fetch(): Promise<any>,
    save<K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]): Promise<any>,
    partialUpdate(props?: Describe<T>['props'], options?: VRUpdateOptions<T>): Promise<any>,
    update(options?: VRUpdateOptions<T>): Promise<any>,
    create(props?: Describe<T>['props'], options?: VRCreateOptions<T>): Promise<any>,
    getSelfApi(): string,
    delete(options?: VRDeleteOptions<T>): Promise<any> | undefined
}
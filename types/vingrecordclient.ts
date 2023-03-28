import { Describe, ModelName } from '~/types';

export type QueryParams = {
    includeOptions?: boolean,
    includeMeta?: boolean,
    includeRelated?: string[],
    includeExtra?: string[],
    includeLinks?: boolean,
};


export type VingRecordParams<T extends ModelName> = {
    props?: Describe<T>['props'],
    links?: Describe<T>['links'],
    meta?: Describe<T>['meta'],
    options?: Describe<T>['options'],
    related?: Describe<T>['related'],
    query?: QueryParams,
    warnings?: Describe<T>['warnings'],
    createApi?: string | undefined,
    fetchApi?: string | undefined,
    onCreate?: (result: Describe<T>, record: VingRecord<T>) => void
    onUpdate?: (result: Describe<T>, record: VingRecord<T>) => void
    onDelete?: (result: Describe<T>, record: VingRecord<T>) => void
}

export interface VingRecord<T extends ModelName> {
    props: Describe<T>['props'],
    links?: Describe<T>['links'],
    meta?: Describe<T>['meta'],
    options?: Describe<T>['options'],
    related?: Describe<T>['related'],
    warnings: Describe<T>['warnings'],
    query?: QueryParams,
    behavior: VingRecordParams<T>,
    setState(result: Describe<T>): void,
    dispatchWarnings(): void,
    getCreateApi(): string,
    getFetchApi(): string,
    fetch(): Promise<any>,
    _save<K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]): Promise<any>,
    save<K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]): Promise<any>,
    _partialUpdate(props?: Describe<T>['props'], options?: {}): Promise<any>,
    partialUpdate(props?: Describe<T>['props'], options?: {}): Promise<any>,
    update(options?: {}): Promise<any>,
    create(props?: Describe<T>['props'], options?: {}): Promise<any>,
}

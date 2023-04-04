import type { Describe, DescribeList, DescribeListParams, ModelName, VingRecord, QueryParams } from '~/types';

export type ListQueryParams = {
    itemsPerPage?: number,
    page?: number,
    sortOrder?: 'asc' | 'desc',
    orderBy?: string,
} & QueryParams

export type VRLGenericOptions<T extends ModelName> = {
    onSuccess?: (result: DescribeList<T>) => void,
    onError?: (result: DescribeList<T>) => void
}

export type VingRecordListParams<T extends ModelName> = {
    id?: string,
    newDefaults?: Describe<T>['props'],
    createApi?: string | undefined,
    optionsApi?: string | undefined,
    listApi?: string | undefined,
    query?: ListQueryParams,
    unshift?: boolean,
    onEach?: (result: Describe<T>) => void,
    onCreate?: (result: Describe<T>) => void,
    onUpdate?: (result: Describe<T>) => void,
    onDelete?: (result: Describe<T>) => void,
    onSearch?: (result: DescribeList<T>) => void,
    onAllDone?: () => void,
    suppressErrorNotifications?: boolean,
}

export type VRLCreateOptions<T extends ModelName> = {
    unshift?: boolean,
    onCreate?: (result: Describe<T>) => void,
    onError?: (result: Describe<T>) => void,
}

export type VRLSearchOptions<T extends ModelName> = {
    query?: DescribeListParams,
    accumulate?: boolean,
    page?: number,
    onSearch?: (result: DescribeList<T>) => void,
    onEach?: (result: Describe<T>) => void,
    onError?: (result: Describe<T>) => void,
}

export type VRLAllOptions<T extends ModelName> = VRLSearchOptions<T> & {
    onAllDone?: () => void,
}

export interface VingRecordList<T extends ModelName> {
    query: ListQueryParams,
    records: VingRecord<T>[],
    paging: DescribeList<T>['paging'],
    new: Partial<Describe<T>['props']>,
    resetNew(): void,
    listApi: string | undefined,
    createApi: string | undefined,
    propsOptions: Describe<T>['options'],
    itemsPerPageOptions: { value: number, label: string }[],
    findIndex(id: VingRecord<T>['props']['id']): number,
    find(id: VingRecord<T>['props']['id']): VingRecord<T>,
    mint(params: Describe<T>): VingRecord<T>,
    append(record: Describe<T>, options: VRLSearchOptions<T>): VingRecord<T>,
    getListApi(): string,
    getCreateApi(): string,
    search(options?: VRLSearchOptions<T>): Promise<any>,
    searchFast(options?: VRLSearchOptions<T>): Promise<any>,
    _search(options?: VRLSearchOptions<T>): Promise<any>,
    all(options?: VRLAllOptions<T>, page?: number): Promise<any>,
    _all(options?: VRLAllOptions<T>, page?: number): Promise<any>,
    reset(): VingRecordList<T>,
    call(method: "post" | "put" | "delete" | "get", url: string, query?: DescribeListParams, options?: VRLGenericOptions<T>): Promise<any>,
    getFieldOptionsApi(): string,
    fetchFieldOptions(options?: VRLGenericOptions<T>): void,
    create(props?: Describe<T>['props'], options?: VRLCreateOptions<T>): Promise<any>,
    update(index: number, options: {}): Promise<any>,
    save(index: number, prop: keyof Describe<T>['props']): Promise<any>,
    partialUpdate(index: number, props: Describe<T>['props'], options: {}): Promise<any>,
    delete(index: number, options: {}): Promise<any> | undefined,
    remove(id: Describe<T>['props']['id']): void,
}
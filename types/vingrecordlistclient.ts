import type { Describe, DescribeList, DescribeListParams, ModelName, VingRecord, VingRecordParams, QueryParams } from '~/types';

type VRLBasicOptions<T extends ModelName> = {
    onSuccess?: (result: DescribeList<T>) => void,
    onError?: (result: DescribeList<T>) => void
}

export type VingRecordListParams<T extends ModelName> = {
    newDefaults?: Describe<T>['props'],
    createApi?: string | undefined,
    optionsApi?: string | undefined,
    listApi?: string | undefined,
    query?: DescribeListParams,
    unshift?: boolean,
    onEach?: (result: Describe<T>, record: VingRecord<T>) => void
    onCreate?: (result: Describe<T>, record: VingRecord<T>) => void
    onUpdate?: (result: Describe<T>, record: VingRecord<T>) => void
    onDelete?: (result: Describe<T>, record: VingRecordList<T>) => void
} & VRLBasicOptions<T>

type VRLCreateOptions<T extends ModelName> = {
    unshift?: boolean,
} & VRLBasicOptions<T>

type VRLSearchOptions<T extends ModelName> = {
    query?: DescribeListParams,
    accumulate?: boolean,
    page?: number,
    onEach?: (result: Describe<T>, record: VingRecord<T>) => void
} & VRLBasicOptions<T>

type VRLAllOptions<T extends ModelName> = VRLSearchOptions<T> & {
    onAllDone?: () => void
}

export interface VingRecordList<T extends ModelName> {
    behavior: VingRecordListParams<T>,
    query: QueryParams,
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
    call(method: "post" | "put" | "delete" | "get", url: string, query?: DescribeListParams, options?: VRLBasicOptions<T>): Promise<any>,
    getFieldOptionsApi(): string,
    fetchFieldOptions(options?: VRLBasicOptions<T>): void,
    create(props?: Describe<T>['props'], options?: VRLCreateOptions<T>): Promise<any>,
    update(index: number, options: {}): Promise<any>,
    save(index: number, prop: keyof Describe<T>['props']): Promise<any>,
    partialUpdate(index: number, props: Describe<T>['props'], options: {}): Promise<any>,
    delete(index: number, options: {}): Promise<any> | undefined,
    remove(id: Describe<T>['props']['id']): void,
}
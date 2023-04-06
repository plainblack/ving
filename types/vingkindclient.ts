import type { Describe, DescribeList, DescribeListParams, ModelName, QueryParams } from '~/types';

export type VKQueryParams = {
    itemsPerPage?: number,
    page?: number,
    sortOrder?: 'asc' | 'desc',
    orderBy?: string,
} & QueryParams

export type VKGenericOptions<T extends ModelName> = {
    onSuccess?: (result: DescribeList<T>) => void,
    onError?: (result: DescribeList<T>) => void
}

export type VingKindParams<T extends ModelName> = {
    id?: string,
    newDefaults?: Describe<T>['props'],
    createApi?: string | undefined,
    optionsApi?: string | undefined,
    listApi?: string | undefined,
    query?: VKQueryParams,
    unshift?: boolean,
    onEach?: (result: Describe<T>) => void,
    onCreate?: (result: Describe<T>) => void,
    onUpdate?: (result: Describe<T>) => void,
    onDelete?: (result: Describe<T>) => void,
    onSearch?: (result: DescribeList<T>) => void,
    onAllDone?: () => void,
    suppressErrorNotifications?: boolean,
}

export type VKCreateOptions<T extends ModelName> = {
    unshift?: boolean,
    onCreate?: (result: Describe<T>) => void,
    onError?: (result: Describe<T>) => void,
}

export type VKSearchOptions<T extends ModelName> = {
    query?: DescribeListParams,
    accumulate?: boolean,
    page?: number,
    onSearch?: (result: DescribeList<T>) => void,
    onEach?: (result: Describe<T>) => void,
    onError?: (result: Describe<T>) => void,
}

export type VKAllOptions<T extends ModelName> = VKSearchOptions<T> & {
    onAllDone?: () => void,
}
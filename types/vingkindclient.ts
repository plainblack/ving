import type { Describe, DescribeList, DescribeListParams, ModelName, VRQueryParams } from '~/types';

export type VKQueryParams = Exclude<DescribeListParams, 'objectParams'> & VRQueryParams & {
    [key: string]: any,
}

export type VKGenericOptions<T extends ModelName> = {
    onSuccess?: (result: DescribeList<T>) => void,
    onError?: (result: Record<string, any>) => void
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
    onError?: (result: Record<string, any>) => void,
}

export type VKSearchOptions<T extends ModelName> = {
    /** Object full of query parameters.*/
    query?: DescribeListParams,
    /** Whether or not the `records` list should be `reset()` between `search()`es. */
    accumulate?: boolean,
    /** The page number to `search()` for. */
    page?: number,
    /** A function to be called when a `search` completes. */
    onSearch?: (result: DescribeList<T>) => void,
    /** A function to be called each time a record is fetched and added to `records`. */
    onEach?: (result: Describe<T>) => void,
    /** A function to be called if an API endpoint interaction has an exception. */
    onError?: (result: Record<string, any>) => void,
}

export type VKAllOptions<T extends ModelName> = VKSearchOptions<T> & {
    onAllDone?: () => void,
}
import type { Describe, DescribeList, DescribeListParams, ModelName, VRQueryParams } from '~/types';

export type VKQueryParams = Exclude<DescribeListParams, 'objectParams'> & VRQueryParams & {
    [key: string]: any,
}

export type VKGenericOptions<T extends ModelName> = {
    /** A function to be called when the response is successful */
    onSuccess?: (result: DescribeList<T>) => void,
    /** A function to be called if an API endpoint interaction has an exception. */
    onError?: (result: Record<string, any>) => void
}

export type VingKindParams<T extends ModelName> = {
    /** A list of defaults for properties that should be set when a new record is created */
    newDefaults?: Describe<T>['props'],
    /** A rest endpoint for for creating records of this kind */
    createApi?: string | undefined,
    /** A rest endpoint for fetching enumerated options of props */
    optionsApi?: string | undefined,
    /** A rest endpoint for fetching a list of records of this kind */
    listApi?: string | undefined,
    /** An object that contains standard query params for interacting with records of this kind */
    query?: VKQueryParams,
    /** Defaults to `false`, but if `true` will prepend new records on the `records` list */
    unshift?: boolean,
    /** A function to be called each time a record is fetched and added to `records`. */
    onEach?: (result: Describe<T>) => void,
    /** A function to be called when a new record is created */
    onCreate?: (result: Describe<T>) => void,
    /** A function to be called when a record has been updated */
    onUpdate?: (result: Describe<T>) => void,
    /** A function to be called when a record is deleted */
    onDelete?: (result: Describe<T>) => void,
    /** A function to be called when a page of records has been fetched */
    onSearch?: (result: DescribeList<T>) => void,
    /** A function to be called when the entire list of records associated with this kind have been loaded */
    onAllDone?: () => void,
    /** Defaults to `false`, but if true exceptions from rest endpoints on this kind will not be displayed to users */
    suppressErrorNotifications?: boolean,
}

export type VKCreateOptions<T extends ModelName> = {
    /** Defaults to `false`, but if `true` will prepend new records on the `records` list */
    unshift?: boolean,
    /** A function to be called when a new record is created */
    onCreate?: (result: Describe<T>) => void,
    /** A function to be called if an API endpoint interaction has an exception. */
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
    /** A function to be called when the entire list of records associated with this kind have been loaded */
    onAllDone?: () => void,
}
import { ModelName, ModelProps } from './db';

export type vingOption = {
    value: string | boolean,
    label: string
}

export type DescribeParams = {
    currentUser?: any //Session | UserRecord,
    include?: {
        options?: boolean,
        related?: string[],
        extra?: string[],
        links?: boolean,
        meta?: boolean,
        private?: boolean,
    }
}

export type DescribeListParams = {
    itemsPerPage?: number,
    pageNumber?: number,
    orderBy?: string,
    sortOrder?: 'asc' | 'desc',
    maxItems?: number,
    objectParams?: DescribeParams,
}


export type DescribeList<T extends ModelName> = {
    paging: {
        pageNumber: number
        nextPageNumber: number
        previousPageNumber: number
        itemsPerPage: number
        totalItems: number
        totalPages: number
    },
    items: Describe<T>[]
}

export type Describe<T extends ModelName> = {
    props: ModelProps<T>
    links?: Record<string, string>
    meta?: Record<string, any>
    extra?: Record<string, any>
    options?: {
        [property in keyof ModelProps<T>]?: vingOption[]
    }
    related?: {
        [key: string]: Describe<T>
    }
    /* relatedList?: { // not sure we're going to keep this.
         [key:string]:  DescribeList<T>
     }*/
    warnings?: { code: number, message: string }[]
}

export type warning = { code: number, message: string };
import type { UserProps, User } from './entity/User';

export type Model = {
    User: UserProps
}

export type ModelName = keyof Model;

export type ModelProps<T extends ModelName> = Partial<Model[T]>;

export type vingOption = {
    value: string | boolean,
    label: string
}

export type vingProp = {
    name: string,
    required: boolean,
    db: Record<string, any>,
    zod?: any,
    unique?: boolean,
    default: boolean | string | number | Date | undefined | (() => boolean | string | number | Date),
    enums?: readonly string[] | readonly boolean[],
    enumLabels?: string[],
    view: string[],
    edit: string[],
}

export type vingSchema = {
    kind: string,
    owner: string[]
    props: vingProp[]
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

export type AuthorizedUser = User;

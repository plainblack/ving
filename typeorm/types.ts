import type { UserProps, User, RoleOptions } from './entity/User';

export type Model = {
    User: UserProps
}

export type ModelName = keyof Model;

export type ModelProps<T extends ModelName> = Partial<Model[T]>;

export type vingOption = {
    value: string | boolean,
    label: string
}

export type vingProp<T extends ModelName> = {
    name: keyof ModelProps<T>,
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

export type vingSchema<T extends ModelName> = {
    kind: ModelName | 'VingRecord',
    owner: string[]
    props: vingProp<T>[]
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

export type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
};

export interface Constructable<T> {
    new(...args: any): T;
}

export type Roles = Pick<ModelProps<'User'>, ArrayToTuple<typeof RoleOptions>>;
export type ExtendedRoleOptions = keyof Roles | "public" | "owner" | string;

export type RoleProps = Roles & Pick<ModelProps<'User'>, 'id' | 'password'>;

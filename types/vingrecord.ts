import type { UserModel } from '../server/drizzle/schema/User';
import type { UserRecord } from '../server/vingrecord/records/Users';
import { RoleOptions } from '../server/vingschema/schemas/User';
import type { APIKeyModel } from '../server/drizzle/schema/APIKey';
import type { InferModel, AnyMySqlTable } from 'drizzle-orm/mysql-core';

type MakeModelMap<T extends Record<string, AnyMySqlTable>> = {
    [K in keyof T]: {
        model: T[K];
        select: InferModel<T[K], 'select'>;
        insert: InferModel<T[K], 'insert'>;
    };
};

export type ModelMap = MakeModelMap<{
    User: UserModel;
    APIKey: APIKeyModel;
}>;

export type ModelName = keyof ModelMap;

export type ModelSelect<T extends ModelName> = ModelMap[T]['select'];
export type ModelInsert<T extends ModelName> = ModelMap[T]['insert'];

export type AuthorizedUser = UserRecord;

export type Roles = Pick<ModelSelect<'User'>, typeof RoleOptions[number]>;
export type ExtendedRoleOptions = keyof Roles | "public" | "owner" | string;

export type RoleProps = Roles & Pick<ModelSelect<'User'>, 'id' | 'password'>;

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
    page?: number,
    orderBy?: string,
    sortOrder?: 'asc' | 'desc',
    maxItems?: number,
    objectParams?: DescribeParams,
}


export type DescribeList<T extends ModelName> = {
    paging: {
        page: number
        nextPage: number
        previousPage: number
        itemsPerPage: number
        totalItems: number
        totalPages: number
    },
    items: Describe<T>[]
}

export type Describe<T extends ModelName> = {
    props: Partial<ModelSelect<T>>
    links?: Record<string, string>
    meta?: Record<string, any>
    extra?: Record<string, any>
    options?: {
        [property in keyof Partial<ModelSelect<T>>]?: vingOption[]
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
import type { UserModel, UserSelect, UserInsert } from '../server/drizzle/schema/User';
import type { UserRecord } from '../server/vingrecord/Users';
import { RoleOptions } from '../server/vingschema/schemas/User';
import type { APIKeyModel, APIKeySelect, APIKeyInsert } from '../server/drizzle/schema/APIKey';

export type ModelMap = {
    User: { model: UserModel, select: UserSelect, insert: UserInsert },
    APIKey: { model: APIKeyModel, select: APIKeySelect, insert: APIKeyInsert },
}

export type ModelName = keyof ModelMap;

export type ModelSelect<T extends ModelName> = ModelMap[T]['select'];
export type ModelInsert<T extends ModelName> = ModelMap[T]['insert'];
export type ModelProps<T extends ModelName> = ModelMap[T]['select'];

export type AuthorizedUser = UserRecord;

export type Roles = Pick<ModelProps<'User'>, typeof RoleOptions[number]>;
export type ExtendedRoleOptions = keyof Roles | "public" | "owner" | string;

export type RoleProps = Roles & Pick<ModelProps<'User'>, 'id' | 'password'>;

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
    props: Partial<ModelProps<T>>
    links?: Record<string, string>
    meta?: Record<string, any>
    extra?: Record<string, any>
    options?: {
        [property in keyof Partial<ModelProps<T>>]?: vingOption[]
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
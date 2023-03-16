import type { AnyMySqlColumnBuilder } from 'drizzle-orm/mysql-core/columns/common';
import type { ZodTypeAny } from 'zod';
import type { User } from '../drizzle/schema/users';
import { RoleOptions } from '../drizzle/schema/users';
import type { APIKey } from '../drizzle/schema/apikeys';

export type Model = {
    User: User,
    APIKey: APIKey,
}

export type ModelName = keyof Model;

export type ModelProps<T extends ModelName> = Partial<Model[T]>;

export type AuthorizedUser = User;

export type Roles = Pick<ModelProps<'User'>, typeof RoleOptions[number]>;
export type ExtendedRoleOptions = keyof Roles | "public" | "owner" | string;

export type RoleProps = Roles & Pick<ModelProps<'User'>, 'id' | 'password'>;


export type vingProp = {
    name: string,
    //    name: keyof ModelProps<T>,
    length?: number,
    default: boolean | string | number | Date | undefined | (() => boolean | string | number | Date),
    db: (prop: vingProp) => AnyMySqlColumnBuilder,
    zod?: (prop: vingProp) => ZodTypeAny,
    required: boolean,
    relation?: {
        type: '1:n' | 'n:1' | 'n:n' | '1:1',
        name: string,
    },
    unique?: boolean,
    enums?: [string, ...string[]],
    enumLabels?: [string, ...string[]],
    view: string[],
    edit: string[],
    noSetAll?: boolean,
}

export type vingSchema = {
    kind: string,
    tableName: string,
    owner: string[]
    props: vingProp[],
}
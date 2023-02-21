import { prisma } from "./client";
import { VingKind, VingRecord, TProps, DescribeParams, IConstructable } from "./_Base";
import { APIKeyKind, APIKeyRecord } from "./APIKeys";
import { Ouch, ArrayToTuple } from '../utils';
import bcrypt from 'bcrypt';

export type TRoleProps = TRoles & Pick<TProps<'User'>, 'id'>;

export function RoleMixin<T extends IConstructable<{ props: TRoleProps }>>(Base: T) {
    return class RoleMixin extends Base {

        public isRole(role: TExtendedRoleOptions): boolean {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            if (role in this.props) {
                return this.props[role as keyof TRoles] || this.props.admin || false;
            }
            return false;
        }

        public isaRole(roles: TExtendedRoleOptions[]): boolean {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        }

        public isRoleOrThrow(role: keyof TRoles): boolean {
            if (this.isRole(role)) {
                return true;
            }
            throw new Ouch(450, `Not a member of ${role}`, role);
        }

    };
}

export const RoleOptions = ["admin", "developer"] as const;
export type TRoles = Pick<TProps<'User'>, ArrayToTuple<typeof RoleOptions>>;
export type TExtendedRoleOptions = keyof TRoles | "public" | "owner" | string;

export class UserRecord extends RoleMixin(VingRecord<'User'>) {

    public get displayName() {
        switch (this.props.useAsDisplayName) {
            case 'realName':
                return this.props.realName;
            case 'email':
                return this.props.email;
            default:
                return this.props.username;
        }
    }

    public async testPassword(password: string) {
        if (password == undefined || password == '' || this.props.password == undefined)
            throw new Ouch(441, 'You must specify a password.');
        let passed = false;
        if (this.props.passwordType == 'bcrypt')
            passed = bcrypt.compareSync(password, this.props.password);
        else
            throw new Ouch(440, 'validating other password types not implemented');
        if (passed) {
            if (this.props.passwordType != 'bcrypt') {
                this.setPassword(password)
                await this.update();
            }
            return true;
        }
        throw new Ouch(454, 'Password does not match.');
    }

    public setPassword(password: string) {
        this.props.password = bcrypt.hashSync(password, 10);
        this.props.passwordType = 'bcrypt';
    }

    public async describe(params?: DescribeParams) {
        const out = await super.describe(params);
        out.props.displayName = this.displayName;
        if (params && params.include && params.include.extra && params.include.extra.includes('foo')) {
            if (out.links === undefined) {
                out.links = {};
            }
            out.links.foo = 'foo';
        }
        return out;
    }

    public verifyPostedParams(params: TProps<'User'>, currentUser?: UserRecord) {
        super.verifyPostedParams(params, currentUser);
        if ('password' in params && params.password) {
            this.setPassword(params.password);
        }
        return true;
    }

    public get apiKeys() {
        return new APIKeyKind(prisma.aPIKey, APIKeyRecord, { userId: this.props.id });
    }

}

export class UserKind extends VingKind<'User', UserRecord>  {
    // add custom Kind code here
}

export const Users = new UserKind(prisma.user, UserRecord);
import { PrismaClient } from "@prisma/client";
import { VingKind, VingRecord, TProps, DescribeParams } from "./_Base";
import { APIKeys, APIKey } from "./APIKeys";
import { Ouch } from '../utils';
import bcrypt from 'bcrypt';

export type Roles = Pick<TProps<'User'>, "admin" | "developer">;
export type ExplicitRoleOptions = keyof Roles;
export type RoleOptions = ExplicitRoleOptions | "public" | "owner" | string;

export class User extends VingRecord<'User'> {

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

    public async validatePassword(password: string) {
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

    public verifyPostedParams(params: TProps<'User'>, currentUser?: User) {
        super.verifyPostedParams(params, currentUser);
        if ('password' in params && params.password) {
            this.setPassword(params.password);
        }
        return true;
    }

    public isRole(role: RoleOptions): boolean {
        if (role == 'public') return true;
        if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
        if (role in this.props) {
            return this.props[role as keyof Roles] || this.props.admin || false;
        }
        return false;
    }

    public isaRole(roles: RoleOptions[]): boolean {
        for (const role of roles) {
            const result = this.isRole(role);
            if (result) {
                return true;
            }
        }
        return false;
    }

    public isRoleOrThrow(role: keyof Roles): boolean {
        if (this.isRole(role)) {
            return true;
        }
        throw new Ouch(450, `${this.props.username} is not a member of ${role}`);
    }

    public get apiKeys() {
        return new APIKeys(new PrismaClient().aPIKey, APIKey, { userId: this.props.id });
    }

}

export class Users extends VingKind<'User', User>  {
    // add custom Kind code here
}

export default new Users(new PrismaClient().user, User);

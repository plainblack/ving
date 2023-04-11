import { RoleProps, ExtendedRoleOptions, Roles, Constructable } from '../../../types';
import { ouch } from '../../../utils/ouch';

export const RoleOptions = ["admin", "developer"] as const;

export function RoleMixin<T extends Constructable<{ getAll(): any, get<K extends keyof RoleProps>(key: K): RoleProps[K] }>>(Base: T) {
    class RoleMixin extends Base {

        public isRole(role: ExtendedRoleOptions): boolean {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            let props = this.getAll();
            if (role in props) {
                return props[role as keyof Roles] || props.admin || false;
            }
            return false;
        }

        public isaRole(roles: ExtendedRoleOptions[]): boolean {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        }

        public isRoleOrDie(role: keyof Roles): boolean {
            if (this.isRole(role)) {
                return true;
            }
            throw ouch(403, `Not a member of ${role}`, role);
        }

        public getRoleProp<K extends keyof RoleProps>(key: K): RoleProps[K] {
            return this.get(key);
        }
    }

    return RoleMixin as {
        new(...args: any): RoleMixin;
        prototype: any;
    } & T;
}
import { RoleProps, ExtendedRoleOptions, Roles } from '../../../types';
import { ouch } from '../../helpers';

export interface VingRole {
    isRole(role: ExtendedRoleOptions): boolean,
    isaRole(roles: ExtendedRoleOptions[]): boolean,
    isRoleOrThrow(role: keyof Roles): boolean,
    getRoleProp<K extends keyof RoleProps>(key: K): RoleProps[K],
}

export function useVingRole({ getAll, props }: { getAll(): any, props: RoleProps }) {

    const VingRole: VingRole = {
        isRole(role: ExtendedRoleOptions): boolean {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            let props = getAll();
            if (role in props) {
                return props[role as keyof Roles] || props.admin || false;
            }
            return false;
        },

        isaRole(roles: ExtendedRoleOptions[]): boolean {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        },

        isRoleOrThrow(role: keyof Roles): boolean {
            if (this.isRole(role)) {
                return true;
            }
            throw ouch(403, `Not a member of ${role}`, role);
        },

        getRoleProp(key) {
            return props[key];
        },
    }

    return VingRole;

}

export const RoleOptions = ["admin", "developer"] as const;
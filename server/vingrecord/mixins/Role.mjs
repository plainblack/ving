import { ouch } from '../../../utils/ouch.mjs';

export const RoleOptions = ["admin", "developer"];

export function RoleMixin(Base) {
    class RoleMixin extends Base {

        public isRole(role) {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            let props = this.getAll();
            if (role in props) {
                return props[role] || props.admin || false;
            }
            return false;
        }

        public isaRole(roles) {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        }

        public isRoleOrDie(role) {
            if (this.isRole(role)) {
                return true;
            }
            throw ouch(403, `Not a member of ${role}`, role);
        }

        public getRoleProp(key) {
            return this.get(key);
        }
    }

    return RoleMixin;
}
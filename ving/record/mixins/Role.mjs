import { ouch } from '#ving/utils/ouch.mjs';
export { RoleOptions } from '#ving/schema/schemas/User.mjs';

/**
 * Generates a new class from a base class that adds the methods for roles
 * @param {Object} Base a VingRecord class
 * @returns A VingRecord class extended with the RoleMixin
 */
export function RoleMixin(Base) {

    /**
     * A mixin that adds shared role methods
     * @class
     */
    class RoleMixin extends Base {

        /**
         * Determines whether an object instance has the specified role
         * @param {string} role One of the roles defined in the `User` schema, or the reseved keyword `public`
         * @returns A boolean indicating whether this object has the specified role
         */
        isRole(role) {
            if (role == 'public') return true;
            if (role == 'owner') return false; // can't do owner check this way, use isOwner() instead
            let props = this.getAll();
            if (role in props) {
                return props[role] || props.admin || false;
            }
            return false;
        }

        /**
         * Similar to `isRole` but checks against a list of roles and returns `true` if any of the roles match
         * @param {string[]} roles A list of roles
         * @returns {boolean}
         */
        isaRole(roles) {
            for (const role of roles) {
                const result = this.isRole(role);
                if (result) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Like `isRole()` except will `throw` an error instead of returning `false`
         * @param {string} role One of the roles defined in the `User` schema, or the reserved keyword `public`
         * @throws 403
         * @returns {boolean} `true`
         */
        isRoleOrDie(role) {
            if (this.isRole(role)) {
                return true;
            }
            throw ouch(403, `Not a member of ${role}`, role);
        }

        /**
         * Gets the value of a role related prop
         * @param {string} key 
         * @returns {boolean} `true` or `false`
         */
        getRoleProp(key) {
            return this.get(key);
        }
    }

    return RoleMixin;
}
import { useKind } from '#ving/record/utils.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { RoleMixin, RoleOptions } from '#ving/record/mixins/Role.mjs';
import { useCache } from '#ving/cache.mjs';
import { v4 } from 'uuid';

const version = 2;

/**
 * A proto class that will be merged with a role to form a session
 * @class
 */
class ProtoSession {

    #props = {};
    #type = undefined;
    #apiKeyId = undefined;

    /**
     * Constructor
     * @param {Object} props The list of props from the `User` this session represents
     * @param {string} type Must be one of `native`, `become`, or `apiKey`
     * @param {string} apiKeyId An `APIKeyRecord` id for an API Key that instanciated this session, defaults to `undefined`
     * @param {string} id A unique string to represent the session id, defaults to being generated by `uuid`
     * @throws 442 if type isn't one of `native`, `become`, or `apiKey`
     */
    constructor(props, type, apiKeyId = undefined, id = v4()) {
        this.#props = props;
        this.id = id;
        if (!['native', 'become', 'apiKey'].includes(type))
            throw ouch(442, 'Session type must be native, become, or apiKey')
        this.#type = type;
        this.#apiKeyId = apiKeyId;
    }

    /**
     * Did the user log in with a human mechanism or via some robotic way?
     * 
     * @returns `true` if human, or `false` if any other way
     */
    isHuman() {
        return ['native', 'become'].includes(this.#type);
    }

    /**
     * Returns the value of the specified prop
     * @param {string} key the name of the prop to fetch the value for
     * @returns value of a prop
     */
    get(key) {
        return this.#props[key];
    }

    /**
     * Returns all of the props related to the user that this session represents
     * @returns An object with all the props
     */
    getAll() {
        return this.#props;
    }

    #apiKeyObj = undefined;

    /** A reference to the `APIKeyRecord` object this session is linked with
     * @param {Object} apiKeyObj Optionally pass a fully formed `APIKey` instance in so that we don't have to look it up
     * @returns a `APIKeyRecord` instance
     */
    async apiKey(apiKeyObj) {
        if (apiKeyObj !== undefined) {
            return this.#apiKeyObj = apiKeyObj;
        }
        if (this.#apiKeyObj !== undefined) {
            return this.#apiKeyObj;
        }
        const apikeys = await useKind('APIKey');
        return this.#apiKeyObj = await apikeys.find(this.#apiKeyId);
    }

    #userObj = undefined;

    /** A reference to the `UserRecord` object this session is linked with
     * @param {Object} userObj Optionally pass a fully formed `User` instance in so that we don't have to look it up
     * @returns a `UserRecord` instance
     */
    async user(userObj) {
        if (userObj !== undefined) {
            return this.#userObj = userObj;
        }
        if (this.#userObj !== undefined) {
            return this.#userObj;
        }
        const users = await useKind('User');
        this.#userObj = await users.find(this.#props.id);
        if (this.#userObj == undefined) {
            await this.end();
            throw ouch(404, `The user ${this.#props.id} no longer exists.`);
        }
        return this.#userObj;
    }

    /** Destroys the session
     * 
     */
    async end() {
        await useCache().delete('session-' + this.id);
    }

    /**
     * Extends the session for an additional week from the current date
     * 
     */
    async extend() {
        const userChanged = await useCache().get('user-changed-' + this.#props.id);
        if (userChanged) {
            const user = await this.user();
            if (this.#props.password != user.get('password')) { // password changed since session created
                throw ouch(401, 'Session expired.');
            }
            else {
                this.#props.verifiedEmail = user.get('verifiedEmail');
                for (const role of RoleOptions) {
                    this.#props[role] = user.get(role);
                }
            }
        }
        await useCache().set('session-' + this.id, { version, props: this.#props, apiKeyId: this.#apiKeyId, type: this.#type }, 1000 * 60 * 60 * 24 * 7);
    }

    /**
     * Describes the session in the same way that the `describe()` method works on a `VingRecord`
     * @param {Object} params See `describe()` in `VingRecord`
     * @returns The description of the session
     */
    async describe(params) {
        const out = {
            props: {
                id: this.id,
                userId: this.get('id'),
            }
        };
        if ('include' in params && params.include !== undefined) {
            if (params.include.related && params.include.related.length) {
                out.related = {
                    user: await (await this.user()).describe(params)
                }
            }
            if (params.include.links) {
                out.links = {
                    base: {
                        href: `/api/${rest.defaultVersion}/user/session`,
                        methods: ["GET", "POST"],
                    },
                    self: {
                        href: `/api/${rest.defaultVersion}/user/session/${this.id}`,
                        methods: ["GET", "PUT", "DELETE"],
                    },
                }
            }
            if (params.include.meta) {
                out.meta = {
                    type: 'Session',
                }
            }
        }
        return out;
    }


    /**
     * Starts a new session
     * @param {Object} user A `UserRecord` instance that you wish to start a session for
     * @param {}
     * @returns A session instance
     */
    static async start(user, type, apiKey) {
        let apiKeyId = undefined;
        if (apiKey)
            apiKeyId = apiKey.get('id');
        const session = new Session(user.getAll(), type, apiKeyId);
        session.user(user);
        if (apiKey)
            session.apiKey(apiKey);
        await session.extend();
        return session;
    }

    /**
     * Retrieves a session from the cache and instanciates it
     * @param {string} id The unique id of the session
     * @throws 401 if not found
     * @returns A session instance
     */
    static async fetch(id) {
        const data = await useCache().get('session-' + id);
        if (data !== undefined && data.version == version) {
            return new Session(data.props, data.type, data.apiKeyId, id);
        }
        throw ouch(401, 'Session expired.');
    }
}

/** 
 * A class formed by mixing the proto session with the role mixin
 * @class
*/
export class Session extends RoleMixin(ProtoSession) { }

/**
 * Tests whether a session exists
 * @param {Object} session a session or a user instance
 * @throws 401 if the session does not exist
 */
export const testSession = (session) => {
    if (session === undefined) {
        throw ouch(401, 'Session expired.');
    }
}
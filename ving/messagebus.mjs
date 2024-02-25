import Redis from 'ioredis';

// shared publisher
let pub = undefined;

// should probably be replaced with ving jobs connection
/**
 * Connects to redis
 * @returns a reference to the message bus redis connection
 */
export const useMessageBusPub = () => {
    if (pub) {
        return pub
    }
    pub = new Redis();
    return pub;
}
pub = useMessageBusPub();

/**
 * Publishes a message to the user message bus
 * @param {string} userId The unique id of the user that should receive the message
 * @param {string} type the type of message to be sent. currently can either be `toast` or `ping`. Defaults to `ping`
 * @param {Object} data the data to be sent, defaults to `{}`
 * @returns the redis connection
 */
export const publish = async (userId, type = 'ping', data = {}) => {
    await pub.publish('notify:' + userId, JSON.stringify({ type, data }));
    return pub;
}

/**
 * Publish a toast notification to a user
 * @param {string} userId The unique id of the user that should receive the message
 * @param {string} message The message to send to a user
 * @param {string} severity One of `info`, `warn`, `error`, or `success`
 * @returns the redis connection
 */
export const publishUserToast = async (userId, message, severity = 'info') => {
    return publish(userId, 'toast', { severity, message });
}

// NOT SURE THIS IS NEEDED
/**
 * Creates a new connection to redis for each user
 * @returns a redis connection
 */
export const useMessageBusSub = () => {
    return new Redis();
}
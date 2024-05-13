import { useRedis } from '#ving/redis.mjs';
import { stringifyId } from '#ving/utils/int2str.mjs';
/**
 * Publishes a message to the user message bus
 * @param {string} userId The unique id of the user that should receive the message
 * @param {string} type the type of message to be sent. currently can either be `toast` or `ping`. Defaults to `ping`
 * @param {Object} data the data to be sent, defaults to `{}`
 * @returns the redis connection
 */
export const publish = async (userId, type = 'ping', data = {}) => {
    const pub = useRedis();
    await pub.publish('notify:' + stringifyId(userId, 'User'), JSON.stringify({ type, data }));
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
import Redis from 'ioredis';

// shared publisher
let pub = undefined;
export const useMessageBusPub = () => {
    if (pub) {
        return pub
    }
    pub = new Redis();
    return pub;
}
pub = useMessageBusPub();


export const publish = async (userId, type = 'ping', data = {}) => {
    await pub.publish('notify:' + userId, JSON.stringify({ type, data }));
}

// publish user toast notification
export const publishUserToast = async (userId, message, severity = 'info') => {
    publish(userId, 'toast', { severity, message });
}

// new subscriber every time
export const useMessageBusSub = () => {
    return new Redis();
}
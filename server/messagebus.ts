import Redis from 'ioredis';

// shared publisher
let pub: any = undefined;
export const useMessageBusPub = () => {
    if (pub) {
        return pub
    }
    pub = new Redis();
    return pub;
}
pub = useMessageBusPub();

// publish user notification
export const publishUserNotify = async (userId: string, message: string, severity: 'info' | 'danger' | 'success' | 'warning' = 'info') => {
    const pub = useMessageBusPub();
    await pub.publish('notify:' + userId, JSON.stringify({ type: 'toast', data: { severity, message } }));
    return pub;
}

// new subscriber every time
export const useMessageBusSub = () => {
    return new Redis();
}
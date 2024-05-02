/**
 * Connects to the ving server via Server Sent Events to allow the server 
 * to push messages to the browser. By default it handles toasts via the
 * 
 * Currently it handles only toasts through the user notification system. 
 * Everything else gets logged to the console. 
 * 
 * @returns An EventSource that connects to the ving message bus server
 * @example
 * const bus = useMessageBus()
 */
export default async function useMessageBus() {
    const notify = useNotify();
    const currentUser = useCurrentUser();

    let reconnectFrequencySeconds = 1;
    let bus = null;

    const wait = () => reconnectFrequencySeconds * 1000;

    const tryToSetup = () => {
        setupBusHandler();
        reconnectFrequencySeconds *= 2;
        if (reconnectFrequencySeconds >= 64) {
            reconnectFrequencySeconds = 64;
        }
    };

    const reconnect = () => setTimeout(tryToSetup, wait);

    const setupBusHandler = () => {
        bus = new EventSource(`/api/${useRestVersion()}/user/messagebus`);
        bus.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'toast':
                    notify.notify(message.data.severity, message.data.message);
                    break;
                case 'ping':
                    break; //ignore initialization
                default:
                    console.log(message);
            }
        };
        bus.onopen = () => {
            reconnectFrequencySeconds = 1;
        };
        bus.onerror = () => {
            bus.close();
            reconnect();
        };
        return bus;
    }

    window.addEventListener('ving-login', (event) => {
        bus = setupBusHandler();
    });
    window.addEventListener('ving-logout', (event) => {
        if (bus != null)
            bus.close();
    });
    if (await currentUser.isAuthenticated()) {
        bus = setupBusHandler();
    }
    return bus;
}
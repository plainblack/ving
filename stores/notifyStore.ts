import { defineStore } from 'pinia';


export const useNotifyStore = defineStore('notify', {
    state: (): {
        errorMessage: string,
        warnMessage: string,
        infoMessage: string,
        successMessage: string,
    } => ({
        errorMessage: '',
        warnMessage: '',
        infoMessage: '',
        successMessage: '',
    }),
    actions: {
        error(message: string) {
            this.errorMessage = message;
        },
        warn(message: string) {
            this.warnMessage = message;
        },
        info(message: string) {
            this.infoMessage = message;
        },
        success(message: string) {
            this.successMessage = message;
        },
        notify(type: 'info' | 'success' | 'danger' | 'warning', message: string) {
            // @ts-expect-error
            this[type + 'Message'] = message;
        },
    },
});
import { defineStore } from 'pinia';


export const useNotify = defineStore('notify', {
    state: () => ({
        errorMessage: '',
        warnMessage: '',
        infoMessage: '',
        successMessage: '',
    }),
    actions: {
        error(message) {
            this.errorMessage = message;
        },
        warn(message) {
            this.warnMessage = message;
        },
        info(message) {
            this.infoMessage = message;
        },
        success(message) {
            this.successMessage = message;
        },
        notify(type, message) {
            this[type + 'Message'] = message;
        },
    },
});
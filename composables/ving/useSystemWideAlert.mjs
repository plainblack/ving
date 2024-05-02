import { defineStore } from 'pinia';

export const useSystemWideAlert = defineStore('system-wide-alert', {
    state: () => ({
        message: '', ttl: 1000 * 60 * 60, severity: 'success'
    }),
    actions: {
        setState(data) {
            this.message = data.message;
            this.ttl = data.ttl;
            this.severity = data.severity;
        },
        async get() {
            const response = await useRest(`/api/${useRestVersion()}/system-wide-alert`);
            if (response.data) {
                this.setState(response.data);
            }
        },
        async delete() {
            const response = await useRest(`/api/${useRestVersion()}/system-wide-alert`, { method: 'delete' });
            if (response.data) {
                this.setState(response.data);
            }
        },
        async post() {
            const response = await useRest(`/api/${useRestVersion()}/system-wide-alert`, {
                method: 'post',
                body: this.$state,
            });
            if (response.data) {
                this.setState(response.data);
            }
        },
        async check() {
            if (process.client) {
                await this.get();
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.timer = setTimeout(async () => await this.check(), 1000 * 60 * 15);
            }
        }
    },
});
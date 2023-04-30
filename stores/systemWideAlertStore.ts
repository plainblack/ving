import { defineStore } from 'pinia';
type SystemWideAlert = { message: string, ttl: number, severity: 'success' | 'warn' | 'info' | 'error' };
export const useSystemWideAlertStore = defineStore('system-wide-alert', {
    state: (): {
        message: SystemWideAlert['message'],
        ttl: SystemWideAlert['ttl'],
        severity: SystemWideAlert['severity'],
        timer?: any,
    } => ({
        message: '', ttl: 1000 * 60 * 60, severity: 'success'
    }),
    actions: {
        setState(data: SystemWideAlert) {
            this.message = data.message;
            this.ttl = data.ttl;
            this.severity = data.severity;
        },
        async get() {
            const response = await useRest('/api/system-wide-alert');
            if (response.data) {
                this.setState(response.data as SystemWideAlert);
            }
        },
        async delete() {
            const response = await useRest('/api/system-wide-alert', { method: 'delete' });
            if (response.data) {
                this.setState(response.data as SystemWideAlert);
            }
        },
        async post() {
            const response = await useRest('/api/system-wide-alert', {
                method: 'post',
                body: this.$state,
            });
            if (response.data) {
                this.setState(response.data as SystemWideAlert);
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
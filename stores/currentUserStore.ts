import { defineStore } from 'pinia';
import { Describe } from '~~/app/db';


export const useCurrentUserStore = defineStore('currentUser', {
    state: (): {
        currentUser: Describe<'User'> | undefined
    } => ({
        currentUser: undefined
    }),
    actions: {
        async whoami() {
            const response = await useFetch('/api/user/whoami?includeOptions=true');
            if (response.data.value) {
                this.currentUser = response.data.value;
            }
            return response;
        },
        async login(login: string, password: string) {
            const response = await useFetch('/api/session', {
                method: 'POST',
                body: {
                    login,
                    password
                },
                onResponseError() { }
            });
            if (response.error?.value) {
                throw response.error?.value.data;
            }
            else {
                await this.whoami();
            }
            return response;
        },
        async logout() {
            const response = await useFetch('/api/session', {
                method: 'delete',
            });
            this.currentUser = undefined;
            return response;
        },
        async save() {
            const response = await useFetch('/api/user/' + this.currentUser?.props.id, {
                method: 'put',
                body: this.currentUser?.props,
                query: { includeOptions: true }
            });
            this.currentUser = response.data.value as Describe<'User'>;
            return response;
        },
        async create(newUser: { username: string, email: string, password: string, realName: string }) {
            const response = await useFetch('/api/user', {
                method: 'post',
                body: newUser,
                query: { includeOptions: true }
            });
            if (response.error?.value) {
                throw response.error?.value.data;
            }
            else {
                await this.login(newUser.email, newUser.password);
            }
            return response;
        },
        async isAuthenticated() {
            if (this.currentUser === undefined) {
                await this.whoami();
            }
            return this.currentUser !== undefined;
        },
    },
});
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
            try {
                const response = await useFetch('/api/user/whoami?includeOptions=true');
                if (response.data.value) {
                    this.currentUser = response.data.value;
                }
            }
            catch (e) {
                console.error(e);
            }
        },
        async login(login: string, password: string) {
            try {
                const session = await useFetch('/api/session', {
                    method: 'POST',
                    body: {
                        login,
                        password
                    }
                });
                this.whoami();
            }
            catch (e) {
                console.log('login failed: ' + e);
            }
        },
        async logout() {
            const session = await useFetch('/api/session', {
                method: 'delete',
            });
            this.currentUser = undefined;
        },
        async save() {
            const response = await useFetch('/api/user/' + this.currentUser?.props.id, {
                method: 'put',
                body: this.currentUser?.props,
                query: { includeOptions: true }
            });
            this.currentUser = response.data.value as Describe<'User'>;
        },
        async create(newUser: { username: string, email: string, password: string, realName: string }) {
            const response = await useFetch('/api/user', {
                method: 'post',
                body: newUser,
                query: { includeOptions: true }
            })
            await this.login(newUser.email, newUser.password);
        },
        async isAuthenticated() {
            if (this.currentUser === undefined) {
                await this.whoami();
            }
            return this.currentUser !== undefined;
        },
    },
});
import { defineStore } from 'pinia';
import { Describe } from '../types';

const query = { includeOptions: true, includeMeta: true };

export const useCurrentUserStore = defineStore('currentUser', {
    state: (): {
        props?: Describe<'User'>['props']
        meta?: Describe<'User'>['meta']
        options?: Describe<'User'>['options']
    } => ({
        props: {},
        meta: {},
        options: {},
    }),
    actions: {
        async whoami() {
            const response = await useFetch('/api/user/whoami', {
                query,
            });
            if (response.data.value) {
                this.setState(response.data.value);
            }
            return response;
        },
        setState(data: Partial<Describe<'User'>>) {
            this.props = data.props;
            this.meta = data.meta;
            this.options = data.options;
        },
        async login(login: string, password: string) {
            const response = await useFetch('/api/session', {
                method: 'POST',
                body: {
                    login,
                    password
                },
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
            this.setState({});
            return response;
        },
        async save() {
            const response = await useFetch('/api/user/' + this.props?.id, {
                method: 'put',
                body: this.props,
                query,
            });
            this.setState(response.data.value as Describe<'User'>)
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
            if (this.props?.id === undefined) {
                await this.whoami();
            }
            return this.props?.id !== undefined;
        },
    },
});
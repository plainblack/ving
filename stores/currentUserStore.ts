import { defineStore } from 'pinia';
import { Describe } from '../types';

const query = { includeOptions: true, includeMeta: true, includeLinks: true };

export const useCurrentUserStore = defineStore('currentUser', {
    state: (): {
        props?: Describe<'User'>['props']
        meta?: Describe<'User'>['meta']
        options?: Describe<'User'>['options']
        links?: Describe<'User'>['links']
    } => ({
        props: {},
        meta: {},
        options: {},
        links: {},
    }),
    actions: {
        async fetch() {
            const response = await useRest('/api/user/whoami', {
                query,
            });
            if (response.data && typeof response.data == 'object') {
                this.setState(response.data);
            }
            return response;
        },
        setState(data: Partial<Describe<'User'>>) {
            this.props = data.props || {};
            this.meta = data.meta || {};
            this.options = data.options || {};
            this.links = data.links || {};
        },
        async login(login: string, password: string) {
            const response = await useRest('/api/session', {
                method: 'post',
                body: {
                    login,
                    password
                },
            });
            if (!response.error) {
                await this.fetch();
            }
            return response;
        },
        async logout() {
            const response = await useRest('/api/session', {
                method: 'delete',
            });
            this.setState({});
            return response;
        },
        async update() {
            const response = await useRest('/api/user/' + this.props?.id, {
                method: 'put',
                body: this.props,
                query,
            });
            this.setState(response.data as Describe<'User'>)
            return response;
        },
        async create(newUser: { username: string, email: string, password: string, realName: string }) {
            const response = await useRest('/api/user', {
                method: 'post',
                body: newUser,
                query: { includeOptions: true },
            });
            if (!response.error) {
                await this.login(newUser.email, newUser.password);
            }
            return response;
        },
        async isAuthenticated() {
            if (this.props?.id === undefined) {
                await this.fetch();
            }
            return this.props?.id !== undefined;
        },
    },
});
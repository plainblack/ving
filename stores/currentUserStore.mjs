import { defineStore } from 'pinia';
import ua from 'ua-parser-js';

const query = { includeOptions: true, includeMeta: true, includeLinks: true };

export const useCurrentUserStore = defineStore('currentUser', {
    state: () => ({
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
        setState(data) {
            this.props = data.props || {};
            this.meta = data.meta || {};
            this.options = data.options || {};
            this.links = data.links || {};
        },
        async login(login, password) {
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
        async importAvatar(s3file) {
            const response = await useRest(this.links.self + '/import-avatar', {
                method: 'put',
                body: { s3FileId: s3file.props.id },
                query,
            });
            this.setState(response.data)
            return response;
        },
        async update() {
            const response = await useRest(this.links.self, {
                method: 'put',
                body: this.props,
                query,
            });
            this.setState(response.data)
            return response;
        },
        async create(newUser) {
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
        async sendVerifyEmail(redirectAfter) {
            const parser = new ua(navigator.userAgent);
            const response = await useRest(this.links.self + '/send-verify-email', {
                method: 'post',
                query: { includeOptions: true, redirectAfter, browser: parser.getBrowser().name, os: parser.getOS().name },
            });
        },
        async verifyEmail(verify) {
            const response = await useRest(this.links.self + '/verify-email', {
                method: 'post',
                query: { includeOptions: true, verify },
            });
            this.setState(response.data)
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
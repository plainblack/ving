import { defineStore } from 'pinia';
import ua from 'ua-parser-js';
import { isObject, isUndefined } from '#ving/utils/identify.mjs';

const query = { includeOptions: true, includeMeta: true, includeLinks: true };

export const useCurrentUser = defineStore('currentUser', {
    state: () => ({
        props: {},
        meta: {},
        options: {},
        links: {},
    }),
    actions: {
        async fetch() {
            const response = await useRest(`/api/${useRestVersion()}/user/whoami`, {
                query,
            });
            if (isObject(response.data)) {
                this.setState(response.data);
            }
            return response;
        },
        setState(data) {
            if (data) {
                this.props = data?.props || {};
                this.meta = data?.meta || {};
                this.options = data?.options || {};
                this.links = data?.links || {};
            }
        },
        async login(login, password) {
            const response = await useRest(`/api/${useRestVersion()}/session`, {
                method: 'post',
                body: {
                    login,
                    password,
                    sessionType: 'native',
                },
            });
            if (!response.error) {
                await this.fetch();
            }
            window.dispatchEvent(new Event('ving-login'));
            return response;
        },
        async logout() {
            const response = await useRest(`/api/${useRestVersion()}/session`, {
                method: 'delete',
            });
            this.setState({});
            window.dispatchEvent(new Event('ving-logout'));
            return response;
        },
        async importAvatar(s3file) {
            const response = await useRest(this.links?.self?.href + '/import-avatar', {
                method: 'put',
                body: { s3FileId: s3file.props.id },
                query,
            });
            this.setState(response.data)
            return response;
        },
        async update() {
            const response = await useRest(this.links?.self?.href, {
                method: 'put',
                body: this.props,
                query,
            });
            if (response.data)
                this.setState(response.data);
            return response;
        },
        async save(key) {
            const valuesToSave = {};
            valuesToSave[key] = this.props[key];
            const response = await useRest(this.links?.self?.href, {
                method: 'put',
                body: valuesToSave,
                query,
            });
            if (response.data)
                this.setState(response.data);
            return response;
        },
        async create(newUser) {
            const response = await useRest(`/api/${useRestVersion()}/user`, {
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
            const response = await useRest(this.links?.self?.href + '/send-verify-email', {
                method: 'post',
                query: { includeOptions: true, redirectAfter, browser: parser.getBrowser().name, os: parser.getOS().name },
            });
        },
        async verifyEmail(verify) {
            const response = await useRest(this.links?.self?.href + '/verify-email', {
                method: 'post',
                query: { includeOptions: true, verify },
            });
            this.setState(response.data)
            return response;
        },
        async isAuthenticated() {
            if (isUndefined(this.props?.id)) {
                await this.fetch();
            }
            return !isUndefined(this.props?.id);
        },
    },
});
import ua from 'ua-parser-js';
import { isUndefined } from '#ving/utils/identify.mjs';

export const useCurrentUser = () => useVingRecord({
    id: 'currentUser',
    fetchApi: `/api/${useRestVersion()}/user/whoami`,
    createApi: `/api/${useRestVersion()}/user`,
    query: { includeOptions: true, includeMeta: true, includeLinks: true },
    extendedActions: {
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

        async importAvatar(s3file) {
            return await this.importS3File('avatar', s3file.props.id);
        },
    },
});
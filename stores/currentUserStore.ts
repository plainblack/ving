import { defineStore } from 'pinia';
import { Describe } from '../types';

const query = { includeOptions: true, includeMeta: true, includeLinks: true };
const notify = useNotifyStore();
const throbber = useThrobberStore();

const onRequest = async (context: any) => {
    throbber.working();
}

const onRequestError = async (context: any) => {
    throbber.done();
}

const onResponse = async (context: any) => {
    throbber.done();
}

const onResponseError = async (context: any) => {
    throbber.done();
    console.dir(context)
    notify.error(context.response._data.message);
}

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
        async whoami() {
            const response = await useFetch('/api/user/whoami', {
                query,
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
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
            this.links = data.links;
        },
        async login(login: string, password: string) {
            const response = await useFetch('/api/session', {
                method: 'POST',
                body: {
                    login,
                    password
                },
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
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
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
            });
            this.setState({});
            return response;
        },
        async save() {
            const response = await useFetch('/api/user/' + this.props?.id, {
                method: 'put',
                body: this.props,
                query,
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
            });
            this.setState(response.data.value as Describe<'User'>)
            return response;
        },
        async create(newUser: { username: string, email: string, password: string, realName: string }) {
            const response = await useFetch('/api/user', {
                method: 'post',
                body: newUser,
                query: { includeOptions: true },
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
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
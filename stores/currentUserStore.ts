import { defineStore } from 'pinia';
import { Describe } from '~~/app/db';


export const useCurrentUserStore = defineStore('currentUser', {
    state: (): {
        currentUser: Describe<'User'> | undefined
    } => ({
        currentUser: undefined
    }),
    actions: {
        async fetch() {
            try {
                const response = await useFetch('/api/user/whoami');
                this.currentUser = response.data.value;
            }
            catch (e) {
                console.error(e);
            }
        },
        async login(login: string, password: string) {
            try {
                const session = await useFetch('/api/session?includeRelated=user', {
                    method: 'POST',
                    body: {
                        login,
                        password
                    }
                });
                if (session.data.value && session.data.value.related && session.data.value.related.user) {
                    this.currentUser = session.data.value.related?.user;
                }
                else {
                    console.log('login failed, but without error');
                }
            }
            catch (e) {
                console.log('login failed: ' + e);
            }
        },
    },
});
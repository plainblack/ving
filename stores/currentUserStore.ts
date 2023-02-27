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
        }
    },
});
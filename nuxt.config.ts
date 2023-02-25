// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            link: [
                { // pro subscription to font-awesome, will only work on my domains and localhost
                    rel: 'stylesheet',
                    href: 'https://pro.fontawesome.com/releases/v5.15.4/css/all.css',
                    integrity: 'sha384-rqn26AG5Pj86AF4SO72RK5fyefcQ/x32DNQfChxWvbXIyXFePlEktwD18fEz+kQU',
                    crossorigin: 'anonymous'
                }
            ]
        }
    },
    runtimeConfig: {
    }
})

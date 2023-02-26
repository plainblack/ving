// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css',
                    crossorigin: 'anonymous'
                }
            ]
        }
    },
    modules: [
        '@nuxtjs/tailwindcss',
        'nuxt-headlessui'
    ],
    headlessui: {
        prefix: '' // we'll just use the default headless component names with no prefix
    },
    runtimeConfig: {}
})
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        'nuxt-headlessui'
    ],
    build: {
        transpile: [
            "@fortawesome/vue-fontawesome",
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-solid-svg-icons",
            "@fortawesome/pro-solid-svg-icons",
        ],
    },
    headlessui: {
        prefix: '' // we'll just use the default headless component names with no prefix
    },
    css: [
        '@fortawesome/fontawesome-svg-core/styles.css'
    ],
    runtimeConfig: {}
})
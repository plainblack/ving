// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        'nuxt-headlessui',
        '@pinia/nuxt',
    ],
    app: {
        head: {
            link: [
                {
                    rel: 'apple-touch-icon',
                    href: '/apple-touch-icon.png',
                    sizes: '180x180'
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    href: '/favicon-32x32.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '16x16',
                    href: '/favicon-16x16.png',
                },
                {
                    rel: 'manifest',
                    href: '/site.webmanifest',
                },
            ],
            meta: [
                {
                    name: 'msapplication-TileColor',
                    content: "#da532c",
                },
                {
                    name: "theme-color",
                    content: "#ffffff",
                },
            ]
        },
    },
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
        '@fortawesome/fontawesome-svg-core/styles.css',
        '~/assets/css/main.css',
    ],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    runtimeConfig: {
        public: {
            companyName: 'ving',
            logoUrl: '/ving.svg',
        },
    },
})
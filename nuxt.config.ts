// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@pinia/nuxt',
        '@nuxt/content',
    ],
    imports: {
        dirs: [
            'stores',
        ],
    },
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
            'primevue',
        ],
    },
    css: [
        '@fortawesome/fontawesome-svg-core/styles.css',
        'primevue/resources/themes/tailwind-light/theme.css',
        'primevue/resources/primevue.css',
        'primeicons/primeicons.css',
        'primeflex/primeflex.css',
        '~/assets/css/main.css',
    ],
    runtimeConfig: {
        public: {
            companyName: 'ving',
            logoUrl: '/ving.svg',
        },
    },
    content: {
        highlight: { theme: 'light-plus' },
    }
})
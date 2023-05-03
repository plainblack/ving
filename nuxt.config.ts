// https://nuxt.com/docs/api/configuration/nuxt-config
import ving from './ving.json';

export default defineNuxtConfig({
    modules: [
        '@pinia/nuxt',
        '@nuxt/content',
        'nuxt-icon',
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
            'primevue',
        ],
    },
    css: [
        'primevue/resources/themes/tailwind-light/theme.css',
        'primevue/resources/primevue.css',
        'primeicons/primeicons.css',
        'primeflex/primeflex.css',
        '~/assets/css/main.css',
    ],
    runtimeConfig: {
        public: {
            site: ving.site,
        },
    },
    content: {
        highlight: { theme: 'light-plus' },
    }
})
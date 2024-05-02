// https://nuxt.com/docs/api/configuration/nuxt-config
import ving from './ving.json';
//@ts-expect-error
ving.site.url = process.env.VING_SITE_URL;

export default defineNuxtConfig({
    modules: [
        '@pinia/nuxt',
        'nuxt-icon',
        'nuxt-primevue',
    ],
    primevue: {
        cssLayerOrder: 'reset,primevue'
    },
    imports: {
        dirs: [
            'composables/**',
            'utils/**',
        ],
    },
    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
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
    css: [
        'primevue/resources/themes/tailwind-light/theme.css',
        'primevue/resources/primevue.css',
        'primeicons/primeicons.css',
        'primeflex/primeflex.css',
        '~/assets/css/main.css',
    ],
    runtimeConfig: {
        public: ving,
    },
    content: {
        highlight: { theme: 'light-plus' },
    }
})
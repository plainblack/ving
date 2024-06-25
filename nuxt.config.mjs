// https://nuxt.com/docs/api/configuration/nuxt-config
import ving from './ving.json';
//import VingTheme from './themes/ving-theme.mjs';
import Aura from '@primevue/themes/aura';

ving.site.url = process.env.VING_SITE_URL;

export default defineNuxtConfig({
    devtools: false,
    future: {
        compatibilityVersion: 4,
    },
    modules: [
        '@pinia/nuxt',
        'nuxt-icon',
        '@nuxtjs/tailwindcss',
        '@primevue/nuxt-module',
        '@vueuse/nuxt',
    ],
    primevue: {
        importTheme: { from: "@/themes/ving-theme.mjs" },
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
                    href: '/manifest.json',
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
        'primeicons/primeicons.css',
    ],
    runtimeConfig: {
        public: ving,
    },
})
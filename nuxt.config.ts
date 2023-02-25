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
        '@huntersofbook/naive-ui-nuxt'
    ],
    naiveUI: {
        themeOverrides: {
            common: {
                //   primaryColor: '#ff0000',
                // primaryColorHover: '#8b0000'
            }
        }
    },
    runtimeConfig: {
    }
})
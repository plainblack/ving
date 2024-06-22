import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

const VingTheme = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.600}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.800}',
                    activeColor: '{primary.700}'
                },
                highlight: {
                    background: '{primary.600}',
                    focusBackground: '{primary.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                },
                formField: {
                    //  hoverBorderColor: '{primary.color}'
                },
                content: {
                    //    background: '{gray.100}'
                },
                surface: {
                    0: '#ffffff',
                    50: '{zinc.50}',
                    100: '{zinc.100}',
                    200: '{zinc.200}',
                    300: '{zinc.300}',
                    400: '{zinc.400}',
                    500: '{zinc.500}',
                    600: '{zinc.600}',
                    700: '{zinc.700}',
                    800: '{zinc.800}',
                    900: '{zinc.900}',
                    950: '{zinc.950}'
                },
            },
            dark: {
                primary: {
                    color: '{primary.400}',
                    contrastColor: '{primary.950}',
                    hoverColor: '{primary.200}',
                    activeColor: '{primary.300}'
                },
                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.300}',
                    color: '{primary.950}',
                    focusColor: '{primary.950}'
                },
                overlay: {
                },
                formField: {
                    //hoverBorderColor: '{primary.color}'
                },
                content: {
                    //       background: '{surface.850}',
                },
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                },
            }
        }
    },
    components: {
        fieldset: {
            colorScheme: {
                light: {
                    root: {
                        background: '{surface.50}',
                    }
                },
                dark: {
                    root: {
                        background: '{surface.900}',
                    }
                },
            },
        },
        tieredmenu: {
            colorScheme: {
                dark: {
                    root: {
                        background: '{surface.900}'
                    },
                },
            },
        },
        menubar: {
            colorScheme: {
                dark: {
                    submenu: {
                        background: '{surface.900}'
                    },
                },
            },
        },
        avatar: {
            lg: {
                width: '4rem',
                height: '4rem',
                fontSize: '2rem'
            },
            xl: {
                width: '12rem',
                height: '12rem',
                fontSize: '3rem'
            }
        },
    },
});

export default {
    preset: VingTheme,
    options: {
        darkModeSelector: '.dark',
    },
};

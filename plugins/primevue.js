import { defineNuxtPlugin } from "#app";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import ripple from "primevue/ripple";
import styleclass from "primevue/styleclass";
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(PrimeVue, { ripple: true });
    nuxtApp.vueApp.use(ToastService);
    nuxtApp.vueApp.component('Button', Button);
    nuxtApp.vueApp.component('InputText', InputText);
    nuxtApp.vueApp.directive('ripple', ripple);
    nuxtApp.vueApp.directive('styleclass', styleclass);
    nuxtApp.vueApp.component('Toast', Toast);
});
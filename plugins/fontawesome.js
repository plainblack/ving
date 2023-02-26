// For Nuxt 3
import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
//import { far } from '@fortawesome/free-regular-svg-icons'
//import { fal } from '@fortawesome/free-light-svg-icons'
//import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fas as fasPro } from '@fortawesome/pro-solid-svg-icons'
//import { far  } from '@fortawesome/pro-regular-svg-icons'
//import { fal  } from '@fortawesome/pro-light-svg-icons'
//import { fat  } from '@fortawesome/pro-thin-svg-icons'
//import { fad  } from '@fortawesome/pro-duotone-svg-icons'
//import { fass  } from '@fortawesome/sharp-solid-svg-icons'
//import { fasr  } from '@fortawesome/sharp-regular-svg-icons'

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

// You can add your icons directly in this plugin. See other examples for how you
// can add other styles or just individual icons.
library.add(fas)
library.add(fasPro)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon, {})
})
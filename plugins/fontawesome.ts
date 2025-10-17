import { library, config } from '@fortawesome/fontawesome-svg-core'
import { faInstagram, faSquareFacebook } from '@fortawesome/free-brands-svg-icons'
import { faSun, faEye, faEyeSlash, faCalendar, faSquare, faIdCard } from '@fortawesome/free-regular-svg-icons'
import {
  faBars,
  faMoon,
  faSignOutAlt,
  faGaugeSimpleHigh,
  faRotateLeft,
  faFloppyDisk,
  faCheckSquare,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// This is important, we are going to let Nuxt.js worry about the CSS
config.autoAddCss = false

// Brand icons
library.add(faSquareFacebook, faInstagram)
// Regular icons
library.add(faSun, faEye, faEyeSlash, faCalendar, faSquare, faIdCard)
// Solid icons
library.add(
  faMoon,
  faBars,
  faSignOutAlt,
  faGaugeSimpleHigh,
  faRotateLeft,
  faFloppyDisk,
  faCheckSquare,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faTrashAlt
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('fa-icon', FontAwesomeIcon)
})

import type { App } from 'vue'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default {
  install(app: App) {
    app.use(Toast, {
      position: POSITION.TOP_RIGHT,
      timeout: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    })
  },
}

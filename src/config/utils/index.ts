import { type App } from 'vue'

import multiLanguage from '@utils/multiLanguage'

export function loadUtils(app: App) {
  /** load */
  app.use(multiLanguage)
}

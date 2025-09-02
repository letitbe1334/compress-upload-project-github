import { type App } from 'vue'
import format from 'string-format'

export function loadStringFormat(app: App) {
  /** string format global variable */
  app.provide('$format', format)
  app.config.globalProperties.$format = format
}

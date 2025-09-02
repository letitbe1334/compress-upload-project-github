import { type App } from 'vue'

/**
 * 국가에 따른 언어값 반환
 * @param {*} message
 * @returns 국가에 따른 언어값 반환
 */
const getTranLanguage: GetTranLanguageFunction = (message: string, format?: string) => {
  return getLanguage(message, format)
}

export default {
  install(app: App) {
    console.log('language provide success')
    app.provide('$language', getTranLanguage)
    app.config.globalProperties.$language = getTranLanguage
  }
}

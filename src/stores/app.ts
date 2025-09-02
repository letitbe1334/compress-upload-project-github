import Cookies from 'js-cookie'

import { useStoreApi } from '@/composable/storeApi'

export const useAppStore = defineStore('app', () => {
  /** store api 호출 */
  const { getFavorites } = useStoreApi()

  const opened = ref(true)
  const device = ref('desktop')
  const language = ref(Cookies.get('language') || 'kr')
  const langInfo = ref({
    label: null,
    message: null
  })
  const loading = ref(false)
  const favorites = ref<Array<favorite>>([])

  opened.value = Cookies.get('searchboxStatus') ? Boolean(Cookies.get('searchboxStatus')) : true
  function hideSearchBox() {
    opened.value = !opened.value
    if (opened.value) {
      Cookies.set('searchboxStatus', '1')
    } else {
      Cookies.set('searchboxStatus', '0')
    }
  }
  function clearSearchBox() {
    opened.value = true
    Cookies.set('searchboxStatus', '1')
  }
  function toggleDevice(_device: string) {
    device.value = _device
  }
  function setLanguage(_language: string) {
    language.value = _language
    Cookies.set('language', _language)
  }
  function GetFavorites(user: Record<string, string>) {
    return new Promise((resolve, reject) => {
      getFavorites(user.userId)
        .then((response: any) => {
          const data = response.data
          favorites.value = data
          resolve(true)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }
  function setLoading(_loading: boolean) {
    loading.value = _loading
  }

  return {
    /** state */
    opened,
    device,
    language,
    langInfo,
    loading,
    favorites,
    /** action */
    hideSearchBox,
    clearSearchBox,
    toggleDevice,
    setLanguage,
    GetFavorites,
    setLoading
  }
})

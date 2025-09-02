import { useQuery } from '@tanstack/vue-query'
import Cookies from 'js-cookie'

import {
  krLanguageMap, // 한국어
  enLanguageMap, // 영어
  jaLanguageMap, // 일본어
  zhcnLanguageMap, // 중국어 (중국)
  zhtwLanguageMap // 중국어 (대만)
} from '@/config/lang'

interface langData {
  lang: string | undefined
}

interface langJson {
  conversionLanguage: string
  languageKey: string
}

const fetchLangs = async (): Promise<Array<langJson>> => {
  const response = await $http<Array<langJson>>({
    url: getLanguageJsonApi(),
    method: 'GET'
  }, false)
  return response.data
}

export const useLangTranStore = defineStore('langTran', () => {
  const auth = useAuthStore()
  const { accessToken } = storeToRefs(auth)
  
  const langs = ref<langJson[]>([])

  /** vue-query 정보 */
  const langVueQuery = ref({
    isStale: true,
    isFetching: true
  })
  const hasToken = computed(() => !!accessToken.value);
  const langQuery = useQuery({
    queryKey: ['langs', accessToken],
    queryFn: fetchLangs,
    staleTime: 3 * 60 * 60 * 1000, // 3시간 동안 fresh 상태 유지
    refetchOnWindowFocus: true, // 사용자가 다시 창을 보면 자동 새로고침
    refetchOnReconnect: true, // 인터넷 연결이 다시 되면 자동 새로고침
    enabled: hasToken
  })

  watchEffect(() => {
    if (langQuery.isSuccess.value) {
      langVueQuery.value.isStale = false // fresh한 상태로 변경

      const lang = Cookies.get('language') ? Cookies.get('language') : 'kr'
      let _langs: any = []
      switch (lang) {
        case 'kr':
          _langs = krLanguageMap
          break
        case 'en':
          _langs = enLanguageMap
          break
        case 'ja':
          _langs = jaLanguageMap
          break
        case 'zh_cn':
          _langs = zhcnLanguageMap
          break
        case 'zh_tw':
          _langs = zhtwLanguageMap
          break
        default:
          _langs = krLanguageMap
      }
      if (langQuery.data.value && langQuery.data.value.length > 0) {
        _langs = _.concat(_langs, langQuery.data.value)
      }
      langs.value = _langs
    }
  })
  watchEffect(() => {
    if (!langQuery.isFetching.value) {
      langVueQuery.value.isFetching = false
    }
  })

  langVueQuery.value.isFetching = langQuery.isFetching.value
  langVueQuery.value.isStale = langQuery.isStale.value
  const refetchLang = () => langQuery.refetch()

  function GetNonAuthLangInfo(data: langData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const lang = data.lang ? data.lang : 'kr'
      let langs: any = []
      switch (lang) {
        case 'kr':
          langs = krLanguageMap
          break
        case 'en':
          langs = enLanguageMap
          break
        case 'ja':
          langs = jaLanguageMap
          break
        case 'zh_cn':
          langs = zhcnLanguageMap
          break
        case 'zh_tw':
          langs = zhtwLanguageMap
          break
        default:
          langs = krLanguageMap
      }

      langs.value = langs

      if (langs) {
        resolve(true)
      } else {
        reject(false)
      }
    })
  }

  return {
    langs,
    GetNonAuthLangInfo,
    refetchLang
  }
})

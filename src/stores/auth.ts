import axios from 'axios'
import { accessRouterData } from '@/stores/permission'
import { useLogin } from '@/composable/login'

const accessExpiredCode = 'B003'
const refreshExpiredCode = 'B005'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const isLogin = computed(() => Boolean(accessToken.value))
  function setAccessToken(token: string) {
    accessToken.value = 'Bearer ' + token
  }
  function removeAccessToken() {
    accessToken.value = ''
  }
  function getAccessExpiredCode() {
    return accessExpiredCode
  }
  function getRefreshExpiredCode() {
    return refreshExpiredCode
  }
  async function getNewToken() {
    const service = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 5000,
      withCredentials: true
    })
    try {
      const response = await service.post(selectConfig.auth.login.refresh.url)
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken)
        return true
      } else {
        removeAccessToken()
        return false
      }
    } catch (error) {
      const { LoginByDeohAccount } = useLogin()
      const isSuccess = await LoginByDeohAccount()
      if (isSuccess) {
        return false
      } else {
        removeAccessToken()
        return false
      }
    }
  }
  function haveRoute(routers: Array<accessRouterData>, path: string) {
    let returnVal = false
    if (routers && routers.length > 0) {
      for (let i = 0; i < routers.length; i++) {
        if (routers[i].path === path) {
          return true
        } else {
          returnVal = false
        }
      }
    }
    return returnVal
  }

  return {
    /** state */
    accessToken,
    isLogin,
    /** action */
    setAccessToken,
    removeAccessToken,
    getAccessExpiredCode,
    getRefreshExpiredCode,
    getNewToken,
    haveRoute
  }
})

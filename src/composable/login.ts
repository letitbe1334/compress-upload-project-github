import { useUserStore } from '@stores/user'
import { useStoreApi } from '@/composable/storeApi'

import { useAuthStore } from '@/stores/auth'

interface loginData {
  email: string
  password: string
}

export function useLogin() {
  /** store api 호출 */
  const { loginByUserAccount, loginByDeohAccount, logout } = useStoreApi()
  /** userStore 호출 */
  const userStore = useUserStore()
  /** langStore 호출 */
  const langStore = useLangTranStore()

  /******************************
   * TODO (목적): ID / PWD 로그인 시도
   * @param (1): id, pwd
   *******************************/
  function LoginByUserAccount(loginInfo: loginData) {
    const auth = useAuthStore()
    const email = loginInfo.email.trim()
    return new Promise((resolve, reject) => {
      loginByUserAccount(email, loginInfo.password)
        .then((response: any) => {
          const data = response.data

          auth.setAccessToken(data.accessToken)

          userStore.refetchUser()
          langStore.refetchLang()

          resolve(true)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  /******************************
   * TODO (목적): 자동 로그인
   *******************************/
  function LoginByDeohAccount() {
    return new Promise((resolve, reject) => {
      loginByDeohAccount()
        .then((response: any) => {
          // const auth = useAuthStore()
          const data = response.data
          console.log(data)
          // auth.setAccessToken(data.accessToken)

          // userStore.refetchUser()
          // langStore.refetchLang()

          resolve(true)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  /******************************
   * TODO (목적): logout 처리
   *******************************/
  function LogOut() {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          clear()
          resolve(true)
        })
        .catch((error) => {
          clear()
          reject(error)
        })
    })
  }

  function clear() {
    const auth = useAuthStore()
    auth.removeAccessToken()
    window.sessionStorage.removeItem('defaultPlantCd')
  }

  return {
    LoginByUserAccount,
    LoginByDeohAccount,
    LogOut
  }
}

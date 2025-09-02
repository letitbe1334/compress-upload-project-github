import axios, { AxiosResponse, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { get, merge } from 'lodash-es'

import { useLogin } from '@/composable/login'
import { useMessage } from '@/composable/message'

import { useLoadingStore } from '@stores/loading'
import { useAuthStore } from '@/stores/auth'

import { getLang } from '@utils/common'

function clear() {
  /** login 호출 */
  const loginStroe = useLogin()
  loginStroe.LogOut().then(() => {
    location.reload() // In order to re-instantiate the vue-router object to avoid bugs
  })
}

/** 요청 인스턴스 생성 */
function createService() {
  // 인스턴스 생성
  const service = axios.create()
  service.interceptors.request.use(
    (config) => {
      const params = config.params
      if (params) {
        params.lang = getLang()
        /** 사업장 조회시 권한이 있는 사업장을 plantCdList에 배열로 담아 API로 전달 */
        if (params.plantCd) {
          params.plantCdList = []
          const plantlist = params.plantCd.split(',')
          for (let i = 0; i < plantlist.length; i++) {
            if (plantlist[i] !== '') {
              params.plantCdList.push(plantlist[i])
            }
          }
        }
      } else {
        config.params = {
          lang: getLang()
        }
      }
      return config
    },
    // 전송실패
    (error) => Promise.reject(error)
  )
  /**
   * 응답 처리
   * - 상태코드에 따른 메시지 처리
   * - loading stack 처리
   */
  service.interceptors.response.use(
    (response) => {
      /** loading 호출 */
      const loading = useLoadingStore()

      /** loading stack down */
      loading.loadingHide()

      // api 반환값
      return response
    },
    async (error) => {
      const auth = useAuthStore()
      /** loading 호출 */
      const loading = useLoadingStore()

      const standardizedError  = {
        httpStatus: get(error, 'response.status') || -100, // -100인 경우는 axios에서 반환하는 상태
        message: get(error, 'response.data.message') || get(error, 'message'),
        code: get(error, 'response.data.code') || get(error, 'code'),
        timestamp: get(error, 'response.data.timestamp') || '',
        path: get(error, 'response.data.path') || get(error, 'config.url'),
      }

      // HTTP status code
      if (standardizedError.httpStatus === 401) {
        // Api server 정의 code
        if (standardizedError.code === auth.getAccessExpiredCode()) {
          // Access Token 만료 : Refresh Token을 통해 JWT 토큰 재발급
          // 1. JWT Token 재발급 요청
          console.log('http')
          const isSuccess = await auth.getNewToken()

          // 이전요청을 다시 수행하도록 url및 parameter등을 다시 호출.
          if (isSuccess) return $http(error.config)
          /** 만료토큰으로 처리되었음. 재로그인 필요. */
          else clear()
        } 
        // else if (standardizedError.code === auth.getRefreshExpiredCode()) {
        //   const { alert } = useMessage()
        //   const { LoginByDeohAccount } = useLogin()
        //   const isSuccess = await LoginByDeohAccount()
        //   if (isSuccess) return $http(error.config)
        //   else alert({
        //     title: '안내',
        //     message: '나중에 다시 시도해주세요.',
        //     type: 'error' // success / info / warning / error
        //   })
        //   clear()
        // } 
        else {
          // INVALID_TOKEN
          // 토큰이 올바르지 않거나, refresh token도 만료된 경우
          clear()
        }
      } else {
        // 개발자 에러 메시지
        const { exceptionNotify, alert } = useMessage()
        if (import.meta.env.MODE !== 'production') {
          exceptionNotify({
            title: '[개발자 안내]',
            message: standardizedError.message,
            errorDetail: standardizedError,
            type: 'error',
            duration: 0 // 자동으로 닫히지 않음
          })
        } else {
          alert({
            title: '에러',
            message: '서비스 처리 중 오류가 발생하였습니다.\n관리자에게 문의바랍니다.',
            type: 'error',
            duration: 0 // 자동으로 닫히지 않음
          })
        }
      }
      loading.loadingAllHide()
      return Promise.reject(standardizedError)
    }
  )
  return service
}

/** 요청 방법 생성 */
function createRequest(service: AxiosInstance) {
  function request<T = any>(config: AxiosRequestConfig, rawResponse?: true): Promise<AxiosResponse<ApiResponseData<T>>>
  function request<T = any>(config: AxiosRequestConfig, rawResponse?: false): Promise<AxiosResponse<T>>

  function request<T>(config: AxiosRequestConfig, rawResponse: boolean = true) {
    const auth = useAuthStore()
    const { accessToken } = storeToRefs(auth)
    const defaultConfig = {
      headers: {
        'Cache-Control': 'no-cache',
        'Authorization': accessToken.value
      },
      withCredentials: true,
      timeout: config.timeout ? config.timeout : 10000,
      baseURL: import.meta.env.VITE_API_URL,
      data: {}
    }
    // defaultConfig & config 병합
    const mergeConfig = merge(defaultConfig, config)

    /** loading 호출 */
    const loading = useLoadingStore()
    loading.loadingShow()

    return rawResponse
      ? service.request<ApiResponseData<T>>(mergeConfig)
      : service.request<T>(mergeConfig)
  }
  return request
}

/** API 요청 서비스 */
const service = createService()
/** API 요청 모듈 */
export const $http = createRequest(service)

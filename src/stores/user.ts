import { useQuery } from '@tanstack/vue-query'

import { useLogin } from '@/composable/login'

const fetchUser = async (): Promise<userType> => {
  const response = await $http<userType>({
    url: selectConfig.auth.member.url,
    method: 'GET'
  })
  return response.data.data
}

export const useUserStore = defineStore('user', () => {
  const { LogOut } = useLogin()
  const auth = useAuthStore()
  const { accessToken } = storeToRefs(auth)
  
  const user = ref<userType>({
    memberId: '',
    email: '',
    nickname: '',
    authorities: [],
  })
  const auths = ref<Array<string> | null>([])
  /** vue-query 정보 */
  const userVueQuery = ref({
    isStale: true,
    isFetching: true,
    refetch: null as (() => void) | null
  })
  
  const hasToken = computed(() => !!accessToken.value);
  const userQuery = useQuery({
    queryKey: ['userInfo', accessToken],
    queryFn: fetchUser,
    staleTime: 3 * 60 * 60 * 1000, // 3시간 동안 fresh 상태 유지
    refetchOnWindowFocus: true, // 사용자가 다시 창을 보면 자동 새로고침
    refetchOnReconnect: true, // 인터넷 연결이 다시 되면 자동 새로고침
    enabled: hasToken
  })

  watchEffect(() => {
    if (userQuery.isSuccess.value) {
      if (!userQuery.data.value) { //  || userQuery.data.value?.user?.userId !== getToken()
        LogOut().finally(() => window.location.reload())
      }

      user.value = userQuery.data.value
      auths.value = userQuery.data.value.authorities
      userVueQuery.value.isStale = false // fresh한 상태로 변경
    }
  })
  watchEffect(() => {
    if (!userQuery.isFetching.value) {
      userVueQuery.value.isFetching = false
    }
  })

  userVueQuery.value.isFetching = userQuery.isFetching.value
  userVueQuery.value.isStale = userQuery.isStale.value
  userVueQuery.value.refetch = userQuery.refetch

  return {
    /** state */
    user,
    userVueQuery,
    auths,
    /** actions */
    refetchUser: () => userVueQuery.value.refetch && userVueQuery.value.refetch()
  }
})

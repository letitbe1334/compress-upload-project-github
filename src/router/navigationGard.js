import router from '@/router'

import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@stores/app'
import { usePermissionStore } from '@stores/permission'

import { useLogin } from '@/composable/login'

/** 인증처리가 되지 않더라도 보낼 수 있는 uri */
const whiteList = ['/404']

router.beforeEach(async (to, from, next) => {
  /** app 호출 */
  const app = useAppStore()
  
  const auth = useAuthStore()
  const { isLogin } = storeToRefs(auth)

  /** permission 호출 */
  const permission = usePermissionStore()
  const { addRouters } = storeToRefs(permission)

  /** 메뉴 이동시 전체화면 로딩 처리 */
  app.setLoading()

  if (to.path === '/404') {
    next()
  } else {
    /** access router에 저장 되지 않은 메뉴 정보일 경우 404 페이지로 redirect */
    if (addRouters.value && addRouters.value.length > 0) {
      if (!auth.haveRoute(addRouters.value, to.path)) {
        return next({
          path: '/404'
        })
      }
    }

    /** 인증토큰 여부 파악 */
    const isSuccess = !isLogin.value ? await auth.getNewToken() : true
    if (isSuccess) {
      /** 메뉴 이동 로그, 해당 소스에서 구현 X */

      /** 인증토큰이 있음에도 로그인페이지로 이동하고자 할 경우 메인페이지로 이동시킴 */
      if (to.path === '/login') {
        next({
          path: '/'
        })
      } else {
        next()
      }
    } else {
      /** token X */
      if (whiteList.indexOf(to.path) !== -1) {
        /** 인증 필요 없는 url */
        next()
      } else {
        /** 그 외의 url은 login page */
        const { LoginByDeohAccount } = useLogin()
        await LoginByDeohAccount()
        next({
          path: '/'
        }) // login 페이지 구성 X http 쪽에서 자동으로 갱신 처리하게 구성
      }
    }
  }
})

router.afterEach((to) => {
  /** 내가 가려는 메뉴 left에 표시 */
  const permission = usePermissionStore()
  permission.findOpenMenus(to.name)

  /** 로딩 제거 */
  const app = useAppStore()
  app.setLoading(false)
})


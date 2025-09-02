/* @vite-ignore */
import { useQuery } from '@tanstack/vue-query'

import { asyncRouterMap, addAuthRouter } from '@/router'

interface urlData {
  path: string
  paramPath: string
  params: Record<string, string>
}

interface menuApiData {
  /** api info */
  menuId?: string
  parentMenuId: string
  sortOrder: number
  githubOwner: string
  githubRepo: string
  githubBranch: string
}

interface responseMenuData extends menuApiData {
  /** use menu info */
  title: string | undefined
  menuName: string
  icon: stringNull
  manualFlag: string
  name: string
  path: string
  menuLevel: string
  githubOwner: string
  githubRepo: string
  githubBranch: string
  params?: Record<string, string>
  children?: Array<menuData>
}

export interface menuData extends menuApiData {
  /** use menu info */
  title: string | undefined
  icon: string
  name: string
  path: string
  menuLevel: string
  params?: Record<string, string>
  children?: Array<menuData>
}

interface accessMenu extends menuApiData {
  /** use menu info */
  title: string
  name: string
  path: string
  menuLevel: string
  editable: boolean
  params?: Record<string, string>
}

interface metaData {
  title: string | undefined
  editable: boolean
  params?: Record<string, string>
  layout?: stringNull
  githubOwner?: string
  githubRepo?: string
  githubBranch?: string
}

export interface accessRouterData {
  path: string
  name: string
  meta?: metaData
  component?: Component
  children?: accessRouterData[]
}

const fetchMenus = async (memberId: number): Promise<Array<responseMenuData>> => {
  const response = await $http<Array<responseMenuData>>({
    url: selectConfig.auth.menu.list.url,
    method: 'GET',
    params: {
      memberId: memberId
    }
  })
  return response.data.data
}

export const usePermissionStore = defineStore('permission', () => {
  /** userStore 호출 */
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)
  
  const auth = useAuthStore()
  const { accessToken } = storeToRefs(auth)

  const route = useRoute()
  const router = useRouter()

  const routers = ref<Array<menuData>>([])
  const addRouters = ref<Array<accessRouterData>>([])
  const allMenus = ref<Array<menuData>>([])
  const openMenus = ref<Array<string>>([])

  /** vue-query 정보 */
  const menuVueQuery = ref({
    isStale: true,
    isFetching: true,
    refetch: null as (() => void) | null
  })
  const hasToken = computed(() => !!accessToken.value);
  const menuQuery = useQuery({
    queryKey: ['authMenus', accessToken.value],
    queryFn: () => fetchMenus(user.value.memberId),
    staleTime: 3 * 60 * 60 * 1000, // 3시간 동안 fresh 상태 유지
    refetchOnWindowFocus: true, // 사용자가 다시 창을 보면 자동 새로고침
    refetchOnReconnect: true, // 인터넷 연결이 다시 되면 자동 새로고침
    enabled: hasToken.value
  })

  watchEffect(() => {
    if (user.value.memberId && menuVueQuery.value.refetch) {
      menuVueQuery.value.refetch()
    }
  })

  watchEffect(() => {
    if (menuQuery.isSuccess.value) {
      allMenus.value = menuQuery.data.value!
      menuVueQuery.value.isStale = false // fresh한 상태로 변경

      /** 화면 표시 메뉴 셋팅 */
      const menus: menuData[] = _.map(menuQuery.data.value!, (item) => {
        const pathInfo = getPathData(item.path)
        return {
          title: item.menuName,
          icon: item.icon,
          name: String(item.menuId)!,
          path: pathInfo.path ? `${pathInfo.path}${pathInfo.paramPath}` : '',
          menuLevel: String(item.menuLevel),
          githubOwner: item.githubOwner,
          githubRepo: item.githubRepo,
          githubBranch: item.githubBranch,
          params: pathInfo.params,
          child: [],
          parentMenuId: String(item.parentMenuId),
          sortOrder: item.sortOrder
        }
      })
      const viewRouters = createLeftMenu(menus, menus, 0, '')
      routers.value = viewRouters

      /** 접근권한 있는 메뉴 셋팅 */
      const accessMenus: accessMenu[] = _.map(menuQuery.data.value!, (item) => {
        const pathInfo = getPathData(item.path)
        return {
          title: item.menuName,
          name: String(item.menuId)!,
          path: pathInfo.path ? `${pathInfo.path}${pathInfo.paramPath}` : '',
          menuLevel: item.menuLevel,
          githubOwner: item.githubOwner,
          githubRepo: item.githubRepo,
          githubBranch: item.githubBranch,
          editable: true,
          params: pathInfo.params,
          parentMenuId: String(item.parentMenuId),
          sortOrder: item.sortOrder
        }
      })
      const accessedRouters = getAccessRouters(accessMenus)
      addRouters.value = accessedRouters

      addAuthRouter(addRouters.value)
    }
  })
  watch(
    () => menuQuery.isFetching.value,
    () => {
      if (!menuQuery.isFetching.value) {
        menuVueQuery.value.isFetching = false

        /** menu redirecting */
        router
          .push({
            path: route.fullPath || user.value.url
          })
          .catch(() => {})
      }
    }
  )

  menuVueQuery.value.isFetching = menuQuery.isFetching.value
  menuVueQuery.value.isStale = menuQuery.isStale.value
  menuVueQuery.value.refetch = menuQuery.refetch

  function findOpenMenus(name: string, selfOpen?: boolean) {
    openMenus.value = [] // 초기화
    if (name && allMenus.value && allMenus.value.length > 0) {
      const currentMenu: menuData = _.find(allMenus.value, { menuId: Number(name) }) as menuData
      if (currentMenu && currentMenu.parentMenuId) {
        findUpMenu(currentMenu.parentMenuId)
      }

      if (selfOpen) {
        openMenus.value.push(String(currentMenu.menuId)!)
      }
    } else {
      openMenus.value = []
    }
  }
  function findUpMenu(parentMenuId: string) {
    const upMenu: menuData = _.find(allMenus.value, {
      menuId: parentMenuId
    }) as menuData
    if (upMenu) {
      openMenus.value.push(String(upMenu.menuId)!)
      findUpMenu(upMenu.parentMenuId)
    } else {
      return
    }
  }

  function createLeftMenu(
    _Allmenus: Array<menuData>,
    _menus: Array<menuData>,
    menuLevel: number,
    navi: string
  ) {
    let menuLevel1 = _.filter(_menus, {
      menuLevel: String(menuLevel)
    })
    _.forEach(menuLevel1, (menu) => {
      menu.sortOrder = menu.sortOrder ? (!isNaN(menu.sortOrder) ? Number(menu.sortOrder) : 0) : 0
    })
    menuLevel1 = _.orderBy(menuLevel1, ['sortOrder'], ['asc'])

    const returnMenu: Array<menuData> = []
    let subLevel = []
    _.forEach(menuLevel1, (menu) => {
      subLevel = _.filter(_Allmenus, {
        menuLevel: String(menuLevel + 1),
        parentMenuId: menu.name
      })

      const menuInfo: menuData = {
        title: menu.title,
        icon: menu.icon,
        name: menu.name,
        menuLevel: menu.menuLevel,
        path: menu.path,
        githubOwner: menu.githubOwner,
        githubRepo: menu.githubRepo,
        githubBranch: menu.githubBranch,
        params: menu.params,
        children: [],
        /** api info */
        parentMenuId: menu.parentMenuId,
        sortOrder: menu.sortOrder
      }

      if (subLevel && subLevel.length > 0) {
        menuInfo.children = createLeftMenu(
          _Allmenus,
          subLevel,
          menuLevel + 1,
          navi ? navi + ' > ' + String(menu.title) : String(menu.title)
        )
      }
      returnMenu.push(menuInfo)
    })
    /** LEFT 메뉴(권한이 있는 메뉴) setting */
    if (menuLevel === 0) {
      _.forEach(asyncRouterMap, (item) => {
        if (_.findIndex(returnMenu, { name: item.name }) === -1 && !item.hidden) {
          returnMenu.splice(0, 0, {
            title: '',
            icon: '',
            name: item.name,
            menuLevel: '0',
            path: item.path,
            githubOwner: '',
            githubRepo: '',
            githubBranch: '',
            params: {},
            children: [],
            parentMenuId: '',
            sortOrder: 0
          })
        }
      })
    }
    return returnMenu
  }

  function getAccessRouters(_menus: Array<accessMenu>) {
    const accessRouters: accessRouterData[] = []
    const haveUrlMenus = _.filter(_menus, (item) => {
      return Boolean(item.path)
    })

    _.forEach(asyncRouterMap, (router) => {
      accessRouters.push({
        path: router.path,
        name: router.name,
        meta: {
          title: '',
          // layout: router.meta?.layout,
          // 권한 처리 되고 난 후에 해당 로직 처리
          editable: Boolean(router.meta.editable), // menu.writeYn === 'Y' ? true : false,
          params: {},
          layout: router?.meta?.layout || 'default'
        },
        component: router.component
      })
    })

    if (haveUrlMenus) {
      let subLevel: accessMenu[] = []
      _.forEach(haveUrlMenus, (menu) => {
        subLevel = _.filter(_menus, {
          menuLevel: String(parseInt(menu.menuLevel) + 1),
          parentMenuId: menu.name
        })

        accessRouters.push({
          path: menu.path,
          name: `${menu.name}`,
          meta: {
            title: menu.title,
            // 권한 처리 되고 난 후에 해당 로직 처리
            editable: menu.editable, // menu.writeYn === 'Y' ? true : false,
            params: menu.params,
            layout: 'default',
            githubOwner: menu.githubOwner,
            githubRepo: menu.githubRepo,
            githubBranch: menu.githubBranch,
          },
          component: getComponet(subLevel, menu.path)
        })
      })
    }

    return accessRouters
  }

  function getComponet(subLevel: Array<accessMenu>, frontEndUrl: string) {
    let componet
    if (!frontEndUrl) {
      // url은 최하단, 즉 화면에 표시할 수 있는 url이 있는 경우에만 존재
      componet = undefined
    } else if (subLevel && subLevel.length > 0 && frontEndUrl) {
      // 하위 메뉴가 존재하는데 url이 있을 시 component는 null 처리하여 메뉴 클릭시 혼돈이 없게 처리
      componet = undefined
    } else {
      const directoryPaths = _.split(frontEndUrl, '/')
      /** 제일 처음 빈 공간 제거 */
      directoryPaths.shift()
      let componentData = undefined
      if (directoryPaths && directoryPaths.length > 0) {
        switch (directoryPaths.length) {
          case 1:
            componentData = shallowRef(() => import(`../views/${directoryPaths[0]}.vue`))
            break
          case 2:
            componentData = shallowRef(
              () => import(`../views/${directoryPaths[0]}/${directoryPaths[1]}.vue`)
            )
            break
          case 3:
            componentData = shallowRef(
              () =>
                import(
                  `../views/${directoryPaths[0]}/${directoryPaths[1]}/${directoryPaths[2]}.vue`
                )
            )
            break
          case 4:
            componentData = shallowRef(
              () =>
                import(
                  `../views/${directoryPaths[0]}/${directoryPaths[1]}/${directoryPaths[2]}/${directoryPaths[3]}.vue`
                )
            )
            break
          case 5:
            componentData = shallowRef(
              defineAsyncComponent(
                () =>
                  import(
                    `../views/${directoryPaths[0]}/${directoryPaths[1]}/${directoryPaths[2]}/${directoryPaths[3]}/${directoryPaths[4]}.vue`
                  )
              )
            )
            break
          default:
            break
        }
      }
      componet = componentData
    }
    return componet
  }

  function getPathData(path: string) {
    const pathInfo: urlData = {
      path: path,
      paramPath: '',
      params: {}
    }
    const paramIndex = _.indexOf(path, '?')
    if (paramIndex > -1) {
      const paramString = path.substring(paramIndex + 1, path.length)
      pathInfo.params = _.fromPairs(
        _.map(paramString.split('&'), (text) => {
          return text.split('=')
        })
      )

      pathInfo.path = pathInfo.path.substring(0, paramIndex)

      for (const key in pathInfo.params) {
        pathInfo.paramPath += `/${pathInfo.params[key]}`
      }
    }
    return pathInfo
  }

  return {
    /** state */
    routers,
    addRouters,
    openMenus,
    /** action */
    findOpenMenus
  }
})

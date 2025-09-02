/**
 * 조회용 config
 */
const selectConfig = {
  auth: {
    login: {
      refresh: {
        url: '/api/auth/refresh'
      },
    },
    member: {
      url: '/api/auth/member/info',
    },
    menu: {
      list: {
        url: '/api/auth/member/menus'
      },
    }
  },
  language: {
    generatorJson: {
      url: '/api/lang/message/json'
    }
  },
  attach: {
    setting: {
      get: {
        url: '/api/attach/attachsetting/{0}'
      }
    },
    file: {
      list: {
        url: '/api/attach/attachFiles'
      },
      preview: {
        url: '/api/attach/attachFile/preview'
      },
      down: {
        url: '/api/attach/attachFile/down'
      },
      temp: {
        url: '/api/attach/attachFiles/temp'
      },
    }
  },
  sys: {
    code: {
      mst: {
        list: {
          url: '/api/sys/code/msts/{0}',
          attr: {
            url: '/api/sys/code/msts/{0}/{1}'
          },
          multi: {
            url: '/api/sys/code/msts/multi'
          }
        },
        get: {
          url: '/api/sys/code/mst/{0}/{1}'
        }
      }
    },
  },
}

export default selectConfig

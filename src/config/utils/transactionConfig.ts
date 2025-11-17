/**
 * 수정용 config
 */
const transactionConfig = {
  auth: {
    login: {
      insert: {
        url: '/api/auth/login'
      },
      deoh: {
        url: '/api/auth/login/deoh'
      },
      logout: {
        url: '/api/auth/logout'
      },
      signup: {
        url: '/api/auth/signup'
      }
    }
  },
  log: {
    error: {
      url: '/api/log/error'
    }
  },
  attach: {
    file: {
      upload: {
        url: '/api/attach/attachFile/upload'
      },
      update: {
        url: '/api/attach/attachFile'
      },
      save: {
        url: '/api/attach/attachFile/taskKey'
      },
      delete: {
        url: '/api/attach/attachFile/{0}'
      },
      allDelete: {
        url: '/api/attach/attachFile/{0}/{1}'
      },
      copy: {
        url: '/api/attach/attachFile/copy'
      },
    }
  },
  // com: {
  //   upload: {
  //     uploading: {
  //       url: '/api/com/upload'
  //     },
  //     update: {
  //       url: '/api/com/upload'
  //     },
  //     save: {
  //       url: '/api/com/update/taskKey'
  //     },
  //     delete: {
  //       url: '/api/com/upload/{0}'
  //     },
  //     allDelete: {
  //       url: '/api/com/upload/all/{0}/{1}'
  //     },
  //     copy: {
  //       url: '/api/com/upload/copy'
  //     }
  //   }
  // },
}

export default transactionConfig

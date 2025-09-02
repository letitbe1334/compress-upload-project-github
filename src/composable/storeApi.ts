export function useStoreApi() {
  function loginByUserAccount(
    email: string,
    password: string,
  ) {
    const data = {
      email: email,
      password: password,
    }
    return $http({
      url: transactionConfig.auth.login.insert.url,
      method: 'post',
      data
    })
  }

  function loginByDeohAccount() {
    return $http({
      url: transactionConfig.auth.login.deoh.url,
      method: 'post',
    })
  }

  function logout() {
    return $http({
      url: transactionConfig.auth.login.logout.url,
      method: 'post'
    })
  }


  return {
    loginByUserAccount,
    loginByDeohAccount,
    logout,
  }
}

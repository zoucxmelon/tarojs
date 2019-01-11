/** http请求二次封装处理**/

import Taro from '@tarojs/taro'

const HTTP_STATUS = {
  SUCCESS: 200,
  CLIENT_ERROR: 400,
  AUTHENTICATE: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
}
// 接口请求服务地址
const base = 'http://app-factory-modules-user-server.dev.172.16.20.63.nip.io/apps/9r1eqf3a5ie1/users'

const token = ''
// 错误代码处理
const logError = (name, action, info) => {
  if (!info) {
    info = 'empty'
  }
  try {
    let deviceInfo = Taro.getSystemInfoSync()
    var device = JSON.stringify(deviceInfo)
  } catch (err) {
    Taro.atMessage ? Taro.atMessage({
      'message': 'not support getSystemInfoSync api' + err.message,
      'type': 'error',
    }) : console.error('not support getSystemInfoSync api' + err.message)

  }
  Taro.atMessage ? Taro.atMessage({
    'message': name + action,
    'type': 'error',
  }):console.error(name + action)
  if (typeof info === 'object') {
    info = JSON.stringify(info)
  }
}

export default {
  baseOptions(params, method = 'GET') {
    let { url, data } = params
    // let token = getApp().globalData.token
    // if (!token) login()
    let contentType = 'application/json'
    contentType = params.contentType || contentType
    const option = {
      isShowLoading: true,
      loadingText: '正在加载',
      credentials: 'same-origin', // 允许携带同源cookie
      url: base + url,
      data: data,
      method: method,
      header: { 'content-type': contentType, 'token': token },
      success(res) {
        if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
          return logError('api', '请求资源不存在')
        } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY || res.statusCode === HTTP_STATUS.SERVER_ERROR || res.statusCode === HTTP_STATUS.SERVICE_UNAVAILABLE) {
          return logError('api', '服务端出现了问题')
        } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
          return logError('api', '没有权限访问')
        } else if (res.statusCode === HTTP_STATUS.CLIENT_ERROR) {
          return logError('api', '传参异常')
        } else if (res.statusCode === HTTP_STATUS.GATEWAY_TIMEOUT) {
          return logError('api', '请求超时')
        } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
          return res.data
        }
      },
      error(e) {
        logError('api', '请求接口出现问题', e)
      }
    }
    return Taro.request(option)
  },
  get(url, data = '') {
    let option = { url, data }
    return this.baseOptions(option)
  },
  post: function (url, data, contentType) {
    let params = { url, data, contentType }
    return this.baseOptions(params, 'POST')
  }
}

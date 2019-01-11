/** 接口文档 **/

import Request from './baseConfig'
export default {
  // 通过用户名登陆   参数: userName（用户名）  password（密码）
  testApi (params) {
    let data = {testDate: 'test'}
    return Request.post('/test', data)
  },
}

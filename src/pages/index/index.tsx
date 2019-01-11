import Taro, { Component, Config } from '@tarojs/taro'
// @ts-ignore
import { View, Text, Image } from '@tarojs/components'
import './index.less'

export default class Index extends Component {
  config: Config = {
    navigationBarTitleText: '首页'
  }
  constructor () {
    super(...arguments)
    this.state = {

    }
  }
  render () {
    return (
      <View className='home'>
        <Text>Hello World</Text>
      </View>
    )
  }
}

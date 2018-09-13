/**
 * YFW
 * 
 * 
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  AsyncStorage,
  Text,
  View,
  NativeModules,
} from 'react-native';
import NavigationExperimental from 'react-native-deprecated-custom-components';

import Login from './Login'
import Storage from 'react-native-storage';


var storage = new Storage({
  // 最大容量，默认值1000条数据循环存储
  size: 1000,

  // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
  // 如果不指定则数据只会保存在内存中，重启后即丢失
  storageBackend: AsyncStorage,

  // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
  defaultExpires: 1000 * 3600 * 24 * 31,

  // 读写时在内存中缓存数据。默认启用。
  enableCache: true,

  // 如果storage中没有相应数据，或数据已过期，
  // 则会调用相应的sync方法，无缝返回最新数据。
  // sync方法的具体说明会在后文提到
  // 你可以在构造函数这里就写好sync的方法
  // 或是写到另一个文件里，这里require引入
  // 或是在任何时候，直接对storage.sync进行赋值修改
  // sync: require('./sync')
})  
global.storage = storage;

import DisposeBuy from './DisposeBuy';
import MyMessageScreen from './app/MyMessageScreen';




export default class AwesomeProject extends Component {

componentWillUnmount(){
}

  render() {
    var defaultName = 'Login';
        var defaultComponent = Login;//DisposeBuy  Login
        return (
        <NavigationExperimental.Navigator
          //指定了默认的页面，也就是启动app之后会看到的第一屏，需要两个参数，name跟component
          initialRoute={{ name: defaultName, component: defaultComponent }}
          configureScene={(route) => {
            //跳转的动画
            return NavigationExperimental.Navigator.SceneConfigs.FadeAndroid;
          }}
          renderScene={(route, navigator) => {
            let Component = route.component;
            if(route.component){
               return <Component {...route.params} navigator={navigator} />
            }
          }} />
        );
      // return (<Login />);
      // return (<MainScreen/>);
      // return (<TabBarExample/>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);

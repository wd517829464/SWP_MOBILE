/**
 * Created by yuanguozheng on 16/1/19.
 */
'use strict';

import React, {
    Component,
} from 'react';

import {
    AppRegistry,
    Image,
    ListView,
    StyleSheet,
    Text,
    View,
    Button,
    Alert,
    TouchableHighlight,
    DeviceEventEmitter,
    BackHandler,
    ToastAndroid
} from 'react-native';

import TabNavigator from 'react-native-tab-navigator';
import NavigationExperimental from 'react-native-deprecated-custom-components';


import MainScreen from './MainScreen';
import CollectScreen from './CollectScreen';
import TagScreen from './TagScreen';
import OrderListScreen from './OrderListScreen';
import MyScreen from './MyScreen';
import DisposeBuy from '../DisposeBuy';
import UserOrderList from '../UserOrderList';
import Login from '../Login';
import InquiryListScreen from './InquiryListScreen';


export default class BaseScreen extends Component {
    constructor(props) {
  super(props);
   this.state={
      selectedTab:(this.props.selectedTab?this.props.selectedTab:'home'),
      ticketId:''
  }
    this.backPressed = this.backPressed.bind(this);
}
changeHomeTab(tab){
    this.setState({selectedTab:tab});
    DeviceEventEmitter.emit('changeHomeTab', tab);
    DeviceEventEmitter.emit('checkMessageStatus',tab);
}
componentWillMount(){
    storage.load({
        key: 'loginState',
    }).then(ret => {
        this.setState({
            ticketId:ret['ticketId']
        })
    }).catch(err => {
        // alert('当前登录用户凭证已超时，请重新登录。');
    })
}
    componentDidMount() {
        var st = this;
        DeviceEventEmitter.addListener('login',(text)=>{
            const { navigator} = this.props;
            if (navigator) {
                navigator.push({
                    name:'Login',
                    component:Login,
                    params:{
                        navigator:navigator
                    }
                })
            }
        });
        BackHandler.addEventListener('hardwareBackPressBase',this.backPressed);
    }
    backPressed=()=>{
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                //最近2秒内按过back键，可以退出应用。
                BackHandler.exitApp();
                return false;
            }
        this.lastBackPressed = Date.now();
        ToastAndroid.show("再按一次退出应用!",ToastAndroid.SHORT);
        // this.refs.toast.show('再按一次退出应用!');
        return true;
}
    backPressed2() {
      var st = this;
      var obj = this.props.navigator.getCurrentRoutes();
    //   console.log("sysInfo-currentRouter = "+this.props.navigator.getCurrentRoutes());
        Alert.alert('提示', '你即将返回登录页，\n是否要继续', [
            { text: '取消', onPress: () => this.cancel(), style: 'cancel' },
            { text: '确认', onPress: () => this.confirmBack() }
        ])
        return true;
    }
    cancel(){

    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBase',this.backPressed);
    }
    confirmBack(){
        const { navigator } = this.props;
        if(navigator){
                navigator.push({
                name:'Login',
                component:Login,
                params:{
                    navigator:navigator,
                    ticketId:this.state.ticketId,
                    }
                })
        }
    }
    render() {
        return (
            <TabNavigator tabBarStyle={{backgroundColor:'#ffffff'}}>
                <TabNavigator.Item 
                    title="资源池"
                    selected={this.state.selectedTab==='home'}
                    selectedTitleStyle={styles.selectedTitleStyle}
                    titleStyle={styles.titleStyle}
                    renderIcon={()=><Image source={require("../images/base/tab_icon_ziyuanchi_n.png")} style={styles.iconStyle}/>}
                    renderSelectedIcon={()=><Image source={require("../images/base/tab_icon_ziyuanchi_s.png")} style={styles.iconStyle}/>}
                    onPress={()=>this.changeHomeTab('home')}
                >
                {this.state.ticketId?<MainScreen navigator={this.props.navigator} ticketId={this.state.ticketId}/>:<View></View>}
                </TabNavigator.Item>
                <TabNavigator.Item
                    title="报价单"
                    selected={this.state.selectedTab==='inquiry'}
                    selectedTitleStyle={styles.selectedTitleStyle}
                    titleStyle={styles.titleStyle}
                    renderIcon={()=><Image source={require("../images/base/tab_icon_xunjiadan_n.png")} style={styles.iconStyle}/>}
                    renderSelectedIcon={()=><Image source={require("../images/base/tab_icon_xunjiadan_s.png")} style={styles.iconStyle}/>}
                    onPress={()=>this.changeHomeTab('inquiry')}
                >
                {this.state.ticketId?<InquiryListScreen navigator={this.props.navigator} ticketId={this.state.ticketId}/>:<View></View>}
                </TabNavigator.Item>
                 <TabNavigator.Item
                    title="订单"
                    selected={this.state.selectedTab==='order'}
                    selectedTitleStyle={styles.selectedTitleStyle}
                    titleStyle={styles.titleStyle}
                    renderIcon={()=><Image source={require("../images/base/tab_icon_dingdan_n.png")} style={styles.iconStyle}/>}
                    renderSelectedIcon={()=><Image source={require("../images/base/tab_icon_dingdan_s.png")} style={styles.iconStyle}/>}
                    onPress={()=>this.changeHomeTab('order')}
                >
                {this.state.ticketId?<OrderListScreen navigator={this.props.navigator} ticketId={this.state.ticketId}/>:<View></View>}
                </TabNavigator.Item>
                 <TabNavigator.Item
                    title="收藏夹"
                    selected={this.state.selectedTab==='favorite'}
                    selectedTitleStyle={styles.selectedTitleStyle}
                    titleStyle={styles.titleStyle}
                    renderIcon={()=><Image source={require("../images/base/tab_icon_favorite_n.png")} style={styles.iconStyle}/>}
                    renderSelectedIcon={()=><Image source={require("../images/base/tab_icon_favorite_s.png")} style={styles.iconStyle}/>}
                    onPress={()=>this.changeHomeTab('favorite')}
                >
                {this.state.ticketId?<CollectScreen navigator={this.props.navigator} ticketId={this.state.ticketId}/>:<View></View>}
                </TabNavigator.Item>
            </TabNavigator>
        );
    }
    
}

const styles = StyleSheet.create({
    titleStyle:{
        color:'#99a8bf',
        fontSize:12,
        justifyContent:'center',
        marginBottom:3
    },
    selectedTitleStyle:{
        color:'#267dff'
    },
    iconStyle:{
        justifyContent:'center',
        width:20,
        height:20
    },
    listBox:{
        flex: 1, 
        padding:10,
        flexDirection:'row'
       
    },
    cellBox:{
        flexDirection:'column',
        flex:1,
        
    },
    cellBox_first:{
        flexDirection:'row',
        flex:7,
        justifyContent: 'space-between',
        
        marginBottom:5,
    },
    cellBox_second:{
        flexDirection:'row',
        flex:2,
       

    },
    cellBox_third:{
        flexDirection:'row',
        flex:3

    },
    cellText_distance:{
        fontSize:10,
        color:'lightgrey',
        flex:2,
    },
    cellText_Ent:{
        fontSize:12,
        color:'#8f9fc1',
        flex:7,
    },
    cellTextBox_left:{
        flexDirection:'column',
    },
    cellTextBox_right:{
        flexDirection:'row',
        alignItems:'flex-end',
    },
    cellTextBox:{
        flexDirection:'row',
        justifyContent: 'space-between',
        marginBottom:5,
    },
    cellText_wasteName:{
        marginTop:8,
        fontSize:13,
        color:'#293f6d',
       
    },
    cellText_telNumber:{
        marginTop:4,
        fontSize:10,
        color:'#5b709c'

    },
    cellText_time:{
        color:'#8c9fbe',
        fontSize:11,
        flex:4,
        textAlign:'right'
        
    },
    splitLine:{
        borderBottomWidth:0.5,
        borderBottomColor:'lightgrey'
    },
    cellButton_wasteWeight:{
        padding:0,
        margin:0
    },
    cellButtonTitle_wasteWeight:{
        fontSize:13,
        color:'#293f6d',
        width:60,
        textAlign:'right',
    }
});
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
    TextInput,
    Platform,
    Text,
    View,
    Alert,
    TouchableOpacity
} from 'react-native';

import MessageCount from './MessageCount';
import BaseScreen from '../base';

export default class Top extends Component {
    constructor(props) {
    super(props);
        this.state={
            searchContent:'',
        }
    }
    
    render() {
        return (
        <View style={styles.container}>
                
            <View style={styles.headBar}>
                <View style={styles.back_view}><TouchableOpacity onPress={this.back.bind(this)}><Image style={[styles.back_btn]} resizeMode={Image.resizeMode.contain} source={require('../../images/header/nav_icon_back.png')} /></TouchableOpacity></View>
                <View style={styles.middleView}>
                    <Text style={styles.middleText}>{this.props.title}</Text>
                 </View>
                <MessageCount navigator={this.props.navigator} ticketId={this.props.ticketId}/>
            </View>

         </View>  
            
        )
    }
    goCart(){
         const { navigator } = this.props;
         navigator.push({
            name: 'BaseScreen',
            component: BaseScreen,
            params: {
                navigator:navigator,
                ticketId:this.props.ticketId,
                selectedTab:'cart'
            }
        });
    }
    startSearch(){
        Alert.alert('开始按'+this.state.searchContent+'搜索...');
    }
    back(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
}

const styles = StyleSheet.create({
    headBar:{
        flexDirection: 'row',
        // 水平排布
        paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
        height: Platform.OS === 'ios' ? 68 : 48,   // 处理iOS状态栏
        backgroundColor: '#2d58d7',
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
        justifyContent: 'center'
    },
    container: {
        flexDirection: 'column',   // 水平排布
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },
    back_view:{
        width:20,
    },
    back_btn:{
        width:20,
        height:20,
    },
    middleView: {
        height: 30,
        flexDirection: 'row',
        flex: 4,  // 类似于android中的layout_weight,设置为1即自动拉伸填充
        alignItems: 'center',
        marginLeft:10
    },
    middleText:{
        textAlign:'center',
        flex:1,
        color:'#fff',
        fontSize:16
    },
    cartIcon:{
        width: 25,
        height: 25,
        marginTop:12,
        marginRight:5
    },
    MessageCount:{
        width:20
    },
    message_point:{
        width:8,
        height:8,
        backgroundColor:'#fe4062',
        flexDirection:'column',
        alignItems:'center',
        borderRadius:4,
        position: 'absolute',
        right:6,
        top:8
    },
    cart_message_point:{
        right:4,
        top:11
    },
    
});
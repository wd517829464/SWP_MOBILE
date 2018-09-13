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

export default class TopWithoutDing extends Component {
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
                <View style={styles.back_view}><TouchableOpacity onPress={this.back.bind(this)}>
                    <Image style={[styles.back_btn]} 
                    resizeMode={Image.resizeMode.contain} 
                    source={require('../../images/navigator/nav_icon_backblue.png')} /></TouchableOpacity></View>
                <View style={styles.middleView}>
                    <Text style={styles.middleText}>{this.props.title}</Text>
                 </View>
                 <View style={{width:56,}}></View>                            
            </View>
            
         </View>  
            
        )
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
        backgroundColor: 'white',
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
        paddingBottom:5
    },
    container: {
        flexDirection: 'column',   // 水平排布
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },
    back_view:{
       flex:1
    },
    back_btn:{
        width:20,
        height:20,
        marginTop:10
    },
    middleView: {
        height: 30,
        flexDirection: 'row',
        flex: 4,  // 类似于android中的layout_weight,设置为1即自动拉伸填充
        alignItems: 'center',
        marginLeft: 8,
        marginRight: 12,
        marginTop: 8
    },
    middleText:{
        textAlign:'center',
        flex:1,
        color:'#2d58d7',
        fontSize:16
    },
    
});
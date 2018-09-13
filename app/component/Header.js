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
    TouchableHighlight,
    DeviceEventEmitter,
    TouchableOpacity
} from 'react-native';

import MessageCount from './MessageCount';
import MyMessageScreen from '../MyMessageScreen';

export default class Header extends Component {
    constructor(props) {
    super(props);
        this.state={
            searchContent:'',
        }
    }
    componentDidMount(){
        // var st = this;
        // DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
        //     if(text=='home'){
        //         st.setState({searchContent:''});
        //     }
        // });
    }
    render() {
        // <View style={styles.searchBox}>
        //     <Image style={[styles.searchIcon]} resizeMode={Image.resizeMode.contain} source={require('../../images/header/icon_search.png')} />
        //     <TextInput underlineColorAndroid={"transparent"}
        //         placeholder='搜索危废代码、名称、企业名称等' placeholderTextColor="#cfe2ff" onSubmitEditing={this.startSearch.bind(this)} value={this.state.searchContent}
        //         onChangeText={(text) => this.setState({searchContent: text})} iosclearButtonMode="while-editing" returnKeyType ='search'
        //         style={styles.inputText}/>
        // </View>
        return (
        <View style={styles.container}>
            <View style={styles.headBar}>
                <TouchableOpacity onPress={this.goPersonMessage.bind(this)}>
                    <Image style={{width:18,height:18,marginLeft:5}} resizeMode={Image.resizeMode.contain} source={require('../../images/base/nav_icon_setting.png')}/>
                </TouchableOpacity>
                 <Text style={{flex:1,textAlign:'center',color:'#fff',fontSize:15}}>{this.props.title}</Text>
                 <MessageCount  navigator={this.props.navigator} ticketId={this.props.ticketId}/>
            </View>

         </View>  
            
        )
    }
    goPersonMessage(){
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'MyMessageScreen',
                component:MyMessageScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                }
            })
        }
    }
    startSearch(){
        // Alert.alert('执行startSearch。。。');
        DeviceEventEmitter.emit('searchEnterprise',this.state.searchContent);
    }
}

const styles = StyleSheet.create({
    headBar:{
        flexDirection: 'row',
        // 水平排布
        paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
        height: Platform.OS === 'ios' ? 68 : 48,   // 处理iOS状态栏
        backgroundColor: '#2676ff',
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
        justifyContent: 'center',
    },
    container: {
        flexDirection: 'column',   // 水平排布
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },
    logo: {
        height: 24,
        width: 64,
        resizeMode: 'stretch'  // 设置拉伸模式
    },
    searchBox: {
        height: 30,
        flexDirection: 'row',
        flex: 1,  // 类似于android中的layout_weight,设置为1即自动拉伸填充
        borderRadius: 5,  // 设置圆角边
        // backgroundColor: 'white',
        alignItems: 'center',
        marginLeft: 8,
        marginRight: 12,
        marginTop: 8
    },
    scanIcon: {
        height: 26.7,
        width: 26.7,
        resizeMode: 'stretch'
    },
    searchIcon: {
        position:'absolute',
        marginLeft: 16,
        width: 14,
        height: 14,
        resizeMode: 'stretch'
    },
    voiceIcon: {
        marginLeft: 5,
        marginRight: 8,
        width: 25,
        height: 25,
        marginTop:9,
        resizeMode: 'stretch'
    },
    inputText: {
        flex: 1,
        backgroundColor: '#5191ff',
        fontSize: 14,
        color:'#fff',
        textAlign:'center',
        borderRadius:4,
        paddingBottom:(Platform.OS === "ios")?0:6,
    },
    listBox:{
        flex: 1, 
        padding:10,
        backgroundColor:'green'
       
    },
    messageCount:{
        width:18,
        height:18,
        backgroundColor:'#fe4062',
        flexDirection:'column',
        alignItems:'center',
        borderRadius:9,
        position: 'absolute',
        right:0,
        top:3
    },
    messageCount_text:{
        color:'#fff',
        textAlign:'center',
        fontSize:10,
        marginTop:2
    }
});
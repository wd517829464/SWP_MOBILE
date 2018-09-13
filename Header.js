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
} from 'react-native';




export default class Header extends Component {
    render() {
        return (
        <View style={styles.container}>
                
            <View style={styles.headBar}>
                <View style={styles.searchBox}>
                    {/*<Image source={require('./images/header/icon_search.png')} style={styles.searchIcon}/>*/}
              
                    <TextInput underlineColorAndroid={"transparent"}
                        keyboardType='web-search'
                        placeholder=' 搜索危废代码、名称、企业名称等' placeholderTextColor="white"
                        style={styles.inputText}/>
                    {/*<Image source={require('./images/header/icon_voice.png')} style={styles.voiceIcon}/>*/}
                     </View>
            </View>

         </View>  
            
        )
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
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
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
        backgroundColor: 'white',
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
        marginLeft: 6,
        marginRight: 6,
        width: 16.7,
        height: 16.7,
        resizeMode: 'stretch'
    },
    voiceIcon: {
        marginLeft: 5,
        marginRight: 8,
        width: 15,
        height: 20,
        resizeMode: 'stretch'
    },
    inputText: {
        flex: 1,
        backgroundColor: '#0000ff60',
        fontSize: 14,
        color:'blue',
       
    },
    listBox:{
        flex: 1, 

        padding:10,
        backgroundColor:'green'
       
    }
});

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
    StatusBar,
    View,
    Platform,
    Button,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    RefreshControl,
    DeviceEventEmitter,
    NativeModules,
    BackHandler,
    NativeEventEmitter,

} from 'react-native';

import Header from './Header';
import DisposeBuyItem from './app/component/DisposeBuyItem'
import Dialog from './app/component/dialog';
import NetUtil from './app/util/NetUitl'
import Toast, { DURATION } from 'react-native-easy-toast'
import { SwipeListView } from 'react-native-swipe-list-view';
import DetailInfoList from './DetailInfoList';
import InfoCenterItem from './app/component/InfoCenterItem.js';
import InfoCenterMainItem from './app/component/InfoCenterMainItem.js';
import BaseScreen from './app/base';
const { NimModule } = NativeModules;

var nativeBri = NativeModules.YXMessageEmitter;
const NModue = new NativeEventEmitter(nativeBri);

var newSingleShopList = [];

export default class InfoCenter extends Component {

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2;
            }
        });
        var dsUp = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2;
            }
        });
        const { ticketId } = this.props;
        this.state = {
            dataSource: ds,
            dataSourceUp:dsUp,
            isLoading: false,
            pageIndex: 1,
            pageSize: 10,
            ticketId: ticketId,
            isHasNew: [],
            topData: [],
            tempType: "yunxinMessage",
            isYunxHasNew: false,
        };
        this.backKeyPressed = this.backKeyPressed.bind(this);

    }
    componentWillMount() {
        this.systemMessageList = [];
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.ticketId=ret['ticketId'];
            this.setState({
                ticketId:this.ticketId
            })
            this.getTopOneAndReadflag();
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    async loadData(editing) {
        var st = this;
        var f = false;
        NimModule.requestRecentContacts("1x",
            (messageObj) =>{    
            for (var i = 0; i < messageObj.length; i++) {
                var obj = messageObj[i];
                if (obj) {
                    if(messageObj[i]["isHasRead"] == false){
                        f = true;
                    }
                }
            }
            st.setState({ dataSource: st.state.dataSource.cloneWithRows(messageObj), isLoading: false, isYunxHasNew: f, });
            if(f){
                DeviceEventEmitter.emit("reciveNewMessage", '0');
            }
            } 
        )
       
    }

    componentDidMount() {
        var st = this;
        this.loadData(false);
        // this.getNTESMessageHistoryFromLocal();
        BackHandler.addEventListener('hardwareBackPressIC', this.backKeyPressed);
        DeviceEventEmitter.addListener('updateMessageStatus', function (noticeId) {
            st.setState({ dataSource: st.state.dataSource.cloneWithRows([]), });
            st.loadData(false);
            st.getTopOneAndReadflag();
        });
        DeviceEventEmitter.addListener('toast', function (text) {
            if(text){
                this.refs.toast.show(text);
            }
        });
        this.subscription = NModue.addListener('isMessageSendOrRecived',(data)=>this._getNotice(data));
        
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressIC',this.backKeyPressed);
        this.subscription.remove()        
    }
    backKeyPressed(){
        this.goBack();
        return true;
    }
    goBack() {
        var { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    _getNotice(data){
        DeviceEventEmitter.emit("reciveNewMessage", '0');
        this.loadData();        
    }
    del(index) {

    }
    getNTESMessageHistoryFromLocal() {

    }
    getTopOneAndReadflag() {
        var f = [false, false, false, false];
        var topData = [{ createTime: '' }, { createTime: '' }, { createTime: '' }, { createTime: '' }];
        var st = this;
        NetUtil.ajax({
            url: '/sysNoticeMb/listNoticeCategory',
            data: {
                ticketId: st.ticketId,
                entType:'DISPOSITION'
            },
            success: (responseJson) => {
                if(responseJson.status != 1){
                    this.refs.toast.show(responseJson.infoList[0]);
                    return;
                }
                var responseData = responseJson.data;
                if (responseData) {
                    console.log(responseData);
                    topData = responseData;
                    for (var j = 0; j < topData.length; j++) {
                        if(topData[j].notice){
                            f[j] = topData[j].notice.hasRead?false:true;
                            topData[j]["notice"]["isNULL"] = false;
                        }else{
                            // topData[j]["notice"]["noticeContent"] = "";
                            topData[j]["notice"] = {"noticeContent":"","hasRead":true,"isNULL":true};
                            f[j] = false;
                        }
                        
                        if (topData[j]["codeValue"]["create_time"]) {

                        } else {
                            topData[j]["codeValue"]["create_time"] = "";
                        }
                        switch(topData[j].codeValue.code){
                            case "PURCHASE_STATUS":
                            topData[j].codeValue.icon = require('./images/message/messages_icon_PURCHASE_STATUS.png');
                            break;
                            //("PURCHASE_STATUS","购买动态"),
                            case "NEW_ORDER":
                            topData[j].codeValue.icon = require('./images/message/messages_icon_NEW_ORDER.png');                            
                            break;
                            //("NEW_ORDER","新的订单"),
                            case "NEW_INQUIRY":                            
                            topData[j].codeValue.icon = require('./images/message/messages_icon_NEW_RESOURCELIST.png');
                            break;
                            //("NEW_RESOURCELIST","新的资源单"),
                            case "SYS_TYPE":
                            topData[j].codeValue.icon = require('./images/message/messages_icon_SYS_TYPE.png');                            
                            break;
                            //("SYS_TYPE","系统消息"),
                            case "ACTIVITY_STATUS":
                            topData[j].codeValue.icon = require('./images/message/messages_icon_ACTIVITY_STATUS.png');                            
                            break;
                            //("ACTIVITY_STATUS","活动动态");
                            default:
                            topData[j].codeValue.icon = require('./images/message/messages_icon_SYS_TYPE.png');                            
                            break;
                        }
                    }
                    st.setState({ isHasNew: f, topData: topData,dataSourceUp:st.state.dataSourceUp.cloneWithRows(topData)});
                }
            },
            error: (err) => {
                console.log(err);

            }
        });

            if (!f[0] && !f[1] && !f[2] && !f[3]) {
                DeviceEventEmitter.emit("flushNotificationStatus", '0');
            }else{
                DeviceEventEmitter.emit("reciveNewMessage", '0');

            }


    }

    onRefresh() {

        var st = this;
        setTimeout(function () {
            st.setState({ pageIndex: 1, });
            st.systemMessageList = [];
        }, 100);
        this.loadData(false);
    }
    onEndReached() {
        console.log("endReached");
        var st = this;
        setTimeout(function () {
            st.setState({ pageIndex: st.state.pageIndex + 1, });
        }, 100);
        this.loadData(false);
    }
    render() {
        const { ticketId } = this.state;
        
        return (
            <View style={styles.box}>
                <StatusBar barStyle="default" />
                <View style={styles.headBar}>
                    <TouchableOpacity onPress={_ => { this.goBack() }}>
                        <Image source={require('./images/navigator/nav_icon_backblue.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>消息</Text>

                </View>
                <View style={styles.splitLine}></View>

                <View style={styles.listBox}>
                <ListView
                    dataSource={this.state.dataSourceUp}
                    enableEmptySections={true}
                    renderRow={(rowData, sectionID, rowID) =>
                        <InfoCenterMainItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} ticketId={ticketId} />
                    }
                />
            </View>
                <View style={[styles.messageBox, { height: 12, backgroundColor: '#f1f2f7', }]}></View>
                <View style={styles.listBox}>
                    <ListView
                        dataSource={this.state.dataSource}
                        enableEmptySections={true}
                        refreshControl={
                            <RefreshControl
                                onRefresh={this.onRefresh.bind(this)}
                                refreshing={this.state.isLoading}
                                colors={['#ff0000', '#00ff00', '#0000ff']}
                                enabled={true}
                            />
                        }
                        renderRow={(rowData, sectionID, rowID, moduleEngName) =>
                            <InfoCenterItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} moduleEngName={this.state.tempType} />
                        }
                        onEndReachedThreshold={20}
                        onEndReached={this.onEndReached.bind(this)}
                    />
                </View>
                {this.state.loading ? <Image style={styles.loadImage} resizeMode={Image.resizeMode.contain} source={require('./images/base/load.gif')} /> : null}
                <Toast ref="toast"/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    loadImage: {
        position: 'absolute',
        top: 250,
        alignSelf: 'center',
    },
    listBox: {
        // flex: 1,
        // padding:10,
        flexDirection: 'row',

    },
    headerTitle: {
        textAlign: 'center',
        color: '#2676ff',
        flex: 1,
        fontSize: 16,
        paddingRight: 24,

    },

    splitLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#E6EbF5'
    },
    splitLineTop: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#E9EDF7",
    },
    splitLineBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#dce4f2",
    },
    messageBox: {
        height: 72,

        flexDirection: 'row',
        backgroundColor: 'white',

    },
    messageBoxLeft: {

    },
    messageBoxRight: {
        flex: 9,
        flexDirection: 'column',
        marginLeft: 12,

    },
    messageBoxRightUp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    messageBoxRightDown: {

    },


    headBar: {
        flexDirection: 'row',
        // 水平排布
        paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
        height: Platform.OS === 'ios' ? 64 : 44,   // 处理iOS状态栏
        backgroundColor: 'white',
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },

    headerLeftIcon: {
        marginLeft: 12,
        marginRight: 6,
        width: 12,
        height: 20,
        resizeMode: 'stretch'
    },
    headerRightIcon: {
        marginLeft: 5,
        marginRight: 8,
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },




    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75
    },
    backRightBtnLeft: {
        backgroundColor: '#cad5e6',
        right: 75
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0
    },

    backTextWhite: {
        color: '#FFF'
    },

});
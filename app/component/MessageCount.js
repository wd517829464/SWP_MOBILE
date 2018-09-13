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
    DeviceEventEmitter,
    TouchableHighlight,
    TouchableOpacity,
    NativeModules,
    ToastAndroid,

} from 'react-native';

import InfoCenter from '../../InfoCenter';
const { NimModule } = NativeModules;
import NetUtil from '../util/NetUitl';

export default class MessageCount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchContent: '',
            isHasNew: false,//默认没有新消息
            isYXNew:false,  //云信是否有新消息
            flag:false,     //系统消息是否有新的提醒
        }
        
    }
    componentWillMount(){
        this.refreshStatus();
    }
    componentDidMount(){
        var st = this;
        this.listener1=DeviceEventEmitter.addListener("reciveNotification", function (obj) {
            st.setState({ isHasNew: true, });
        });
        this.listener2=DeviceEventEmitter.addListener("flushNotificationStatus", function (obj) {
            st.setState({ isHasNew: false, });
        });
        this.listener3=DeviceEventEmitter.addListener("reciveNewMessage", function (obj) {
            st.setState({ isHasNew: true, });
        });
        this.listener4=DeviceEventEmitter.addListener("checkMessageStatus", function (obj) {
           st.refreshStatus();
        });
    }
    componentWillUnmount(){
        this.listener1.remove();
        this.listener2.remove();
        this.listener3.remove();
        this.listener4.remove();
    }
    refreshStatus(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.getReadflag(ret['ticketId']);
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    getReadflag(ticketId) {
        var f = false;
        var isYXNew = false;
        var st = this;
        NetUtil.ajax({
            url: '/sysNoticeMb/getUnreadNoticeCount',
            data: {
                ticketId: ticketId,
            },
            success: (responseJson) => {
                var responseData = responseJson.data;
                if (responseData.data > 0) {
                    st.setState({ isHasNew: true,  flag:true,});
                }
            },
            error: (err) => {
                console.log(err);

            }
        });
        
        NimModule.requestRecentContacts("1x",
            (messageObj) =>{     
            for (var i = 0; i < messageObj.length; i++) {
                var obj = messageObj[i];
                if (obj) {
                    if(obj["unreadCount"]>0){
                        isYXNew = true;
                        break;
                    }
                }
            }
            isYXNew = st.state.flag||isYXNew;
            console.log("sysInfoYXNewStatus: "+isYXNew);
            NimModule.getObject("IsHasNewMessage",(obj)=>{
                if(obj == "1"){
                    st.setState({ isHasNew: true,isYXNew:true,  });
                }else{
                    st.setState({ isHasNew: isYXNew,isYXNew:isYXNew,  });
                }
            });
            
        } );

    }
    render() {
        // <Text style={styles.messageCount_text}>5</Text>
        return (

            <TouchableOpacity onPress={this.gotoMessageList.bind(this)}>
                <View style={styles.MessageCount}>
                    <Image style={[styles.voiceIcon]} resizeMode={Image.resizeMode.contain} source={require('../../images/header/nav_icon_message.png')} />
                    {this.state.isHasNew ? <View style={styles.message_point}></View> : <View></View>}
                </View>
            </TouchableOpacity>
        )
    }

    gotoMessageList() {

        storage.load({
            key: 'loginState',
        }).then(ret => {
            var { navigator } = this.props;
            if (navigator) {
                navigator.push({
                    name: 'InfoCenter',
                    component: InfoCenter,
                    params: {
                        ticketId: ret.ticketId
                    }
                });
            }
        }).catch(err => {

            alert('当前登录用户凭证已超时，请重新登录。');
            console.log(JSON.stringify(err));
        })




    }
}

const styles = StyleSheet.create({
    message_point: {
        width: 8,
        height: 8,
        backgroundColor: '#fe4062',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 4,
        // position: 'absolute',
        right: 6,
        // top: 8
    },
    voiceIcon: {
        marginLeft: 5,
        marginRight: 8,
        width: 25,
        height: 25,
        // marginTop: 9,
        resizeMode: 'stretch'
    },

});
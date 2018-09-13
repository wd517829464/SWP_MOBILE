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
    ScreenView,
    Button,
    Alert,
    TouchableOpacity,
    BackHandler,
    RefreshControl,
    StatusBar,
    ScrollView,
    Platform,
} from 'react-native';
import Constants from './util/Constants';
import NetUitl from './util/NetUitl';
import Login from '../Login';
import {NativeModules} from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast';
export default class MyMessageScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            userInformation:{},
            enterpriseInformation:{},
            newVersion:''
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    componentWillMount(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
           this.loadData(ret);
           this.compareVersion(ret);
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    async loadData(ret){
        NetUitl.ajax({
            url:'/personaluserservice/personalInformation.htm',
            data:{
                ticketId: ret.ticketId,
                enterpriseId: ret.entId,
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                // console.log("devResponseJson = "+responseData);
                if (responseData) {
                    this.setState({
                        userInformation:responseData.data.userInformation,
                        enterpriseInformation:responseData.data.enterpriseInformation
                    });
                }
            }
        });
    }
    compareVersion(ret){
        NetUitl.jsonAjax({
          url:'/appManagement/getLatestVersion',
          data:{
            appType:"ANDROID",
            entType:"DISPOSITION",
            ticketId:ret.ticketId
          },
          success:(result)=>{
            if(result.status==1&&result.data){
                this.setState({
                    newVersion:result.data
                })
            }
          }
        })
      }
    back(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
    backKeyPressed(){
        this.back();
        return true;
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressMM', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressMM',this.backKeyPressed);
    }
    render() {
        var {userInformation,enterpriseInformation}=this.state;
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        var heights = Dimensions.get('window').height;
        return (
            <View style={{flex:1,backgroundColor:'#f7f8fa',paddingBottom:54}}>
                <StatusBar barStyle="default" />
                <View style={styles.top}>
                    <TouchableOpacity onPress={this.back.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_backblue.png')} resizeMode={Image.resizeMode.contain} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <Text style={styles.middleText}>设置</Text>
                    <Text></Text>
                </View>
                <ScrollView>
                <View style={styles.whiteBg}>
                    <View style={styles.title}>
                        <View style={styles.title_left}>
                            <Image style={[styles.enterIcon]} resizeMode={Image.resizeMode.contain} source={require('../images/mine/common_icon_company.png')} />
                            <Text style={styles.title_text}>企业信息</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>企业名称</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{enterpriseInformation.entName}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>企业代码</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{enterpriseInformation.entCode}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>地址</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{enterpriseInformation.entAddress}</Text></View>
                    </View>
                    <View style={[styles.info,{borderBottomWidth:0}]}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>状态</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{enterpriseInformation.enterpriseStatusLabel}</Text></View>
                    </View>
                </View>
                <View style={styles.whiteBg}>
                    <View style={styles.title}>
                        <View style={styles.title_left}>
                            <Image style={[styles.enterIcon]} resizeMode={Image.resizeMode.contain} source={require('../images/mine/common_icon_personal.png')} />
                            <Text style={styles.title_text}>联系人信息</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>联系人</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{userInformation.userName||'暂无'}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>联系电话</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{userInformation.phoneNo||'暂无'}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>邮箱</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{userInformation.mailAddress||'暂无'}</Text></View>
                    </View>
                </View>
                <View style={styles.whiteBg}>
                    <View style={styles.title}>
                        <View style={styles.title_left}>
                            <Image style={[styles.enterIcon]} resizeMode={Image.resizeMode.contain} source={require('../images/mine/common_icon_personal.png')} />
                            <Text style={styles.title_text}>版本信息</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>版本号</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{Constants.version}</Text></View>
                        <View style={styles.info_right2}>
                            {this.state.newVersion.versionCode!=Constants.version?
                            <TouchableOpacity style={styles.newClick} onPress={this.downloadAPK.bind(this)}>
                                <Text style={styles.newStyle}>NEW</Text>
                                <Text style={{color:'#99a8bf'}}>有新版本可用</Text>
                            </TouchableOpacity>:<Text style={{color:'#666'}}>已是最新版本</Text>}
                        </View>
                    </View>
                </View>
                 {/*<View style={styles.whiteBg}>
                    <View style={styles.title}>
                        <View style={styles.title_left}>
                            <Image style={[styles.enterIcon,styles.password_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/mine/common_icon_password.png')} />
                            <Text style={styles.title_text}>账户密码</Text>
                        </View>
                        <TouchableOpacity onPress={()=>Alert.alert('去设置密码')}><Text style={styles.title_btn}>去设置  &gt;</Text></TouchableOpacity>
                    </View>
                </View>*/}
                </ScrollView>
                <View style={styles.btn} width={widths}>
                     <TouchableOpacity onPress={this.loginOut.bind(this)} style={styles.cancelClick}><Text style={styles.btn_text}>退出登录</Text></TouchableOpacity>
                </View>
                <Toast ref="toast" />
            </View>
        );
    }
    downloadAPK(){
        NativeModules.DownloadApk.downloading('http://www.yifeiwang.com/yfw.apk',"yfw.apk");
        this.refs.toast.show('yfw.apk正在下载...');
    }
    loginOut(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            ret.ticketId='';
            storage.save({
                key: 'loginState', 
                rawData: ret
            });
            const { navigator } = this.props;
            if(navigator){
                navigator.replace({
                    name:'Login',
                    component:Login,
                    params:{navigator:navigator}
                });
            }
        }).catch(err => {
            console.log(JSON.stringify(err));
        })
    }
     
}

const styles = StyleSheet.create({
    headerLeftIconView:{
        paddingRight:15,
        paddingTop:8,
        paddingBottom:8
    },
    headerLeftIcon:{
        width:12,
        height:20,
        marginLeft:15
    },
    top:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor:'#fff',
        paddingTop:(Platform.OS === "ios")?30:10,
        paddingBottom:10,
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7'
    },
    back:{
        color:'#2676ff',
        paddingLeft:20,
        fontSize:25
    },
    middleText:{
        alignSelf:'center',
        color:'#2676ff',
        marginRight:20,
        fontSize:16
    },
    whiteBg:{
         marginTop:8,
        backgroundColor:'#fff',
    },
    title:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft:20,
        paddingRight:20,
        borderTopWidth:1,
        borderTopColor:'#e9edf7',
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7',
        paddingTop:10,
        paddingBottom:10
    },
    title_left:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    enterIcon:{
        width:18,
        height:18,
        marginRight:10
    },
    password_btn:{
        width:24,
        height:24,
    },
    title_text:{
        color:'#293f66',
        fontSize:15
    },
    title_btn:{
        color:'#99a8bf',
        fontSize:14
    },
    info:{
        marginLeft:20,
        marginRight:20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor:'#fff',
        paddingTop:15,
        paddingBottom:15,
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7',
    },
    info_left:{
        flex:2,
    },
    info_right:{
        flex:3
    },
    info_right2:{
        position:'absolute',
        right:0
    },
    newClick:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    newStyle:{
        alignSelf:'center',
        color:'#ff0000',
        borderColor:'#ff0000',
        borderWidth:1,
        borderRadius:4,
        width:40,
        textAlign:'center',
        fontSize:12,
        paddingTop:2,
        // paddingBottom:4
    },
    info_left_text:{
        color:'#99a8bf',
        alignSelf:'flex-end',
        paddingRight:30
    },
    info_right_text:{
        color:'#293f66',
    },
    btn:{
        backgroundColor:'#ffffff',
        borderRadius:4,
        borderTopColor:'#e9edf7',
        borderTopWidth:1,
        position:'absolute',
        bottom:0,
    },
    btn_text:{
        color:'#293f66',
        alignSelf:'center',
        fontSize:15
    },
    cancelClick:{
        flex:1,
        paddingTop:15,
        paddingBottom:15
    }
});
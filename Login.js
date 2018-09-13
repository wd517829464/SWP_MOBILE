/**
 * Created by zhangl.
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
    ActivityIndicator,
    TouchableHighlight,
    StatusBar,
    Keyboard,
    Animated,
    TouchableWithoutFeedback,
    Navigator,
    Alert,
    NativeModules,
    DeviceEventEmitter,
    TouchableOpacity,
    BackHandler,
    Text,
    View,
} from 'react-native';

import RSAUtils from './lib/RSA';
import DisposeBuy from './DisposeBuy';
import BaseScreen from './app/base';
import RegisterScreen from './app/RegisterScreen';
import BindEnterScreen from './app/BindEnterScreen';
import BindStatusScreen from './app/BindStatusScreen';
import JPushModule from 'jpush-react-native';
import NetUtil from './app/util/NetUitl';
import Toast, {DURATION} from 'react-native-easy-toast';

var Dimensions = require('Dimensions');
var width_screen = Dimensions.get('window').width;
var height_screen = Dimensions.get('window').height;

const { NimModule } = NativeModules;
var { NativeAppEventEmitter } = require('react-native');

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = { shopList: [], 
            textUserName: '', 
            textUserPwd: '', 
            ticketId: '', 
            isInLoginProgress: false, 
            loginMethod1: true, 
            animating: false, 
            keyboardHeight: new Animated.Value(0),
            imageHeight: new Animated.Value(192)
        }
        // 读取
        storage.load({
            key: 'loginState',
        }).then(ret => {
            //  alert(ret.userName);
            console.log(ret);
            this.setState({ textUserName: ret.userName, textUserPwd: ret.userPwd });
        }).catch(err => {
            this.setState({ textUserName: '', textUserPwd: '' });

            switch (err.name) {
                case 'NotFoundError':
                    // TODO;
                    break;
                case 'ExpiredError':
                    // TODO
                    break;
            }
        })
        console.disableYellowBox = true;
        console.warn('YellowBox is disabled.');
        this.backPressed = this.backPressed.bind(this);
    };
    textInputOnFocus(){

    };

    textInputOnBlur(){

    };

    activityIndicatorMethod() {

        if (this.state.animating) {
            this.setState({
                animating: false,

            });
        } else {
            this.setState({
                animating: true,
            });
        }
    }
    onLoginButtonPress(text) {

        if (this.state.isInLoginProgress) {
            return;
        }
        var encryptedPwd = RSAUtils.encryptByRSA(this.state.textUserPwd);
        this.activityIndicatorMethod();
        this.getMoviesFromApiAsync(encryptedPwd);
    };
    async getMoviesFromApiAsync(encryptedPwd) {
        console.log(JSON.stringify({
            phoneNum: this.state.textUserName,
            password: encryptedPwd,
        }));
        const { navigator } = this.props;
        NetUtil.ajax({
            url: '/loginservice/login',
            data: {
                phoneNum: this.state.textUserName,
                password: encryptedPwd,
            },
            success: (responseJson) => {
                this.activityIndicatorMethod();
                var responseData = responseJson;
                if (responseData) {
                    this.state.isInLoginProgress = false;

                    if (responseData["status"] == 'Success' || responseData["status"] == 1) {
                        NetUtil.collectingUserBehavior(responseData["data"]["ticketId"],'APP_LOGIN');
                        var enterTypes = responseData["data"]["enterTypes"];
                        if(!enterTypes){
                            if(navigator){
                                navigator.push({
                                    name: 'BindEnterScreen',
                                    component: BindEnterScreen,
                                    params: {
                                        ticketId: responseData["data"]["ticketId"]
                                    }
                                });
                            }
                            return;
                        }else if(enterTypes&&enterTypes.length>0&&enterTypes[0]['code']=='PRODUCTION'){
                            this.refs.toast.show('请使用处置企业帐号或者处置代理商账号登录!');
                            return;
                        }else if(responseData["data"]['user']['userStatus']!=='PASS'||responseData["data"]['enterpriseInfo']['enterStatus']=='SUBMIT'){
                            if(navigator){
                                navigator.push({
                                    name: 'BindStatusScreen',
                                    component: BindStatusScreen,
                                    params: {
                                        ticketId:responseData["data"]["ticketId"],
                                        enterId:responseData["data"]['user']['enterpriseId'],
                                        userStatus:responseData["data"]['user']['userStatus'],
                                        enterStatus:responseData["data"]['enterpriseInfo']['enterStatus'],
                                        entType:enterTypes.length>0?enterTypes[0]['code']:''
                                    }
                                });
                            }
                            return;
                        }
                        // ToastAndroid.show("登录成功!",ToastAndroid.SHORT);
                        this.refs.toast.show('登录成功!');
                        var cantonCode='';
                        if(enterTypes.length>0&&enterTypes[0]['code']=='DIS_FACILITATOR'){
                            cantonCode=responseData["data"]['enterpriseInfo']['responsibleCantonCode']
                        }else{
                            cantonCode=responseData["data"]["user"]["cantonCode"];
                        }
                        var userInfo = {
                            userName: this.state.textUserName,
                            userPwd: this.state.textUserPwd,
                            ticketId: responseData["data"]["ticketId"],
                            yunxUserId:responseData["data"]["imaccid"],
                            yunxToken:responseData["data"]["imtocken"],
                            entId:responseData["data"]["user"]["enterpriseId"],
                            entType:enterTypes.length>0?enterTypes[0]['code']:'',
                            cantonCode:cantonCode
                        };
                        console.log("devResponseLoginData = "+responseJson.toString());
                        //本地保存信息
                        NimModule.setObject("yunxUserId",responseData["data"]["imaccid"]);
                        NimModule.setObject("yunxToken",responseData["data"]["imtocken"]);
                        NimModule.login(responseData["data"]["imaccid"], responseData["data"]["imtocken"],(obj) => {
                        },(error)=>{});
                        NimModule.getObject("registerId",(obj) => {
                            if (obj && obj.length > 0) {
                                NetUtil.ajax({
                                    url: '/loginservice/userRegistration',
                                    data: {
                                        ticketId: userInfo.ticketId,
                                        registrationCode: obj,
                                    },
                                    success: (responseJson) => {
                                        var responseData = responseJson;
                                        if (responseData) {
                                        }
                                    },
                                    error: (err) => {
                                        console.log(err);
                                    }
                                });
                            }
                        });
                        this.setState({ ticketId: userInfo.ticketId });
                        storage.save({
                            key: 'loginState',  // 注意:请不要在key中使用_下划线符号!
                            rawData: userInfo
                        });
                        this.getShopcartList();
                        if (navigator) {
                            navigator.push({
                                name: 'BaseScreen',
                                component: BaseScreen,
                                params: {
                                    ticketId: userInfo.ticketId
                                }
                            });
                        }
                        this.activityIndicatorMethod();
                        this.state.isInLoginProgress = false;
                    } else {
                        var msg = responseData.infoList[0];
                        // ToastAndroid.show(msg,ToastAndroid.SHORT);
                        this.refs.toast.show(msg);
                        this.state.isInLoginProgress = false;
                        this.activityIndicatorMethod();
                    }
                }
            },
            error: (err) => {
                console.log(JSON.stringify(err));
                // ToastAndroid.show("登录失败，请重新尝试!",ToastAndroid.SHORT);
                this.refs.toast.show("登录失败，请重新尝试!");
                this.state.isInLoginProgress = false;
                this.activityIndicatorMethod();
            }
        });

    }
    async getShopcartList() {


    }
    goRegister(){
        var {navigator}=this.props;
        if (navigator) {
            navigator.push({
                name: 'RegisterScreen',
                component: RegisterScreen,
                params: {navigator:navigator}
            });
        }
    }
    toQueryString(obj) {
        return obj ? Object.keys(obj).sort().map(function (key) {
            var val = obj[key];
            if (Array.isArray(val)) {
                return val.sort().map(function (val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }
            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    }
    componentWillMount () {
        storage.clearMapForKey('loginState');
        this.keyBoardFlag = false;
        this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
        this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
    }

    keyboardDidShow (e) {
        var st = this;
        Animated.parallel([
            Animated.timing(st.state.keyboardHeight, {
                duration: 500,
                toValue: e.endCoordinates.height,
            }),
        Animated.timing(st.state.imageHeight, {
                duration: 500,
                toValue: 112,
            }),
        ]).start();
    }

    keyboardDidHide () {
        if(this.keyBoardFlag){

        }else{
            return;
        }
        var st = this;
        Animated.parallel([
            Animated.timing(st.state.keyboardHeight, {
                duration: 250,
                toValue: 0,
            }),
        Animated.timing(st.state.imageHeight, {
                duration: 250,
                toValue: 192,
            }),
        ]).start();
    }
    componentDidMount() {
        JPushModule.addReceiveCustomMsgListener((message) => {

        });
        JPushModule.addReceiveNotificationListener((message) => {
            console.log("receive notification: " + message);

        })
        this.subscription = NativeAppEventEmitter.addListener(
            'ReceiveNotification',
            (notification) => {
                // console.log(JSON.stringify(notification));
            }
        );

        BackHandler.addEventListener('hardwareBackPressBase',this.backPressed);
    }
    backPressed=()=>{
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                //最近2秒内按过back键，可以退出应用。
                BackHandler.exitApp();
                return false;
            }
        this.lastBackPressed = Date.now();
        // ToastAndroid.show("再按一次退出应用!",ToastAndroid.SHORT);
        this.refs.toast.show('再按一次退出应用!');
        return true;
}
    componentWillUnmount() {
        this.subscription.remove();
        JPushModule.removeReceiveCustomMsgListener();
        JPushModule.removeReceiveNotificationListener();
        this.keyboardDidShowSub.remove();
        this.keyboardDidHideSub.remove();
        BackHandler.removeEventListener('hardwareBackPressLogin',this.goback);
    }
    onUserNameChanged(text) {
        // console.log('name ' + text);
        var st = this;

        st.setState((state) => {
            return {
                textUserName: text,
                textUserPwd: state.textUserPwd,
            };
        });


        setTimeout(function () {
            var userInfo = {
                userName: st.state.textUserName,
                userPwd: st.state.textUserPwd
            };
            //console.log(userInfo);
            storage.save({
                key: 'loginState',  // 注意:请不要在key中使用_下划线符号!
                rawData: userInfo
            });
        }, 50);




    };
    onUserPwdChanged = (text) => {
        // console.log('pwd ' + text);
        var st = this;

        st.setState((state) => {
            return {
                textUserName: state.textUserName,
                textUserPwd: text,
            };
        });
        setTimeout(function () {
            var userInfo = {
                userName: st.state.textUserName,
                userPwd: st.state.textUserPwd
            };
            //console.log(userInfo);
            storage.save({
                key: 'loginState',  // 注意:请不要在key中使用_下划线符号!
                rawData: userInfo
            });
        }, 50);

    };
    onChangeLoginMethodButtonPress() {

        // this.setState({ textUserName: '', textUserPwd: '', loginMethod1: !this.state.loginMethod1 });

    }
    getValiCode() {
        if (this.state.loginMethod1) {
            return null;
        }
        return (
            <TouchableHighlight style={styles.getValiCodeButton} underlayColor={'transparent'}>
                <Text style={styles.getValiCodeButtonText}>验证码</Text>
            </TouchableHighlight>
        );
    }
    dismissKeyboard() {
        Keyboard.dismiss();
    }
    render() {
        var loginButtonName = "loginButton";
        var loginUserIcon = require('./images/login/login_icon_user.png');
        var loginPwdIcon = require('./images/login/login_icon_password.png');
        var loginMethodName = "用户名密码登录";
        var loginMethodChangeName = require('./images/login/login_icon_user.png');
        this.keyBoardFlag = true;

        if (this.state.loginMethod1) {
            loginUserIcon = require('./images/login/login_icon_user.png');
            loginMethodChangeName = require('./images/login/login_icon_captcha.png');
            loginPwdIcon = require('./images/login/login_icon_password.png');
            loginMethodName = "手机号验证码登录";
        } else {
            loginUserIcon = require('./images/login/login_icon_phone.png');
            loginMethodChangeName = require('./images/login/login_icon_user.png');
            loginPwdIcon = require('./images/login/login_icon_captcha.png');
            loginMethodName = "用户名密码登录";
        }

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={() => this.dismissKeyboard()}>
                    <Image source={require('./images/login/login_bg.png')} style={styles.bg} >
                        {/*{this.getValiCode()}*/}
                        <Animated.View style={{ marginBottom: this.state.keyboardHeight }}>
                            <Animated.Image source={require('./images/login/login_logo.png')} 
                            style={[styles.logo,{ height: this.state.imageHeight,width:this.state.imageHeight }]}>
                            </Animated.Image>
                            <View style={styles.inputUserNameBox}>
                            <View style={styles.inputBox}>
                                <Image source={loginUserIcon} style={styles.inputUserNameIcon} />
                                <TextInput underlineColorAndroid={"transparent"} 
                                    onChangeText={(textUserName) => { this.onUserNameChanged(textUserName) }} value={this.state.textUserName}
                                    keyboardType={'name-phone-pad'} placeholder='请输入您的账户名' placeholderTextColor='rgba(255,255,255,0.84)' numberOfLines={1} style={styles.inputUserName} >
                                </TextInput>
                            </View>
                            </View>
                            <View style={styles.splitLineBox}><View style={styles.splitLine}></View></View>
                            <View style={styles.inputUserPwdBox}>
                            <View style={styles.inputBox}>
                                <Image source={loginPwdIcon} style={styles.inputUserNameIcon} />
                                <TextInput underlineColorAndroid={"transparent"}
                                    onChangeText={(textUserPwd) => { this.onUserPwdChanged(textUserPwd) }} value={this.state.textUserPwd}
                                    secureTextEntry={true} keyboardType={'name-phone-pad'} placeholder='请输入你的密码' placeholderTextColor='rgba(255,255,255,0.84)' numberOfLines={1} style={styles.inputUserPwd}>

                                </TextInput>
                                
                            </View>
                            </View>
                        </Animated.View>
                        <TouchableHighlight activeOpacity={0.6} testID={loginButtonName} style={styles.loginButton} underlayColor={'transparent'} onPress={(text) => { this.onLoginButtonPress(loginButtonName) }}>
                            <Text style={styles.loginButtonTitle}>登录</Text>
                        </TouchableHighlight>
                        <TouchableOpacity style={styles.register_click} onPress={this.goRegister.bind(this)}><Text style={styles.register_text}>还未注册?  点击注册</Text></TouchableOpacity>
                        <Text style={styles.valiCodeNoti}>
                            {/*验证码已发送，58秒后重新发送*/}
                        </Text>
                        <TouchableHighlight style={styles.changeLoginMethodBox} underlayColor={'transparent'} onPress={(text) => { this.onChangeLoginMethodButtonPress(loginButtonName) }}>
                            <View style={{ alignItems: 'center', height: 36, }}>
                                {/*<Text style={styles.changeLoginMethodText}>
                                    <Image source={loginMethodChangeName} style={styles.changeLoginMethodIcon} ></Image>
                                    {loginMethodName}
                                    </Text>*/}
                                <ActivityIndicator style={{ width: 20, height: 20, paddingTop: 30, marginLeft: 68, }} color="#ffffff"
                                    animating={this.state.animating} size={'small'}
                                    hidesWhenStopped={true} />
                            </View>
                        </TouchableHighlight>
                    </Image>
                </TouchableWithoutFeedback>
            <Toast ref="toast"/>    
            </View>
             
        );
    }
}

const styles = StyleSheet.create({

    container: {
        flexDirection: 'row',   // 水平排布
        alignItems: 'center',  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },
    bg: {
        alignItems: 'center',
        resizeMode: 'stretch',
        width: width_screen,
        height: height_screen,
        flex: 1,
    },
    logo: {
        marginTop: 104,
        alignSelf: 'center',
        width: 224,
        height: 192,
        // resizeMode: 'stretch'
    },
    inputBox: {
        flex: 1,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.25)',//
        alignItems: 'center',
        padding: 0,
        margin: 0,
        flexDirection: 'row',
    },
    inputUserNameBox: {
        flexDirection: 'row',
        width: 296,
        padding: 0,
        marginTop: 8,
    },
    inputUserNameIcon: {
        width: 16,
        height: 16,
        marginLeft: 16,
    },
    inputUserName: {

        paddingLeft: 16,
        height: 48,
        color: 'white',
        fontSize: 14,
        flex: 1,
        

    },
    inputUserPwdBox: {
        flexDirection: 'row',
        width: 296,

    },
    inputUserPwdIcon: {
        width: 16,
        height: 16,
        marginLeft: 16,
    },
    inputUserPwd: {
        paddingLeft: 16,

        height: 48,
        color: 'white',
        fontSize: 14,
        flex: 1,

    },
    splitLineBox: {
        width: 296,
        backgroundColor: 'rgba(255,255,255,0.25)',
        height: 1,
    },
    splitLine: {
        width: 288,
        backgroundColor: 'rgba(255,255,255,0.81)',
        height: 1,
        marginLeft: 4,

    },
    listBox: {
        flex: 1,
        padding: 10,
        backgroundColor: 'green'

    },
    loginButton: {
        width: 296,
        backgroundColor: '#2676ff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: 44,
        marginTop: 16,
        borderRadius: 2,


    },
    loginButtonTitle: {
        fontSize: 16,
        color: '#ffffff',


    },
    valiCodeNoti: {
        backgroundColor: 'transparent',
        marginTop: 14,
        color: '#d4e5fa',
        fontSize: 15,

    },
    changeLoginMethodBox: {
        // flex: 1,
        flexDirection: 'row',
        width: 166,
        height: 36,
        marginTop: 31,
        backgroundColor: 'transparent',

    },
    changeLoginMethodIcon: {
        width: 16,
        height: 16,
        //marginTop:6,


    },
    changeLoginMethodText: {
        color: '#ffffff',
        height: 24,
        paddingLeft: 9,
        fontSize: 16,
        flexDirection: 'row',
        lineHeight: 28,


    },
    getValiCodeButton: {
        alignItems: 'center',
        borderRadius: 3,
        marginRight: 8,
        width: 80,
        height: 30,
        backgroundColor: '#ffffff',
    },
    getValiCodeButtonText: {
        color: '#005dff',
        marginTop: 8,
    },
    register_click:{
        position:'absolute',
        bottom:30,
        padding:5
    },
    register_text:{
        color:'#fff'
    }
});
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
    TouchableOpacity,
    Navigator,
    DeviceEventEmitter,
    StatusBar,
    TextInput,
    Keyboard,
    BackHandler,
    Platform,
} from 'react-native';

var Dimensions = require('Dimensions');
var width=Dimensions.get('window').width;
var height=Dimensions.get('window').height;
import Toast, { DURATION } from 'react-native-easy-toast';
import RSAUtils from '../lib/RSA';
import NetUitl from './util/NetUitl';
import Login from '../Login';
var imgHeight=(Dimensions.get('window').width-40)*128/654;
var dialogHeight=imgHeight+120;
var passwordReg1 = /(^.{6,18}$)/;// 长度在6到18位之间
var passwordMsg1 = "密码长度在6到18位之间。";
var passwordReg2 = /(^[0-9]+$)/;// 不能全是数字
var passwordMsg2 = "密码不能全是数字。";
var passwordReg3 = /(^[A-Za-z]+$)/;// 不能全是字母
var passwordMsg3 = "密码不能全是字母。";
var passwordReg4 = /^[A-Za-z0-9!@#$%*]+$/;// 允许含有的字符
var passwordMsg4 = "不允许出现“!@#$%*”以外的特殊字符";
export default class PersonMsgScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            dialogShow:false,
            userName:'',
            password:'',
            confiemPassword:''
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    goback() {
        var { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    backKeyPressed(){
        this.goback();
        return true;
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressPM', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressPM',this.backKeyPressed);
    }
    dismiss(){
        Keyboard.dismiss();
    }
    passwordValid(password) {
        var validResult = true;
        // 密码正则检查
        if (!passwordReg1.test(password)) {
            // 密码长度在6到18位之间。
            validResult = false;
            // ToastAndroid.show(passwordMsg1,ToastAndroid.SHORT);
            this.refs.toast.show(passwordMsg1);
        } else if (passwordReg2.test(password)) {
            // 密码不能全是数字。
            validResult = false;
            // ToastAndroid.show(passwordMsg2,ToastAndroid.SHORT);
            this.refs.toast.show(passwordMsg2);
        } else if (passwordReg3.test(password)) {
            // 密码不能全是字母。
            validResult = false;
            // ToastAndroid.show(passwordMsg3,ToastAndroid.SHORT);
            this.refs.toast.show(passwordMsg3);            
        } else if (!passwordReg4.test(password)) {
            // 允许含有的特殊字符
            validResult = false;
            // ToastAndroid.show(passwordMsg4,ToastAndroid.SHORT);
            this.refs.toast.show(passwordMsg4);
        } else {
            validResult = true; 
        }
        return validResult;
    }
    sendData(){
        if(!this.passwordValid(this.state.password)){
            return;
        }
        if(this.state.password!=this.state.confiemPassword){
            this.refs.toast.show('确认密码和密码不一致');
            // ToastAndroid.show('确认密码和密码不一致',ToastAndroid.SHORT);
            return;
        }
        NetUitl.ajax({
            url:'/userservice/saveUserRegisterInfo.htm',
            data:{
                phoneNum:this.props.mobile,
                userName:this.state.userName,
                password: RSAUtils.encryptByRSA(this.state.password)
            },
            success:(data)=>{
                console.log(data);
                if(data.status==1){
                    NetUtil.collectingUserBehavior(data.data.ticketId,'APP_REGISTER_SUCCESS');
                    this.setState({dialogShow:true});
                    this.dismiss();

                }else{
                    
                }
            }
        });
        
    }
    hideDialog(){
        this.setState({dialogShow:false});
    }
    goLogin(){

        var {navigator}=this.props;
        if (navigator) {
            navigator.push({
                name: 'Login',
                component: Login,
                params: {navigator:navigator,mobile:this.props.mobile}
            });
        }
    }
    render() {
        // <TouchableOpacity style={styles.cancle_click} onPress={this.hideDialog.bind(this)}><Text style={styles.cancle_text}>取消</Text></TouchableOpacity>
        return (
            <View style={{flex:1,backgroundColor:'#f7f8fa'}}>
               <StatusBar barStyle="light-content" />
                
                <View style={styles.mytop}>
                    <TouchableOpacity onPress={this.goback.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_back.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <View style={styles.middleView}><Text style={styles.middleText}>注册</Text></View>
                    <View style={{width:12}}></View>
                </View>
                <View>
                    <View style={styles.title}>
                        <Text style={styles.line}>-----</Text>
                        <Text style={styles.titleText}>完善个人信息，完成注册</Text>
                        <Text style={styles.line}>-----</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_title}>用户名</Text>
                        <TextInput style={styles.input} placeholder="输入用户名" underlineColorAndroid={"transparent"} onChangeText={(text)=>{this.setState({userName:text})}} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_title}>设置密码</Text>
                        <TextInput style={styles.input} placeholder="字母和数字,6到18位之间" secureTextEntry={true}  underlineColorAndroid={"transparent"}  onChangeText={(text)=>{this.setState({password:text})}}/>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_title}>确认密码</Text>
                        <TextInput style={styles.input} placeholder="再次输入密码以确认" secureTextEntry={true}  underlineColorAndroid={"transparent"} onChangeText={(text)=>{this.setState({confiemPassword:text})}}/>
                    </View>
                </View>
                {this.state.userName&&this.state.password&&this.state.password.length>=6&&this.state.confiemPassword?
                    <View style={[styles.nextBtn,styles.can]}><TouchableOpacity style={styles.nextBtn_click} onPress={this.sendData.bind(this)}><Text style={styles.nextBtn_text}>确认注册</Text></TouchableOpacity></View>:
                    <View style={[styles.nextBtn]}><Text style={styles.nextBtn_text}>确认注册</Text></View>
                }
                {this.state.dialogShow?
                <View style={styles.dialog}>
                    <View style={styles.dialog_content}>
                        <Image style={styles.dialogImg} resizeMode={Image.resizeMode.contain}  source={require('../images/login/dialog_banner_success.jpg')}/>
                        <View style={styles.dialog_text}>
                            <Text style={styles.dialog_text1}>注册成功!</Text>
                            <Text style={styles.dialog_text2}>是否立即前往登录</Text>
                        </View>
                        <View style={styles.dialog_btn}>
                            <TouchableOpacity style={styles.confirm_click} onPress={this.goLogin.bind(this)}><Text style={styles.confirm_text}>确认</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>:null}
                <Toast ref="toast" />
            </View>
        );
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
        height:20
    },
    mytop:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'#2676ff',
        paddingLeft:20,
        paddingRight:20,
        paddingTop:(Platform.OS === "ios")?30:10,
        paddingBottom:10,
        borderWidth:0,
        borderBottomColor:'#2676ff',
        zIndex:2
    },
     back_btn:{
        color:'#fff',
        fontSize:20
    },
    middleView:{
        flex:1,
    },
    middleText:{
        textAlign:'center',
        color:'#fff',
        fontSize:16
    },
    title:{
        flexDirection:'row',
        justifyContent:'center',
        paddingTop:15,
        paddingBottom:15
    },
    line:{
        color:'#dfe3ed'
    },
    titleText:{
        color:'#99a8bf',
        marginLeft:10,
        marginRight:10
    },
    info:{
        flexDirection:'row',
        backgroundColor:'#fff',
        alignItems:'center',
        marginBottom:15
    },
    info_title:{
        marginLeft:20,
        fontSize:15,
        color:'#293f66',
        width:65,
        textAlign:'right'
    },
    input:{
        flex:1,
        paddingLeft:20,
        fontSize:15,
        height:50,
        lineHeight:50,
        marginTop:0,
        marginBottom:0,
        paddingBottom:15,
        paddingTop:15,
        color:'#293f66'
    },
    nextBtn:{
        backgroundColor:'#b5d0ff',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:40,
        marginLeft:20,
        marginRight:20,
        borderRadius:4
    },
    nextBtn_click:{
        flex:1,
         flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:40
    },
    nextBtn_text:{
        color:'#fff'
    },
    can:{
        backgroundColor:'#2676ff'
    },
    dialog:{
        position:'absolute',
        backgroundColor:'rgba(0, 0, 0, 0.6)',
        zIndex:1000,
        width:width,
        height:height
    },
    dialog_content:{
        backgroundColor:'#fff',
        marginLeft:20,
        marginRight:20,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        marginTop:(height-dialogHeight)/2,
        borderRadius:6,
        overflow:'hidden'
    },
    dialogImg:{
        width:width-40,
        height:imgHeight
    },
    dialog_text:{
        height:80,
        flexDirection:'column',
        justifyContent:'center'
    },
    dialog_text1:{
        color:'#293f66',
        textAlign:'center',
        marginBottom:5
    },
    dialog_text2:{
        color:'#99a8bf',
        textAlign:'center'
    },
    dialog_btn:{
        height:40,
        backgroundColor:'#ff0',
        flexDirection:'row',
    },
    cancle_click:{
        backgroundColor:'#e6ebf5',
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'
    },
    confirm_click:{
        flex:1,
        backgroundColor:'#16d2d9',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'
    },
    cancle_text:{
        color:'#99a8bf'
    },
    confirm_text:{
        color:'#fff'
    },
});
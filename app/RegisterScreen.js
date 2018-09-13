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
    BackHandler,
    Keyboard,
} from 'react-native';

import PersonMsgScreen from './PersonMsgScreen';
import Toast, { DURATION } from 'react-native-easy-toast'
import NetUitl from './util/NetUitl';
var mobilePattern=/^1[3|4|5|7|8][0-9]{9}$/;
export default class RegisterScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            seconds:0,
            mobile:'',
            code:''
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    componentDidMount(){
        var st = this;
        BackHandler.addEventListener('hardwareBackPressRS', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressRS',this.backKeyPressed);
    }
    backKeyPressed(){
        this.goback();
        return true;
    }
    dismiss(){
        Keyboard.dismiss();
    }
    goback(){
         var {navigator}=this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    getCode(){
        this.dismiss();
        NetUitl.ajax({
            url:'/userservice/getIdentifyCode.htm',
            data:{
                phoneNum:this.state.mobile
            },
            success:(data)=>{
                if(data.status==1){
                    this.setState({seconds:60});
                    this.interval=setInterval(()=>{
                    if(this.state.seconds<=0){
                        clearInterval(this.interval);
                        return;
                    }
                    this.setState({seconds:this.state.seconds-1});
                    },1000);
                }else{
                    this.refs.toast.show(data.data['msg']);
                    // ToastAndroid.show(data.data['msg'],ToastAndroid.SHORT);
                }
            }
        });
    }
    onMobileChange(value){
       if(value){
        this.setState({mobile:value});
       }else{
        this.setState({mobile:value,seconds:0});
        }
    }
    goNext(){
        NetUitl.ajax({
            url:'/userservice/checkIdentifyCode.htm',
            data:{
                phoneNum:this.state.mobile,
                identifyCode:this.state.code
            },
            success:(data)=>{
                console.log(data);
                if(data.status==1){
                    var {navigator}=this.props;
                    if (navigator) {
                        navigator.push({
                            name: 'PersonMsgScreen',
                            component: PersonMsgScreen,
                            params: {navigator:navigator,mobile:this.state.mobile}
                        });
                    }
                }else{
                    this.refs.toast.show('验证码错误');
                    // ToastAndroid.show('验证码错误',ToastAndroid.SHORT);

                }
            }
        });
    }
    render() {
        var mobileFlag=mobilePattern.test(this.state.mobile);
        var word=this.state.seconds<=0||this.state.seconds>60?'输入手机号，获取验证码':('验证号码已发送，'+this.state.seconds+'后重新发送');
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
                <Toast ref="toast" />

                <View>
                  
                {/*{this.getValidCodeMessage()}*/}
                 <View style={styles.title}>
                        <Text style={styles.line}>-----</Text>
                        <Text style={styles.titleText}>{word}</Text>
                        <Text style={styles.line}>-----</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_title}>手机号</Text>
                        <TextInput style={styles.input} placeholder="输入手机号" ref="testinput"
                         onChangeText={this.onMobileChange.bind(this)} keyboardType={'numeric'}  underlineColorAndroid={"transparent"}
                         numberOfLines={1} />
                        <View style={styles.codeBtn}>
                        {/*{
                            mobileFlag&&this.state.seconds==0?
                            <TouchableOpacity style={[styles.codeBtn_click,styles.can]} onPress={this.getCode.bind(this)}><Text style={styles.codeBtn_text}>获取验证码</Text></TouchableOpacity>:
                            <TouchableOpacity style={[styles.codeBtn_click]}><Text style={styles.codeBtn_text}>获取验证码</Text></TouchableOpacity>
                        }*/}
                        {this.getCodeButton()}
                        </View>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_title}>验证码</Text>
                        <TextInput style={styles.input} placeholder="输入四位验证码" keyboardType={'numeric'} underlineColorAndroid={"transparent"}  onChangeText={(text)=>this.setState({code:text})}/>
                    </View>
                </View>
    
                {this.getNextButton()}
            </View>
        );
    }
     getCodeButton(){
        var mobileFlag=mobilePattern.test(this.state.mobile);

         if(mobileFlag&&this.state.seconds==0){
            return (<TouchableOpacity style={[styles.codeBtn_click,styles.can]} onPress={this.getCode.bind(this)}><Text style={styles.codeBtn_text}>获取验证码</Text></TouchableOpacity>)
         }else{
            return (<TouchableOpacity style={[styles.codeBtn_click]}><Text style={styles.codeBtn_text}>获取验证码</Text></TouchableOpacity>)
         }
     }
     getNextButton(){
         var mobileFlag=mobilePattern.test(this.state.mobile);
         if(mobileFlag&&this.state.code){
            return (<View style={[styles.nextBtn,styles.can]}><TouchableOpacity style={styles.nextBtn_click} onPress={this.goNext.bind(this)}><Text style={styles.nextBtn_text}>下一步</Text></TouchableOpacity></View>)
         }else{
            return (<View style={[styles.nextBtn]}><TouchableOpacity style={styles.nextBtn_click}><Text style={styles.nextBtn_text}>下一步</Text></TouchableOpacity></View>)
         }
     }
     getValidCodeMessage(){
         return  (this.state.seconds<=0||this.state.seconds>60)?(
                      <View style={styles.title}>
                        <Text style={styles.line}>-----</Text>
                        <Text style={styles.titleText}>输入手机号，获取验证码</Text>
                        <Text style={styles.line}>-----</Text>
         </View>):  
                   ( <View style={styles.title}>
                        <Text style={styles.line}>-----</Text>
                        <View style={styles.title_text_view}>
                            <Text style={styles.sendText}>验证号码已发送，</Text>
                            <Text style={styles.sendText}>{this.state.seconds}</Text>
                            <Text style={styles.sendText}>后重新发送</Text>
                        </View>
                        <Text style={styles.line}>-----</Text>
                    </View>)
                
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
        paddingTop:20,
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
        fontSize:16,
        marginRight:8,
    },
    title:{
        flexDirection:'row',
        justifyContent:'center',
        paddingTop:15,
        paddingBottom:15
    },
    title_text_view:{
        flexDirection:'row',
        marginLeft:10,
        marginRight:10
    },
    line:{
        color:'#dfe3ed'
    },
    titleText:{
        color:'#99a8bf',
        marginLeft:10,
        marginRight:10
    },
    sendText:{
        color:'#99a8bf',
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
        color:'#293f66'
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
    codeBtn:{
        marginRight:20,
        paddingTop:8,
        paddingBottom:8,
        marginLeft:10
    },
    codeBtn_click:{
        backgroundColor:'#b5d0ff',
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
        paddingLeft:10,
        paddingRight:10,
        borderRadius:4,
    },
    codeBtn_text:{
        color:'#fff'
    },
    nextBtn:{
        backgroundColor:'#b5d0ff',
        flexDirection:'row',
        justifyContent:'center',
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
    },
    nextBtn_text:{
        color:'#fff'
    },
    can:{
        backgroundColor:'#2676ff'
    }
});
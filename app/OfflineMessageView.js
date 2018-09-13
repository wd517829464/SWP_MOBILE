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
    TextInput,
    TouchableHighlight,
    StatusBar,
    BackHandler,

} from 'react-native';


import NetUitl from './util/NetUitl';
import TopWithoutDing from './component/TopWithoutDing';//我就这么命名的
import Toast, { DURATION } from 'react-native-easy-toast'

export default class OfflineMessageView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phoneNumber:"",
            content:"",
            ticketId:"",
        };
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    componentWillMount(){
    
    }
    componentDidMount(){
        var st = this;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            st.setState({phoneNumber:ret["userName"],ticketId:ret["ticketId"],content:"我有危废要处理，看到留言请联系我的手机号:"+ret["userName"]});
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
            console.log(JSON.stringify(err));
        })
        BackHandler.addEventListener('hardwareBackPressOMV', this.backKeyPressed);

    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressOMV',this.backKeyPressed);
    }
    backKeyPressed(){
        this.goback();
        return true;
    }
    onButtonPress(){
        var st = this;
        NetUitl.ajax({
            url:'/wastecircle/saveOfflineMsg',
            data:{
                ticketId: st.props.ticketId,
                toEntId: st.props.entId,
                businessCode: "",
                context: st.state.content,
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if (responseData&&responseData.status==1) {
                    // ToastAndroid.show("留言成功!",ToastAndroid.SHORT);
                    this.refs.toast.show("留言成功!");
                    
                    st.goback();
                }
            }
        });
    }
    goback(){
        var {navigator}=this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    textChange(text){
        if(text.length>200){
            text = text.substr(0,199);
            // ToastAndroid.show("留言最大字符长度为200!",ToastAndroid.SHORT);
            this.refs.toast.show("留言最大字符长度为200!");

        }else{
            if(text.length<1){
                // ToastAndroid.show("留言不能为空!",ToastAndroid.SHORT);
                this.refs.toast.show("留言不能为空!");

                return;
            }
        }
        this.setState({content:text,});

    }
    render() {

        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        const {rowData,navigator} = this.props;
        return (
            <View style={{flex:1,backgroundColor:'#fff',}}>
                <StatusBar barStyle="default" />
                <TopWithoutDing  title={"离线留言"} navigator={navigator}/>
                <View style={styles.splitLine}></View>
                <Text style={{textAlign:'center',marginTop:26,fontSize:18,color:'#293f66',}}>{rowData.releaseEntName}</Text>
                <Text style={{textAlign:'center',marginTop:12,fontSize:18,color:'#6b7c99',}}>暂不在线，请留言…</Text>


                <TextInput style={styles.messageV} textAlignVertical = 'top'  multiline={true} onChangeText={(text) => this.textChange(text)} value={this.state.content}/>



                <TouchableHighlight activeOpacity={0.6} style={styles.loginButton} underlayColor={'transparent'} onPress={(text) => { this.onButtonPress() }}>
                    <Text style={styles.loginButtonTitle}>留言</Text>
                </TouchableHighlight>
                <Toast ref="toast"/> 
            </View>
        );
    }
                    

}

const styles = StyleSheet.create({
    splitLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#E9EDF7'
    },
    loginButton: {
        width: 296,
        backgroundColor: '#2676ff',
        alignSelf:'center',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        marginTop: 48,
        borderRadius: 2,
    },
    loginButtonTitle: {
        fontSize: 16,
        color: '#ffffff',


    },
    messageV:{
        marginTop:28,
        fontSize:17,
        color:'#8c9dbf',
        height:171,
        borderColor:'#cad5e6',
        borderRadius:2,
        marginLeft:12,
        paddingLeft:12,
        paddingRight:12,
        marginRight:12,
        borderWidth:0.5
    }
});
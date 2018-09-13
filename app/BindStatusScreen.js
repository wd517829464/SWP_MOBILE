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
    RefreshControl,
    BackHandler,
    Platform,

} from 'react-native';

import BindEnterItem from './component/BindEnterItem';
import Login from '../Login';
var Dimensions = require('Dimensions');
var width=Dimensions.get('window').width;
var height=Dimensions.get('window').height;
import NetUitl from './util/NetUitl';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class BindStatusScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            enterpriseInfo:{},
            userStatus:this.props.userStatus,
            enterStatus:this.props.enterStatus,
            entType:this.props.entType
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    componentWillMount(){
        NetUitl.ajax({
            url:'/loginservice/getEnterpriseById.htm',
            data:{
                ticketId: this.props.ticketId,
                'enterpriseId':this.props.enterId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                console.log(responseData);
                if (responseData) {
                    this.setState({enterpriseInfo:responseData.data.enterpriseInfo});
                }
            }
        });
    }
    backKeyPressed(){
        this.goback();
        return true;
    }
    componentDidMount(){
        var st = this;
        BackHandler.addEventListener('hardwareBackPressStatus', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressStatus',this.backKeyPressed);
    }
   goback(){
       const { navigator } = this.props;
        if(navigator){
            navigator.push({
                name: 'Login',
                component: Login,
                params: {
                    navigator:navigator
                }
            });
        }
   }
    render() {
        var {enterpriseInfo}=this.state;
        var head=require('../images/mine/profile_icon_infor.png');
        if(enterpriseInfo.businessCode&&enterpriseInfo.fileId){
            head={uri:Constants.IMG_SERVICE_URL+'&businessCode='+enterpriseInfo.businessCode+'&fileId='+enterpriseInfo.fileId};
        }
        return (
            <View style={{flex:1,backgroundColor:'#f7f8fa'}}>
               <StatusBar barStyle="light-content" />
                <View style={styles.mytop}>
                    <TouchableOpacity onPress={this.goback.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_back.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <View style={styles.middleView}><Text style={styles.middleText}>绑定企业</Text></View>
                    <View style={{width:12}}></View>
                </View>
                <View style={{height:20}}></View>
                <View style={styles.item}>
                    <View style={styles.item_logo}><Image style={styles.enterlogo} resizeMode={Image.resizeMode.contain} source={head}/></View>
                    <View style={styles.item_content}>
                        <View style={styles.enterNameAndType}>
                            <Text style={styles.enterName}>{enterpriseInfo['entName']}</Text>
                            <Text style={[styles.enterType,{borderColor:'#18caa6',color:'#18caa6'}]}>{this.props.entType=='DISPOSITION'?'处置企业':'处置代理商'}</Text>
                        </View>
                        <View style={styles.address}>
                            <Image style={styles.address_icon} resizeMode={Image.resizeMode.contain} source={require('../images/mine/publisharea.png')}/>
                            <Text style={styles.address_text}>{enterpriseInfo['entAddress']}</Text>
                        </View>
                    </View>
                </View>
                 <Text style={styles.tip}>{this.state.enterStatus=='SUBMIT'?'你已申请创建该企业':''}{this.state.enterStatus=='PASS'&&this.state.userStatus=='SUBMIT'?'你正在申请加入该企业':''}，请等待企业管理员核实信息，核实完成后将发送短信通知，请保持手机畅通</Text>
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
        marginBottom:30
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
        color:'#293f66',
        paddingBottom:15,
        paddingTop:15,
    },
     item:{
        // marginTop:100,
        flexDirection:'row',
        marginLeft:20,
        marginRight:20,
        paddingTop:20,
        borderColor:'#ccc',
        paddingBottom:20
    },
    tip:{
        marginLeft:20,
        marginRight:20,
        lineHeight:25,
        color:'#1171d1'
    },
    item_logo:{
        flexDirection:'column',
    },
    enterlogo:{
        width:50,
        height:50
    },
    item_content:{
        flex:1,
        paddingLeft:10
    },
    enterNameAndType:{
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      height:20
    },
    enterName:{
        color:'#2e2e46',
    },
    enterType:{
       borderWidth:1,
       borderColor:'#9297a8',
       color:'#9297a8',
       padding:2,
       borderRadius:2,
       fontSize:12
    },
    address:{
        flexDirection:'row',
        paddingTop:10,
        paddingBottom:12
    },
    address_icon:{
        width:14,
        height:14,
        position:'relative',
        top:2
    },
    address_text:{
        color:'#9698a2'
    },
    buttons:{
        flexDirection:'row',
    },
    view_click:{
        backgroundColor:'#d0d4e6',
        width:100,
        height:25,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        marginRight:10,
        borderRadius:4
    },
    bind_click:{
        backgroundColor:'#1171d1',
         width:100,
        height:30,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:4
    },
    btn_text:{
        color:'#fff'
    },
});
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
    Platform,
} from 'react-native';

var Dimensions = require('Dimensions');
var width=Dimensions.get('window').width;
var height=Dimensions.get('window').height;
import Toast, { DURATION } from 'react-native-easy-toast';
import Constants from '../util/Constants';
import NetUitl from '../util/NetUitl';
import BaseScreen from '../base';
import BindStatusScreen from '../BindStatusScreen';
export default class BindEnterItem extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={
            isLoading:false
        }
    }
   
    bindEnter(){
        var {rowData,navigator,ticketId}=this.props;
        NetUitl.ajax({
            url:'/myenterprise/joinEnterprise.htm',
            data:{
                enterpriseId:rowData['entId'],
                ticketId:ticketId
            },
            success:(data)=>{
                if(data.status==1){
                    this.refs.toast.show("申请绑定企业成功");
                    if(navigator){
                        navigator.push({
                            name: 'BindStatusScreen',
                            component: BindStatusScreen,
                            params: {
                                ticketId:ticketId,
                                enterId:rowData['entId'],
                                userStatus:'SUBMIT',
                                enterStatus:'PASS',
                                entType:rowData['entTypeCode']
                            }
                        });
                    }
                }
            }
        });
   }
    render() {
        var {rowData}=this.props;
        var head=require('../../images/mine/profile_icon_infor.png');
        if(rowData.businessCode&&rowData.fileId){
            head={uri:Constants.IMG_SERVICE_URL+'&businessCode='+rowData.businessCode+'&fileId='+rowData.fileId};
        }
        return (
            <View style={styles.item}>
                <View style={styles.item_logo}><Image style={styles.enterlogo} resizeMode={Image.resizeMode.contain} source={head}/></View>
                <View style={styles.item_content}>
                    <View style={styles.enterNameAndType}>
                        <Text style={styles.enterName}>{rowData['entName']||'--'}</Text>
                        <Text style={[styles.enterType,rowData['entTypeCode']=='DIS_FACILITATOR'?{borderColor:'#9900ff',color:'#9900ff'}:{borderColor:'#18caa6',color:'#18caa6'}]}>{rowData['entTypeValue']}</Text>
                    </View>
                    <View style={styles.address}>
                        <Image style={styles.address_icon} resizeMode={Image.resizeMode.contain} source={require('../../images/mine/publisharea.png')}/>
                        <Text style={styles.address_text}>{rowData['entAddress']||'--'}</Text>
                    </View>
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.bind_click} onPress={this.bindEnter.bind(this)}><Text style={styles.btn_text}>绑定</Text></TouchableOpacity>
                    </View>
                </View>
                <Toast ref='toast'/>
            </View>
        );
    }
     
}

const styles = StyleSheet.create({
    item:{
        flexDirection:'row',
        marginLeft:20,
        marginRight:20,
        paddingTop:20,
        borderBottomWidth:1,
        borderColor:'#ccc',
        paddingBottom:20
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
    },
    nextBtn_text:{
        color:'#fff'
    },
    can:{
        backgroundColor:'#2676ff'
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
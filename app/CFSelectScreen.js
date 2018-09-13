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
    ScrollView,
    Button,
    Alert,
    TextInput,
    TouchableOpacity,
    DeviceEventEmitter,
    Switch,
    NativeModules,
    BackHandler,
    Platform,

} from 'react-native';
import Top from './component/Top';
import ModalDropdown from 'react-native-modal-dropdown';
import CheckBox from 'react-native-check-box';
import NetUitl from './util/NetUitl';
import BaseScreen from './base';
import Constants from './util/Constants';
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
import Toast, { DURATION } from 'react-native-easy-toast';
var downTextWidth=widths-90;
const {NimModule} = NativeModules;
import OfflineMessageView from './OfflineMessageView';
import contactList from './ContactList';
import SelectCFItem from './component/SelectCFItem';
import CFInquiryScreen from './CFInquiryScreen';
import CZSelectScreen from './CZSelectScreen';

const TYPE_OPTIONS = [];
const dispositionTypes=[];
const buyWasteResourcePageData={};
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    

export default class CFSelectScreen extends Component {
    constructor(props) {
  super(props);
  if(this.props.headData.releaseWasteDetails[0]==1){
    this.props.headData.releaseWasteDetails.shift();
  }
  this.state = {
    choosedList:[],
    dataSource:ds.cloneWithRows(this.props.headData.releaseWasteDetails),
    favorited:this.props.headData.favorited,
    ticketId:'',
    choosed:false,
    entType:''
  };
    this.backKeyPressed = this.backKeyPressed.bind(this);
}
componentWillMount(){
    storage.load({
        key: 'loginState',
    }).then(ret => {
        this.entId=ret.entId;
        this.ticketId=ret.ticketId;
        this.setState({ticketId:this.ticketId,entType:ret.entType})
    }).catch(err => {
        console.log(JSON.stringify(err));
    })
    return;
}
    componentDidMount(){
        var st = this;
        BackHandler.addEventListener('hardwareBackPressBuy', this.backKeyPressed);
        DeviceEventEmitter.addListener('wasteSelect',(text)=>{
             console.log(text);
             var choosedList=this.state.choosedList;
             if(text.choosed){
                choosedList.push(text);
             }else{
                 for(var i in choosedList){
                    if(choosedList[i]['detailId']==text['detailId']){
                        choosedList.splice(i,1);
                        break;
                    }
                 }
             }
             this.setState({
                choosedList:choosedList
            });
        });
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBuy',this.backKeyPressed);
    }
    backKeyPressed(){
        this.goback();
        return true;
    }
    goback(){
       const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
   }

    /**
     * 检查聊天对象企业的联系人数量
     * 
     * @memberof CFDetailScreen
     */
    checkContacts() {
        var entId=this.props.headData.facilitatorEntId?this.props.headData.facilitatorEntId:this.props.headData.releaseEntId;
        console.log("开始检查企业联系人数量"+entId);
         NetUitl.ajax({
            url:'/userservice/getEnterpriseContacts',
            data:{
                enterpriseId: entId,
                ticketId: this.ticketId,
            },
            success:(responseJson)=>{
                var data = responseJson.data;
                console.log(data);
                if(data.length>1){
                    this.toChooseChatTarget(data);
                }else if(data.length==1){
                    NimModule.ChatWith(data[0]['loginName'],()=>{}) ;
                }else{
                    this.OfflineMessageView();
                }
            },
            error:(err)=>{
                console.log("检查企业联系人列表出错" + err);
                // this.OfflineMessageView();
            }
        });
    }

    /**
     * 开启选择聊天对象界面
     * @memberof RNDemo
     */
    toChooseChatTarget = (data) => {
        const { navigator } = this.props;

        if (navigator) {
            navigator.push({
                name: "contactList",
                component: contactList,
                params: {
                    navigator: navigator,
                    data: data,
                    ticketId:this.state.ticketId,
                    enterName:this.props.headData.entName,
                }
            });
        }
    };

    showChatView(){
        // if(this.state.accId){
        //     var rowData={toId:this.state.accId};
        //     NimModule.doAddFriend(this.state.accId,"",true) ;
        // }else{
        //     this.OfflineMessageView();
        // }
        var entId=this.props.headData.facilitatorEntId?this.props.headData.facilitatorEntId:this.props.headData.releaseEntId;
         NetUitl.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:entId,
                ticketId: this.ticketId,
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                // console.log("获取企业管理员信息"+esponseData.data);
                if (responseData&&responseData.status==1) {
                    NimModule.ChatWith(responseData.data,()=>{}) ;
                }else{
                    this.OfflineMessageView();
                }
            },
            error:(err)=>{
                console.log("获取企业管理员信息失败");
                this.OfflineMessageView();
                console.log(err);
            }
        });

    }
    OfflineMessageView(){
        var rowData = {releaseEntName:this.props.enterName};
        var entId=this.props.headData.facilitatorEntId?this.props.headData.facilitatorEntId:this.props.headData.releaseEntId;
        const {navigator} = this.props;
                    if(navigator){
                        navigator.push({
                            name:'OfflineMessageView',
                            component:OfflineMessageView,
                            params:{
                                navigator:navigator,
                                ticketId:this.state.ticketId,
                                rowData:rowData,
                                enterId:entId,
                            }
                        }) 
                    }
    }    
    back(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
    favorite(){
        var url=this.state.favorited?'/entFavorite/cancelEntFavorite':'/entFavorite/addEntFavorite';
        var param={
            entId:this.entId,
            referenceId:this.props.headData.releaseId,
            favoriteType:'MSGID',
            ticketId:this.ticketId
        };
        NetUitl.ajax({
            url:url,
            data:param,
            success:(result)=>{
                if(result.status==1&&result.data){
                    var str='';
                    if(this.state.favorited){
                        str='取消';
                    }
                    this.refs.toast.show(str+'收藏成功');
                    // DeviceEventEmitter.emit('favorite',this.props.index);
                    this.setState({
                        favorited:!this.state.favorited
                    });
                }
            }
        }); 
        
    }
    allSelect(){
        var flag=this.state.choosed;
        this.setState({
            choosed:!flag,
            choosedList:flag?[]:this.props.headData.releaseWasteDetails
        });
        DeviceEventEmitter.emit('allSelect',!flag);
    }
    render() {
        let head=require('../images/home/commom_icon_logo.png');
        var {headData}=this.props;
        if(headData.fileId){
            head={uri:Constants.IMG_SERVICE_URL+'&fileID='+headData.fileId};
        }
        var collectImgUrl=require('../images/home/nav_icon_favourite.png');
        if(this.state.favorited){
            collectImgUrl=require('../images/home/nav_icon_favouriteyellow.png');
        }
        // <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"选择产废资源"}/>
        // {this.state.loading?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
        return (
            <View style={{flex:1,paddingBottom:70}}>
            <View style={styles.container}>
                <View style={styles.headBar}>
                    <View style={styles.back_view}><TouchableOpacity onPress={this.back.bind(this)}><Image style={[styles.back_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/header/nav_icon_back.png')} /></TouchableOpacity></View>
                    <View style={styles.middleView}>
                        <Text style={styles.middleText}>选择产废资源</Text>
                    </View>
                    <TouchableOpacity style={{marginRight:0,marginLeft:10}} onPress={()=>{this.favorite()}}>
                        <Image style={[styles.cellText_icon,{marginRight:0}]} resizeMode={Image.resizeMode.contain} source={collectImgUrl} />
                    </TouchableOpacity>
                </View>
            </View>  
            <ScrollView>
                <View style={styles.cellBox_first}>
                    <Text style={[styles.cellText_Ent]}>{headData.entName||'--'}</Text> 
                    <Text style={[styles.cellText_time]}>{headData.releaseDate.substr(0,10)||'--'}</Text>
                </View>
                {headData.entAddress?
                <View style={{flexDirection:'row',paddingLeft:14,paddingBottom:10,borderBottomWidth:0.5,borderBottomColor:'lightgrey'}}>
                <Image style={{width:16,height:16,marginTop:1,marginRight:2}} resizeMode={Image.resizeMode.contain} source={require('../images/home/address.png')} />
                <Text style={{color:'#9ba4ba',fontSize:13}}>{headData.entAddress}</Text>
               </View>:<View style={{paddingBottom:0,borderBottomWidth:0.5,borderBottomColor:'lightgrey'}}></View>}
                <View style={styles.totalCount}>
                    <View style={{flexDirection:'row',width:widths*0.6}}>
                        <Text style={styles.totalTitle}>总计</Text>
                        <View style={styles.totalContent}>
                            <Text style={styles.text1}>{headData.releaseWasteDetails.length||0}种危废，{headData.disposalWasteAmount||'0吨'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={{flexDirection:'row'}} onPress={this.allSelect.bind(this)}>
                        {this.state.choosed?
                            <Image style={[{width:20,height:20}]} resizeMode={Image.resizeMode.contain} source={require('../images/shopcart/common_icon_choosed.png')} />:
                            <Image style={[{width:20,height:20}]} resizeMode={Image.resizeMode.contain} source={require('../images/shopcart/common_icon_unchoosed.png')} />
                        }
                        <Text style={{color:'#333',marginLeft:5,marginRight:20}}>全选</Text>
                    </TouchableOpacity>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={(rowData,sectionID,rowID) => 
                        <SelectCFItem navigator={this.props.navigator} callbackParent={(text)=>{this.onChildChanged(text)}} rowData={rowData} sectionID={sectionID} rowID={rowID} ticketId={this.state.ticketId}/>
                    }
               />  
            </ScrollView>
            <View style={styles.btn_view}>
                <View style={[styles.chart_view,{borderRightWidth:1}]}>
                    <TouchableOpacity style={[styles.btn_touch,{width:widths*0.33}]}  onPress={()=> {this.checkContacts()}}>
                        <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/message/common_icon_chat.png')} />
                        <Text style={styles.chat_title}>联系TA</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chart_view}>
                    <TouchableOpacity style={[styles.btn_touch,{width:widths*0.33}]} onPress={this.goCart.bind(this)}>
                        <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/base/tab_icon_cart_s.png')} />
                        <Text style={styles.chat_title}>报价单</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.call_price_view,{backgroundColor:this.state.choosedList.length>0?'#2676ff':'#cad5e6'}]}>
                     <TouchableOpacity style={styles.btn_touch} onPress={this.buy.bind(this)}>
                        <Text style={styles.call_price_text}>报价</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/*<View style={styles.button} width={widths} >
                <TouchableOpacity style={{flex:1}}  onPress={this.buy.bind(this)}><Text style={[styles.button_text,{backgroundColor:this.state.buttonDisable?'#2676ff':'#cad5e6'}]}>确认购买</Text></TouchableOpacity>
            </View>*/}
             
            <Toast ref="toast"/>
             </View>
        );
    }
    onChildChanged (text) {
        var choosedList=this.state.choosedList;
            if(text.choosed){
                choosedList.push(text);
            }else{
                for(var i in choosedList){
                    if(choosedList[i]['detailId']==text['detailId']){
                        choosedList.splice(i,1);
                        break;
                    }
                }
            }
            this.setState({
                choosedList:choosedList
            });
    }    
   goCart(){
         const { navigator } = this.props;
         navigator.push({
            name: 'BaseScreen',
            component: BaseScreen,
            params: {
                navigator:navigator,
                ticketId:this.state.ticketId,
                selectedTab:'inquiry'
            }
        });
    }
    buy(){
        if(this.state.choosedList.length==0){
            return;
        }
        const { navigator } = this.props;
        if(this.state.entType=='DIS_FACILITATOR'){
            navigator.push({
                name: 'CZSelectScreen',
                component: CZSelectScreen,
                params: {
                    navigator:navigator,
                    ticketId:this.state.ticketId,
                    choosedList:this.state.choosedList,
                    headData:this.props.headData
                }
            });
        }else{
            navigator.push({
                name: 'CFInquiryScreen',
                component: CFInquiryScreen,
                params: {
                    navigator:navigator,
                    ticketId:this.state.ticketId,
                    choosedList:this.state.choosedList,
                    headData:this.props.headData
                }
            });
        }
        
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
        alignItems: 'center',  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
        justifyContent: 'center'
    },
    container: {
        flexDirection: 'column',   // 水平排布
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },
    back_view:{
        width:20,
    },
    back_btn:{
        width:20,
        height:20,
    },
    middleView: {
        height: 30,
        flexDirection: 'row',
        flex: 4,  // 类似于android中的layout_weight,设置为1即自动拉伸填充
        alignItems: 'center',
        marginLeft:10
    },
    middleText:{
        textAlign:'center',
        flex:1,
        color:'#fff',
        fontSize:16
    },
    infoAndImg:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        
    },
    info_left:{
    },
    info_right_img:{
        width:60,
        height:40
    },
    loadImage:{
        position:'absolute',
        top:250,
        alignSelf:'center',
        zIndex:2
    },
     cellBox_first:{
        flexDirection:'row',
        justifyContent: 'center',
        
        paddingBottom:10,
        paddingLeft:15,
        paddingRight:15,
        alignItems:'center',
        paddingTop:10
    },
    cellText_icon:{
        width:19,
        height:19,
        flex:0.5,
        marginRight:10,
        borderRadius:9.5
    },
    cellText_distance:{
        fontSize:12,
        color:'#16d2d9',
        flex:3
    },
    cellText_Ent:{
        fontSize:15,
        color:'#293f66',
        textAlign:'left',
        flex:1
    },
    cellText_time:{
        color:'#8c9fbe',
        fontSize:13,
        textAlign:'right',
        width:75
    },
    msgView:{
       flexDirection: 'row',
       alignItems:'center',
       height:70,
       padding:12,
    },
    totalCount:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:15,
        paddingRight:1,
        flexWrap:'wrap',
    },
    totalTitle:{
        color:'#fff',
        backgroundColor:'#5292fe',
        marginRight:10,
        borderRadius:2,
        height:20,
        width:30,
        lineHeight:18,
        fontSize:12,
        textAlign:'center'
    },
    totalContent:{
        flexDirection:'row',
        flexWrap:'wrap',
        flex:1,
    },
    text1:{
        color:'#6b7c98',
        lineHeight:20
    },
    icon:{
        width:22,
        height:22,
        marginRight:10,
        marginLeft:-45
    },
    btn_view: {
        flexDirection: 'row',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: Dimensions.get('window').width,
        bottom: 0,
        borderTopWidth:1,
        borderColor:'#e7ebf6'
    },
    chart_view: {
        flex: 3.3,
        height: 60,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#e7ebf6',
        backgroundColor: '#fff'
    },
    chart_btn: {
        width: 20,
        height: 20,
        marginBottom: 5
    },
    chat_title: {
        color: '#6b7c99'
    },
    call_price_view: {
        flex: 6.7,
        backgroundColor: '#2676ff',
        height: 60,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    call_price_text: {
        color: '#fff',
        alignSelf: 'center',
        fontSize: 15
    },
    btn_touch: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
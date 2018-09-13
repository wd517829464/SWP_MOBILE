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
const { NimModule } = NativeModules;
import OfflineMessageView from './OfflineMessageView';
import contactList from './ContactList';
import InquiryCFItem from './component/InquiryCFItem';

const TYPE_OPTIONS = [];
const dispositionTypes=[];
const buyWasteResourcePageData={};
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
var pattern=/^(?=([0-9]{1,10}$|[0-9]{1,7}\.))(0|[1-9][0-9]*)(\.[0-9]{1,3})?$/;
export default class CFInquiryScreen extends Component {
    constructor(props) {
  super(props);
  this.state = {
    choosedList:[],
    dataSource:ds.cloneWithRows(this.props.choosedList),
    inquiryType:false,
    totalPrice:0,
    totalPriceText:0,
    totalQtyText:0,
    priceShow:false,
    priceFocus:false,
    ticketId:''
    // remarkShow:true,
    // totalShow:true
  };
    this.backKeyPressed = this.backKeyPressed.bind(this);
}
componentWillMount(){
    this.choosedList=this.props.choosedList;
    this.currentChoose={};
    for(var i in this.choosedList){
        this.choosedList[i].price=0;
        this.choosedList[i].totalPrice=0;
        this.choosedList[i].index=i;
    }
    this.totalQtyText=this.getQualityTextBySelection();
    this.setState({
        totalQtyText:this.totalQtyText
    });
    storage.load({
        key: 'loginState',
    }).then(ret => {
        this.ticketId=ret.ticketId;
        this.setState({
            ticketId:this.ticketId
        })
    }).catch(err => {
        // alert('当前登录用户凭证已超时，请重新登录。');
    })
    return;
}
getQualityTextBySelection() {
    var arr=this.choosedList;
    var obj = {};
    // var laNumber = new $.LaNumber();
    for(var i in arr) {
        var key = arr[i]['unitValue'];
        var value = parseFloat(arr[i]['wasteAmount']);
        if(key=='吨'||key=='千克'||key=='克'){
            switch (key){
                case '千克':
                    value=value/1000
                    break;
                case '克':
                    value=value/1000000
                    break;
            }
            if(obj['吨']){
                obj['吨']=obj['吨']+value;
            }else{
                obj['吨']=value;
            }
        }else{
            if(obj[key]) {
                obj[key] =obj[key]+value;
            } else {
                obj[key] = value;
            }
        }
    }
    var str='';
    for (var prop in obj) {
        str+=obj[prop]+prop+'，';
    }
    str=str.substring(0,str.length-1);
    return str;
}
    componentDidMount(){
        var st = this;
        BackHandler.addEventListener('hardwareBackPressBuy', this.backKeyPressed);
        this.changeChooseItemListener=DeviceEventEmitter.addListener('changeChooseItem',(text)=>{
             console.log(text);
             this.currentChoose=text;
             this.setState({
                 priceShow:true,
                 priceFocus:true,
             });
        });
        // DeviceEventEmitter.addListener('changeChooseItem',(text)=>{
        //      console.log(text);
        //      this.choosedList[text.index]=text;
        //      var choosedList=this.choosedList;
        //      var totalPriceText=0;
        //      for(var i in choosedList){
        //         totalPriceText+=choosedList[i]['totalPrice'];
        //      }
        //      this.setState({
        //         totalPriceText:totalPriceText.toFixed(2)
        //     });
        // });
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBuy',this.backKeyPressed);
        this.changeChooseItemListener.remove();
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
   changePrice(text){
        text=text||0;
        this.currentChoose.price=text;
        this.currentChoose.totalPrice=text*this.currentChoose.wasteAmount;
        this.choosedList[this.currentChoose.index]=this.currentChoose;
        var choosedList=this.choosedList;
        var totalPriceText=0;
        for(var i in choosedList){
            totalPriceText+=choosedList[i]['totalPrice'];
        }
        this.setState({
            totalPriceText:totalPriceText.toFixed(2),
            dataSource:ds.cloneWithRows(this.choosedList),
        });
   }
   priceFocus(){
        this.setState({
            priceShow:true
        });
    }
    priceBlur(){
        this.setState({
            priceShow:false
        });
    }
    /**
     * 检查聊天对象企业的联系人数量
     * 
     * @memberof CFDetailScreen
     */
    checkContacts() {
        console.log("开始检查企业联系人数量"+this.props.headData.releaseEntId);
         NetUitl.ajax({
            url:'/userservice/getEnterpriseContacts',
            data:{
                enterpriseId: this.props.headData.releaseEntId,
                ticketId: this.ticketId,
            },
            success:(responseJson)=>{
                var data = responseJson.data;
                console.log(data);
                if(data.length>1){
                    this.toChooseChatTarget(data);
                }else{
                    this.showChatView();
                }
            },
            error:(err)=>{
                console.log("检查企业联系人列表出错" + err);
                // this.OfflineMessageView(); this.refs.toast.show('请使用处置企业帐号登录!');
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
                    enterName:this.props.enterName,
                }
            });
        }
    };

    showChatView(){
         NetUitl.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:this.props.enterId,
                ticketId: this.ticketId,
            },
            success:(responseJson)=>{

                var responseData = responseJson;
                console.log("获取企业管理员信息"+esponseData.data);
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
        const {navigator} = this.props;
        if(navigator){
            navigator.push({
                name:'OfflineMessageView',
                component:OfflineMessageView,
                params:{
                    navigator:navigator,
                    ticketId:this.state.ticketId,
                    rowData:rowData,
                    enterId:this.props.enterId,
                }
            }) //
        }
    }    
    changeInquiryType(inquiryType){
        DeviceEventEmitter.emit('changeInquiryType',inquiryType);
        this.setState({
            inquiryType:inquiryType
        });
    }
    confirmPrice(){
        // this.refs.priceInput.blur();
        this.priceBlur();
    }
    render() {
        let head=require('../images/home/commom_icon_logo.png');
        var {headData}=this.props;
        if(headData.fileId){
            head={uri:Constants.IMG_SERVICE_URL+'&fileID='+headData.fileId};
        }
        // <Text style={[styles.cellText_distance]}  numberOfLines={1}> {headData.entAddress||'--'}</Text> 

        // <Text style={{color:'#cad5e6',marginLeft:10,marginRight:10}}>|</Text> 
        // {this.state.loading?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
        return (
            <View style={{flex:1,paddingBottom:70}}>
            <Top navigator={this.props.navigator} ticketId={this.state.ticketId} title={"报价产废资源"}/>
            <View style={styles.inquiryType}>
                <TouchableOpacity style={[styles.typeClick,!this.state.inquiryType?styles.active:{}]} onPress={()=>{this.changeInquiryType(false)}}>
                    <Text style={[styles.clickText,!this.state.inquiryType?{color:'#1171d1'}:{}]}>单独报价</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeClick,this.state.inquiryType?styles.active:{},{marginRight:10}]} onPress={()=>{this.changeInquiryType(true)}}>
                    <Text style={[styles.clickText,this.state.inquiryType?{color:'#1171d1'}:{}]}>打包报价</Text>
                </TouchableOpacity>
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
                    <Text style={styles.totalTitle}>总计</Text>
                    <View style={styles.totalContent}>
                        <Text style={styles.text1}>你将报价：</Text>
                        <Text style={styles.text2}>{this.props.choosedList.length}种危废，{this.state.totalQtyText||'0吨'}</Text>
                    </View>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={(rowData,sectionID,rowID) => 
                        <InquiryCFItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID}
                         rowID={rowID} ticketId={this.state.ticketId}/>
                    }
               />  
               <View style={{height:50}}></View>
            </ScrollView>
            {
                this.state.priceShow?
                <View style={[styles.remarkView,{bottom:0,borderBottomWidth:0}]}>
                    <Text style={styles.remarkTitle}>单价：</Text>
                    <TextInput ref="priceInput" style={styles.remarkInput} underlineColorAndroid="transparent" placeholder="请填写单价"
                    onChangeText={(text)=>{this.changePrice(text)}} keyboardType='numeric'
                    autoFocus={this.state.priceFocus}
                    onFocus={this.priceFocus.bind(this)}
                    onBlur={this.priceBlur.bind(this)} 
                    />
                    <Text style={styles.unit}>元/吨</Text>
                    <TouchableOpacity onPress={this.confirmPrice.bind(this)} style={{backgroundColor:'#1171d1',alignSelf:'center',height:'100%',flexDirection:'column',justifyContent:'center',width:80}}>
                        <Text style={{color:'#fff',fontSize:16,alignSelf:'center'}}>完成</Text>
                    </TouchableOpacity>
                </View>
                :null}
                {this.state.priceShow?null:
                    <View style={styles.remarkView}>
                        <Text style={styles.remarkTitle}>备注：</Text>
                        <TextInput style={styles.remarkInput} underlineColorAndroid="transparent" placeholder="请填写运费核算方式及包装方式" 
                        value={this.state.remark} onChangeText={(text)=>{this.setState({remark:text})}} />
                    </View>
                    }
                {this.state.priceShow?null:
                    <View style={styles.btn_view}>
                        <View style={[styles.totalPriceView]}>
                            <Text style={styles.remarkTitle}>总额：</Text>
                            {this.state.inquiryType?
                                <TextInput style={styles.remarkInput} underlineColorAndroid="transparent" placeholder="输入总额" keyboardType='numeric'
                                    onChangeText={(text)=>{this.totalPriceChange(text)}} />
                            :<Text style={styles.totalPriceText}>￥{this.state.totalPriceText}</Text>
                            }
                        </View>
                        <View style={[styles.chart_view,{borderRightWidth:1}]}>
                            <TouchableOpacity style={[styles.btn_touch]}  onPress={()=> {this.checkContacts()}}>
                                <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/message/common_icon_chat.png')} />
                                <Text style={styles.chat_title}>联系TA</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.call_price_view]}>
                            <TouchableOpacity style={styles.btn_touch} onPress={this.buy.bind(this)}>
                                <Text style={styles.call_price_text}>确认报价</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            }
            {/*<View style={styles.button} width={widths} >
                <TouchableOpacity style={{flex:1}}  onPress={this.buy.bind(this)}><Text style={[styles.button_text,{backgroundColor:this.state.buttonDisable?'#2676ff':'#cad5e6'}]}>确认购买</Text></TouchableOpacity>
            </View>*/}
             
            <Toast ref="toast"/>
             </View>
        );
    }
    totalPriceChange(text){
        this.setState({
            totalPrice:text
        })
    }
    buy(){
        if(this.state.inquiryType){//打包报价
            if(this.state.totalPrice==0){
                this.refs.toast.show('请输入总额');
                return;
            }
            if(!pattern.test(this.state.totalPrice)){
                this.refs.toast.show('总额格式不正确,最多2位小数');
                return;
            }
        }else{//单独报价
            var flag=false;
            for(var i in this.choosedList){
                var price=this.choosedList[i].price;
                if(price==0||!pattern.test(price)){
                    flag=true;
                }
            }
            if(flag){
                this.refs.toast.show('单价必须是不为0的正数，总长不超过十位,最多2位小数');
                return;
            }
        }
        var param={
            releaseEntId:this.props.headData.releaseEntId,//发布企业Id
            releaseId:this.props.headData.releaseId,//发布Id
            quotedType:this.state.inquiryType?0:1,//报价类型
            totalAmount:this.totalQtyText,//总量
            totalPrice:this.state.inquiryType?this.state.totalPrice:this.state.totalPriceText,//总价
            remark:this.state.remark,//备注
        };
        if(this.props.headData.facilitatorEntId){
            param.facilitatorEntId=this.props.headData.facilitatorEntId;
        }
        if(this.props.customerId){
            param.disEntId=this.props.customerId;
            param.inquiryEntId=this.props.inquiryEntId;
        }
        var inquiryDetail=[];
        for(var i in this.choosedList){
            var obj=this.choosedList[i];
            var o={};
            o.releaseDetailId=obj['detailId'];
            if(this.state.inquiryType){
                o.price=0;
                o.totalPrice=0;
            }else{
                o.price=parseFloat(obj['price']);
                o.totalPrice=obj['totalPrice'];
            }
            inquiryDetail.push(o);
        }
        param['inquiryDetail']=inquiryDetail;
        console.log(param);
        NetUitl.jsonAjax({
            url:'/entInquiry/saveEntInquiry.htm?ticketId='+this.ticketId,
            data:param,
            success: (result)=> {
                console.log(result);
                if(result.status==1&&result.data){
                    NetUitl.collectingUserBehavior(this.ticketId,'APP_INQUIRY');
                    DeviceEventEmitter.emit('cf_buy_success',this.props.headData.releaseId);
                    const { navigator} = this.props;
                    if (navigator) {
                        if(this.props.customerId){
                            navigator.popN(3);
                        }else{
                            navigator.popN(2);
                        }
                        
                    }
                }
            }
        })
    }
    
}

const styles = StyleSheet.create({
    remarkView:{
        position: 'absolute',
        bottom: 60,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        borderColor:'#e7ebf6',
        borderTopWidth:1,
        borderBottomWidth:1,
        backgroundColor:'#fff'
    },
    remarkTitle:{
        marginLeft:15,
        color:'#293f66'
    },
    remarkInput:{
        flex:1
    },
    unit:{
        marginRight:15,
        color:'#293f66'
    },
    totalPriceText:{
        flex:1,
        color:'#ff405f',
        fontWeight:'bold'
    },
    inquiryType:{
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'center',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:8,
        paddingBottom:8
    },
    typeClick:{
        backgroundColor:'#f0f3fa',
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:36,
        borderColor:'#eef1f8',
        borderWidth:1,
        borderRadius:4
    },
    clickText:{
        alignSelf:'center',
        flex:1,
        color:'#283f68',
        textAlign:'center',
    },
    active:{
        backgroundColor:'#fff',
        borderColor:'#2676ff'
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
        // borderBottomWidth:0.5,
        // borderBottomColor:'lightgrey',
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
        alignItems:'flex-start',
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
    text2:{
        color:'#1171d1',
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
        bottom: 0
    },
    chart_view: {
        width: 80,
        height: 60,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#e7ebf6',
        backgroundColor: '#fff',
        borderLeftWidth:1
    },
    totalPriceView:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        backgroundColor:'#fff',
        height: 60,
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
        width: 100,
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
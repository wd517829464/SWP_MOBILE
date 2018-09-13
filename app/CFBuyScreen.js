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

const TYPE_OPTIONS = [];
const dispositionTypes=[];
const buyWasteResourcePageData={};
export default class CFBuyScreen extends Component {
    constructor(props) {
  super(props);

  this.state = {
    pay:true,
    data:'',
    dispositionTypeIndex:-1,
    price:0,
    remarkText:'',
    buttonDisable:false,
    loading:true,
    accId:"",
    images:[]
  };
    this.backKeyPressed = this.backKeyPressed.bind(this);
}
componentWillMount(){
    // Alert.alert(this.props.ticketId+'  '+this.props.planitemReleaseId);
    NetUitl.ajax({
        url:'/mobilePlanResponseService/initBuyWasteResourcePageData.htm',
        data:{
            ticketId: this.props.ticketId,
            'planItemReleaseId':this.props.planitemReleaseId
        },
        success:(responseJson)=>{
            var responseData = responseJson;
            console.log(responseData);
            // Alert.alert('title',JSON.stringify(responseData));
            if (responseData) {
                if (responseData.status == "Failure") {
                    this.setState({
                        data: [],
                        loading: false,
                        accId: "",
                        images:[]
                    });
                } else {
                    buyWasteResourcePageData=responseData.data.pageData;
                    dispositionTypes=JSON.parse(responseData.data.pageData.dispositionTypeSuggest);
                    TYPE_OPTIONS=[];
                    for(var i=0;i<dispositionTypes.length;i++){
                            TYPE_OPTIONS.push(dispositionTypes[i].dispositionTypeLabel)
                    }
                    TYPE_OPTIONS=TYPE_OPTIONS.length==0?new Array():TYPE_OPTIONS;
                    this.setState ({
                        data: responseData.data.pageData,
                        loading:false,
                        accId:buyWasteResourcePageData.planReleaseUser,
                        images:responseData.data.pageData.imgList
                    });
                }
            }
        }
    });
}
    componentDidMount(){
        var st = this;
        BackHandler.addEventListener('hardwareBackPressBuy', this.backKeyPressed);
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
        console.log("开始检查企业联系人数量"+this.props.enterId,);
         NetUitl.ajax({
            url:'/userservice/getEnterpriseContacts',
            data:{
                enterpriseId: this.props.enterId,
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
                    ticketId:this.props.ticketId,
                    enterName:this.props.enterName,
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
         NetUitl.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:this.props.enterId,
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
                                ticketId:this.props.ticketId,
                                rowData:rowData,
                                enterId:this.props.enterId,
                            }
                        }) //
                    }
    }    
    render() {
        var data=this.state.data;
        var date=data.planStartDate&&data.planStartDate.length>10?(data.planStartDate.substring(0,10)+'至'+data.planEndDate.substring(0,10)):('无');
        let head=null;
        if(this.state.images.length>0){
            var obj=this.state.images[0];
            var imgUrl={uri:Constants.IMG_SERVICE_URL+'&businessCode='+obj.businessCode+'&fileID='+obj.fileId};
            head=(<Image style={[styles.info_right_img]} resizeMode={Image.resizeMode.contain} source={imgUrl} />);
        }
        return (
            <View style={{flex:1,paddingBottom:70}}>
            <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"产废资源报价"}/>
            <ScrollView>
                <View style={styles.cellBox_first}>
                    <Image style={[styles.cellText_icon]} resizeMode={Image.resizeMode.contain} source={require('../images/home/commom_icon_logo.png')} />
                    <Text style={[styles.cellText_Ent]}>{this.props.enterName||'--'}</Text> 
                    <Text style={[styles.cellText_distance]}>l  {this.props.cantonName||'暂无'}</Text> 
                </View>
                <View style={styles.msgView}>
                    <View style={styles.info1}>
                        <Text style={styles.name}>{data.wasteName}</Text>
                        <Text style={styles.code}>{data.wasteCode}</Text>
                    </View>
                </View>
                <View style={[styles.info,styles.infoAndImg]}>
                    <View style={styles.info_left}>
                        <Text style={styles.info_text}>有毒有害物质：无</Text>
                        <Text style={styles.info_text}>处理时间：{date}</Text>
                    </View>
                    {head}
                </View>
                <View style={styles.info}>
                    <Text style={styles.info_text_count}>数量：{data.planDisposeQuantity}{data.unitCode=='C'?'只':'吨'}</Text>
                </View>
                <View style={styles.form}>
                    <Text style={styles.form_title}>处置方式</Text>
                    <View style={styles.input_view}>
                        <ModalDropdown style={styles.dropdown}
                           textStyle={[styles.dropdown_text,{width:widths-32}]}
                           defaultValue='选择处置方式'
                           dropdownStyle={[styles.dropdown_dropdown,{width:widths-30}]}
                           options={TYPE_OPTIONS}
                           onSelect={(idx)=>this.dropdownSelect(idx)}
                           renderRow={this.dropdown_renderRow.bind(this)}
                           renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this.dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
            />
                        <Image style={styles.down_arrow} resizeMode={Image.resizeMode.contain} source={require('../images/base/commom_icon_arrowdown.png')}/>
                    </View>
                    <Text style={styles.form_title}>单价</Text>
                    <View style={[styles.input_view,styles.input_view_price]}>
                        <TextInput underlineColorAndroid={"transparent"} style={[styles.input,styles.input_price]} placeholder="输入单价金额" keyboardType='numeric' onChangeText={(text) => this.onChangeText(text)}  />
                        <View style={styles.input_title_view}><Text style={styles.input_title}>￥</Text></View>
                    </View>
                    <View style={styles.tipView}>
                        <Text style={styles.tipRight}>价格包含运费</Text>
                    </View>

                    <Text style={[styles.form_title,styles.remark_title]}>备注</Text>
                    <View style={[styles.input_view,styles.input_view_price]}>
                        <TextInput underlineColorAndroid={"transparent"} 
                                             style={[styles.remarkInput]} 
                                             placeholder="输入备注信息（500字以内）" 
                                             textAlignVertical = 'top'
                                             multiline={true}
                                             onChangeText={(text) => this.onRemarkTextChange(text)}  />
                        <View style={styles.input_title_view}><Text style={styles.input_title}></Text></View>
                    </View>

                    <View style={styles.switchView}>
                        <Text style={styles.switchText}>经营方支付</Text>
                        <Switch
                        onValueChange={(value) => this.setState({pay: value})}
                        style={styles.switch}
                        onTintColor='#246eeb'
                        value={this.state.pay} />
                    </View>
                    
                    {/*<CheckBox
                    style={{width:110,alignSelf:'flex-end',marginTop:10}}
                    leftTextStyle={{color:'#8c9dbf'}}
                    onClick={()=>this.setState({pay:!this.state.pay})}
                    checkedImage={<Image source={require('../images/base/common_checkbox_checked.png')} style={{width:24,height:24}}/>}
                    unCheckedImage={<Image source={require('../images/base/common_checkbox_normal.png')} style={{width:24,height:24}}/>}
                    isChecked={this.state.pay}
                    leftText="经营方支付" />*/}
                </View>
                <View style={styles.totalprice_view}>
                    <Text style={styles.text1}>总额：</Text>
                    <View style={styles.totalprice}>
                        <Text style={styles.text2}>￥{this.fmoney(this.state.price*data.planDisposeQuantity,4)}</Text><Text style={styles.text3}>包含运费</Text>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.btn_view}>
                <View style={[styles.chart_view,{borderRightWidth:1}]}>
                    <TouchableOpacity style={[styles.btn_touch,{width:widths*0.33}]}  onPress={()=> {this.checkContacts()}}>
                        <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/message/common_icon_chat.png')} />
                        <Text style={styles.chat_title}>咨询</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chart_view}>
                    <TouchableOpacity style={[styles.btn_touch,{width:widths*0.33}]} onPress={this.goCart.bind(this)}>
                        <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/base/tab_icon_cart_s.png')} />
                        <Text style={styles.chat_title}>报价单</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.call_price_view,{backgroundColor:this.state.buttonDisable?'#2676ff':'#cad5e6'}]}>
                     <TouchableOpacity style={styles.btn_touch} onPress={this.buy.bind(this)}>
                        <Text style={styles.call_price_text}>报价</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/*<View style={styles.button} width={widths} >
                <TouchableOpacity style={{flex:1}}  onPress={this.buy.bind(this)}><Text style={[styles.button_text,{backgroundColor:this.state.buttonDisable?'#2676ff':'#cad5e6'}]}>确认购买</Text></TouchableOpacity>
            </View>*/}
             {this.state.loading?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
            <Toast ref="toast"/>
             </View>
        );
    }
    onChangeText(text){
        var exp = /^([1-9][\d]{0,}|0)(\.[\d]{1,3})?$/;
        if(text&&exp.test(text)&&this.state.dispositionTypeIndex!=-1){
            this.setState({buttonDisable:true,price:text});
        }else{
            this.setState({buttonDisable:false,price:text});
        }
    }

    onRemarkTextChange(text){
        this.setState({remarkText:text});
    }

   goCart(){
         const { navigator } = this.props;
         navigator.push({
            name: 'BaseScreen',
            component: BaseScreen,
            params: {
                navigator:navigator,
                ticketId:this.props.ticketId,
                selectedTab:'cart'
            }
        });
    }
         /**
     * 格式化money
     * s为要格式化的money
     * n为小数位数
     */
    fmoney(s, n){   
         if(s==='')
            return;
       n = n > 0 && n <= 20 ? n : 2;   
       s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";   
       var l = s.split(".")[0].split("").reverse(),   
       r = s.split(".")[1];   
       var t = "";   
       for(let i = 0; i < l.length; i ++ ) {   
          t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");   
       }   
       return t.split("").reverse().join("") + "." + r;   
    }
    buy(){
        if(!this.state.buttonDisable){
            return;
        }
        var st = this;
        this.setState({buttonDisable:false,loading:true});
        buyWasteResourcePageData.price=this.state.price;
        buyWasteResourcePageData.totalAmount=this.state.price*buyWasteResourcePageData.planDisposeQuantity;
        buyWasteResourcePageData.dispositionTypeId=dispositionTypes[this.state.dispositionTypeIndex]['dispositionTypeId'];
        buyWasteResourcePageData.operatingPartyPayment=this.state.pay?1:0;
        buyWasteResourcePageData.dispositionTypeSuggest='';
        buyWasteResourcePageData.remark = this.state.remarkText;//新添加备注信息字段
        console.log("准备提交到服务端的数据"+JSON.stringify(buyWasteResourcePageData));
        NetUitl.ajax({
            url:'/mobilePlanResponseService/saveBuyWasteResourcePageData.htm',
            data:{
                ticketId: this.props.ticketId,
                'buyWasteResourcePageData':JSON.stringify(buyWasteResourcePageData)
              
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if(responseData.status==1){
                    DeviceEventEmitter.emit('cf_buy_success',this.props.planitemReleaseId);
                }else{
                    // ToastAndroid.show(responseData.infoList[0],ToastAndroid.SHORT);
                    this.refs.toast.show(responseData.infoList[0]);
                }
                const { navigator} = this.props;
                if (navigator) {
                    navigator.popN(2);
                }
                
            }
        });
    }
     dropdownSelect(idx) {
         var exp = /^([1-9][\d]{0,}|0)(\.[\d]{1,3})?$/;
        if(idx!=-1&&this.state.price&&exp.test(this.state.price)){
            this.setState({buttonDisable:true,dispositionTypeIndex:idx});
        }else{
            this.setState({buttonDisable:false,dispositionTypeIndex:idx});
        }
    }
    dropdown_renderRow(rowData, rowID, highlighted) {
    let icon = highlighted ? require('../images/dropdown/heart.png') : require('../images/dropdown/flower.png');
    let evenRow = rowID % 2;
    return (
      <TouchableOpacity underlayColor='cornflowerblue'>
        <View style={[styles.dropdown_row, {backgroundColor: evenRow ? '#e0e4eb' : 'white'}]}>
          <Text style={[styles.dropdown_row_text, highlighted && {color: 'mediumaquamarine'}]}>
            {`${rowData}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    if (rowID == TYPE_OPTIONS.length - 1) return;
    let key = `spr_${rowID}`;
    return (<View style={styles.dropdown_2_separator} key={key}/>);
  }
}

const styles = StyleSheet.create({
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
        justifyContent: 'space-between',
        borderBottomWidth:0.5,
        borderBottomColor:'lightgrey',
        paddingBottom:8,
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
    },
    cellText_icon:{
        width:18,
        height:18,
        // flex:0.5,
        marginRight:10,
        marginTop:-1
    },
    cellText_distance:{
        fontSize:10,
        color:'#16d2d9',
        flex:2
    },
    cellText_Ent:{
        fontSize:13,
        color:'#293f66',
        textAlign:'left',
        flex:5
    },
    msgView:{
       flexDirection: 'row',
       alignItems:'center',
       height:70,
       padding:12,
    },
    icon:{
        width:22,
        height:22,
        marginRight:10,
        marginLeft:-45
    },
    info1:{
        flex:1,
    },
    info:{
        marginLeft:15,
        marginRight:15,
        paddingTop:8,
        paddingBottom:8,
        borderTopWidth:1,
        borderTopColor:'#e9edf7',
    },
    info_text:{
        color:'#6b7c99',
        fontSize:13,
        lineHeight:22,
    },
    info_text_count:{
        color:'#293f66',
        fontSize:15,
        lineHeight:22,
        alignSelf:'flex-end'
    },
    name:{
        color:'#293f66',
        fontSize:16,
        lineHeight:30
    },
    code:{
        color:'#6b7c99',
        fontSize:14
    },
    form:{
        backgroundColor:'#f7f8fa',
        borderTopWidth:1,
        borderTopColor:'#e9edf7',
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7',
        paddingBottom:10,
        paddingTop:(Platform.OS === "ios")?30:10,
        paddingLeft:15,
        paddingRight:15
    },
    input_view:{
        flexDirection: 'row',
        marginBottom:20,
        alignItems:'center',
    },
    input_view_price:{
        marginBottom:8,
    },
    form_title:{
        color:'#284173',
        fontSize:15
    },
    remark_title:{
        marginTop:20,
    },
    input:{
        flex:1,
        backgroundColor:'#fff',
        height:40,
        lineHeight:40,
        fontSize:15,
        paddingLeft:10,
        marginTop:10,
        borderWidth:1,
        borderColor:'#cad5e6',
        borderRadius:3,
        paddingTop:10,
        paddingBottom:10
    },
    remarkInput:{
        flex:1,
        height:100,
        lineHeight:20,
        fontSize:15,
        paddingLeft:10,
        paddingRight:10,
        // alignItems:'flex-start',
        flexDirection:'column',
        // maxLength:'500',
        marginTop:10,
        borderWidth:1,
        borderColor:'#cad5e6',
        borderRadius:3,
        paddingTop:10,
        backgroundColor:'#FFF',
        // paddingLeft:30,
        paddingBottom:10,
    },
    down_arrow:{
        position:'absolute',
        right:5,
        width:30,
        height:30,
        top:16,
    },
    input_title_view:{
        position:'absolute',
        left:10,
        top:15,
        height:28,
        flexDirection:'column',
        justifyContent:'center',
        backgroundColor:'transparent'
    },
    input_title:{
        fontSize:16
    },
    input_price:{
        paddingLeft:30
    },
    tipView:{
        flexDirection: 'row',
       alignItems:'center',
    },
    tipLeft:{
        color:'#99a8bf',
        fontSize:13
    },
    tipRight:{
        color:'#16d2d9',
        fontSize:13
    },
    totalprice_view:{
       flexDirection: 'row',
       alignItems:'center',
       paddingLeft:45,
       paddingTop:10,
       paddingBottom:10,
       alignSelf:'flex-end'
    },
    text1:{
        color:'#293f66',
        fontSize:15,
        marginRight:10
    },
    text2:{
        color:'#ff4060',
        fontSize:16,
        marginRight:20,
        marginBottom:5
    },
    text3:{
        color:'#99a8bf',
        fontSize:14
    },
    button:{
        position:'absolute',
        height:50,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems:'center',
        bottom:0
    },
    button_text:{
        color:'#fff',
        fontSize:16,
        flex:1,
        height:50,
        lineHeight:50,
        textAlign:'center',
        backgroundColor:'#2676ff',
    },
    dropdown:{
        flex:1,
        backgroundColor:'#fff',
        height:40,
        paddingLeft:10,
        marginTop:10,
        borderWidth:1,
        borderColor:'#cad5e6',
        borderRadius:3,
        paddingTop:10,
        paddingBottom:10,
        alignItems:'flex-end'
    },
    dropdown_text:{
        fontSize:15,
        color:'#99a8bf',
        // backgroundColor:'#ff0',
        paddingLeft:10,
        height:38,
        lineHeight:38,
        marginTop:Platform.OS === 'ios' ? -9 : -18,//android only
        paddingTop:0,//android only
    },
    dropdown_dropdown: {
        borderColor: '#cad5e6',
        borderWidth: 1,
        borderRadius: 3,
        height:150,
        justifyContent:'flex-end',
        marginLeft:-1,
        marginTop:5
    },
  dropdown_row: {
    flex:1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dropdown_row_text: {
    flex:1,
    marginHorizontal: 4,
    fontSize: 16,
    color: '#909bb0',
    textAlignVertical: 'center',
    textAlign:'left',
    paddingLeft:9
  },
  switchView:{
      flexDirection:'row',
      justifyContent:'flex-end',
      alignItems:'center',
      marginTop:10,
      marginBottom:10
  },
  switchText:{
      color:'#294171',
      marginRight:10
  },
  switch:{

  },
  btn_view:{
        flexDirection:'row',
        height:60,
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        width:Dimensions.get('window').width,
        bottom:0
    },
    chart_view:{
        flex:3.3,
        height:60,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        borderColor:'#f7f8fa',
        borderTopWidth:1,
        backgroundColor:'#fff'
    },
    chart_btn:{
        width:20,
        height:20,
        marginBottom:5
    },
    chat_title:{
        color:'#6b7c99',
        fontSize:13
    },
    call_price_view:{
        flex:6.7,
        backgroundColor:'#2676ff',
        height:60,
        flexDirection:'column',
        justifyContent:'center'
    },
    call_price_text:{
        color:'#fff',
        alignSelf:'center',
        fontSize:15
    },
    btn_touch:{
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center'
    }
});
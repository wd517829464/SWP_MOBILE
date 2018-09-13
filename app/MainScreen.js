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
    TouchableOpacity,
    BackHandler,
    DeviceEventEmitter,
    Linking
} from 'react-native';
import Header from './component/Header';
import EnterpriseList from './component/EnterpriseList';
import FilterAndOrder from './component/FilterAndOrder';
import Dialog from './component/dialog';
import AreaScreen from './component/AreaScreen';
import WeightScreen from './component/WeightScreen';
import RemoveScreen from './component/RemoveScreen';
import NetUtil from './util/NetUitl';
import CFSelectScreen from './CFSelectScreen';
import contactList from './ContactList';
import {NativeModules} from 'react-native';
import Constants from './util/Constants';
const {NimModule} = NativeModules;
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var moneyDialogHeight=widths*0.8*530/610;
import Toast, { DURATION } from 'react-native-easy-toast';
export default class MainScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            buysuccess:false,
            areaShow:false,
            weightShow:false,
            removeShow:false,
            orderIndex:0,
            areaCode:'',
            weight:'',
            remove:[],
            ticketId:'',
            versionShow:false,
            version:{},
            showMoneyDialog:false,
            showLicence:false,
            myBit:0,
            currentItem:{},
            showHasCompany:false,
            entType:'',
            showVersionDialog:false,
        }
    }
    componentWillMount() {
      storage.load({
        key: 'loginState',
      }).then(ret => {
          this.entId=ret.entId;
          this.areaCode=ret.cantonCode&&ret.cantonCode.length>2?(ret.cantonCode.substring(0,2)+'0000'):'';
          this.setState({
              ticketId:ret.ticketId,
              areaCode:this.areaCode,
              entType:ret.entType
          })
          if(ret.entId&&ret.ticketId&&ret.entType=='DISPOSITION'){
            this.checkEntInfoCompleted();
          }
          if(ret.entId&&ret.ticketId&&ret.entType=='DIS_FACILITATOR'){
            this.checkHasCompany();
          }
      }).catch(err => {
          // alert('当前登录用户凭证已超时，请重新登录。');
      })
      storage.load({
          key: 'versionCodeConfirm',
      }).then(ret => {
          this.compareVersion(ret);
      }).catch(err => {
          this.compareVersion([]);
      })
  }
  compareVersion(versionCodeConfirm){
    NetUtil.jsonAjax({
      url:'/appManagement/getLatestVersion',
      data:{
        appType:"ANDROID",
        entType:"DISPOSITION"
      },
      success:(result)=>{
        if(result.status==1&&result.data){
          // console.log(Constants.version,result.data.versionCode,versionCodeConfirm);
          if(Constants.version!==result.data.versionCode&&versionCodeConfirm.indexOf(result.data.versionCode)==-1){
            result.data.versionCodeConfirm=versionCodeConfirm;
            this.setState({showVersionDialog:true,version:result.data});
          }
        }
      }
    })
  }
    componentDidMount() {
     
    let _this=this;
    this.cfBuyListener=DeviceEventEmitter.addListener('cf_buy_success',function(text){
      if(text){
        _this.setState({buysuccess:true});
      }
      let seconds=2;
      _this.interval=setInterval(()=>{
          if(seconds<=0){
            clearInterval(_this.interval);
            _this.setState({buysuccess:false});
            return;
          }
          seconds--;
        },1000);
       
    });
    this.areaListener=DeviceEventEmitter.addListener('areaSelect',(text)=>{
      // console.log(this.state.areaCode,_this.state.areaCode);
      if(text=='open'){
        this.setState({areaShow:true});
      }else{
        if(text!=='close'){
          this.areaCode=text;
          this.setState({areaShow:false,areaCode:text});
        }else{
          this.setState({areaShow:false});
        }
      }
       
    });
    this.weightListener=DeviceEventEmitter.addListener('weightSelect',(text)=>{
      if(text=='open'){
        this.setState({weightShow:true});
      }else{
        if(text!=='close'){
          this.weight=text;
          this.setState({weightShow:false,weight:text});
        }else{
          this.setState({weightShow:false});
        }
      }
       
    });
    this.removeListener=DeviceEventEmitter.addListener('removeSelect',(text)=>{
      if(text=='open'){
        this.setState({removeShow:true});
      }else{
        if(text=='close'){
          this.setState({removeShow:false});
        }else{
          this.remove=text;
          this.setState({removeShow:false,remove:text});
        }
      }
       
    });
    
    
    this.tabChangeListener=DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
      this.setState({areaCode:this.areaCode,weight:this.weight,remove:this.remove});
    });   
    this.hasCompanyListener=DeviceEventEmitter.addListener('checkHasCompany',(text)=>{
      this.setState({currentItem:text});
      this.checkHasCompany(1);
    });   
  }
  componentWillUnmount(){
    this.cfBuyListener.remove();
    this.areaListener.remove();
    this.weightListener.remove();
    this.removeListener.remove();
    this.tabChangeListener.remove();
    this.hasCompanyListener.remove();
}
checkEntInfoCompleted(){
  NetUtil.ajax({
    url: '/sysEnterpriseBase/checkEntInfoCompleted',
    data:{
      ticketId:this.props.ticketId
    },
    success: (data)=> {
        if (data.status == 1) {
          this.setState({
            showLicence:!data.data.hasLicence&&!data.data.licenceAuditStatus
          })
        }
    }
});
}
checkHasCompany(){
  var obj=arguments[0];
  NetUtil.ajax({
    url: '/facilitatorCustomer/listFacilitatorCustomer.htm',
    data:{
      ticketId:this.props.ticketId,
      pageIndex:1,
      pageSize:5
    },
    success: (result)=> {
        if (result.status == 1&&(!result.data.customerList||result.data.customerList.length==0)) {
          this.setState({
            showHasCompany:true
          })
        }else if(obj){
          const { navigator} = this.props;
          if (navigator) {
              navigator.push({
                  name:'CFSelectScreen',
                  component:CFSelectScreen,
                  params:{
                      navigator:navigator,
                      ticketId:this.props.ticketId,
                      headData:this.state.currentItem,
                      index:this.state.currentItem.index
                  }
              })
          }
        }
    }
});
}

favorite(text){
  var url=text.favorited?'/entFavorite/cancelEntFavorite':'/entFavorite/addEntFavorite';
  var param={
      entId:this.entId,
      referenceId:text.releaseId,
      favoriteType:'MSGID',
      ticketId:this.props.ticketId
  };
  NetUtil.ajax({
      url:url,
      data:param,
      success:(result)=>{
          if(result.status==1&&result.data){
              var str='';
              if(text.favorited){
                  str='取消';
              }
              this.refs.toast.show(str+'收藏成功');
              this.refs.enterpriseList.childMethodFavorite(text.index);
          }
      }
  }); 
}
// contact(text){
//   this.setState({
//     currentItem:text
//   })
//   this.checkContacts(text);
// }
onChildChanged(text){
  console.log(text);
  if(text.action=='favorite'){
    this.favorite(text);
    return;
  }
  // if(text.action=='contact'){
  //   this.contact(text);
  //   return;
  // }
   if(text.action=='contact'&&text.entBindStatus=='1'){
    this.setState({
      currentItem:text
    })
    this.checkContacts(text);
    return;
  }
  NetUtil.jsonAjax({
    url:'/entBitcionAccount/checkEntAccount.htm?ticketId='+this.props.ticketId,
    data:{consumeAmount: 8},
    success:(result)=>{
        if (result.status == 1) {
          this.setState({
            showMoneyDialog:true,
            myBit:result.data.bitcion,
            currentItem:text
          })
      }
    }
});
  
}
confirmPay(){
    NetUtil.jsonAjax({
      url: '/entBindServe/saveBindServe.htm?ticketId='+this.props.ticketId,
      data: {
          consumeAmount: 8,
          bindServiceId: this.state.currentItem.releaseId,
          serviceType: 'RESOURCE_POOL'
      },
      success:(result)=>{
          console.log(result);
          if (result.status == 1) {
              this.refs.toast.show('购买成功！');
              this.setState({
                showMoneyDialog:false
              })
              this.showEntBaseInfo(result.data);
          }
      }
  });
}
updateRemark(serviceId,entName) {
  NetUtil.jsonAjax({
      url: '/entBindServe/updateBindServe?ticketId='+this.props.ticketId,
      data: {
          id: serviceId,
          remark: '支付“' + entName + '”发布的危废处置权'
      },
      success: (result)=> {
          console.log(result);
      }
  });
}
showEntBaseInfo(serviceId) {
  NetUtil.ajax({
      url: '/enterprise/getEnterpriseInfoByEntId?ticketId='+this.props.ticketId,
      data: {
          entId: this.state.currentItem.releaseEntId
      },
      success:(result) =>{
          console.log(result);
          if (result.status == 1) {
              this.updateRemark(serviceId, result.data.entName);
              this.refs.enterpriseList.childMethod(result.data,this.state.currentItem.index);
              if(this.state.currentItem.action=='contact'){
                NetUtil.collectingUserBehavior(this.props.ticketId,'APP_PAY_CONTRACT');
                this.checkContacts(this.state.currentItem);
              }else{
                NetUtil.collectingUserBehavior(this.props.ticketId,'APP_PAY_INQUIRY');
                if(this.state.entType=='DIS_FACILITATOR'){
                  this.checkHasCompany(1);
                }else{
                  const { navigator} = this.props;
                  if (navigator) {
                      navigator.push({
                          name:'CFSelectScreen',
                          component:CFSelectScreen,
                          params:{
                              navigator:navigator,
                              ticketId:this.props.ticketId,
                              headData:this.state.currentItem,
                              index:this.state.currentItem.index
                          }
                      })
                  }
                }
              }
          }
      }
  });
}

getContentArr(description){
  var arr=description.split('%');
  let elementArr=[];
  for(var i=0;i<arr.length;i++){
      elementArr.push(<Text style={styles.contentText} key={i}>- -   {arr[i]}</Text>);
  }
  return elementArr;
}
    render() {
        // <AreaScreen navigator={this.props.navigator}/>
        // {this.state.orderShow?<OrderScreen navigator={this.props.navigator} ticketId={this.props.ticketId} tabIndex={this.state.orderIndex}/>:null}
        // <TouchableHighlight onPress={this.download.bind(this)}><Text>下载</Text></TouchableHighlight>
        let contentArr=null;
        if(this.state.showVersionDialog){
          contentArr=this.getContentArr(this.state.version.description);
        }
        return (
            <View style={{flex:1}}>
                {this.state.ticketId?<Header navigator={this.props.navigator} ticketId={this.state.ticketId} title="资源池"/>:null}
                <FilterAndOrder navigator={this.props.navigator} areaCode={this.state.areaCode} codeList={this.state.remove} weight={this.state.weight}/>
                {this.state.ticketId?<EnterpriseList callbackParent={(text)=>{this.onChildChanged(text)}} ref="enterpriseList" navigator={this.props.navigator} ticketId={this.state.ticketId}/>:null}
                {this.state.buysuccess?<Dialog type="success" title="报价成功" tip="在报价单中等待产废企业确认"/>:null}
                {this.state.areaShow&&this.state.ticketId?<AreaScreen navigator={this.props.navigator} ticketId={this.state.ticketId} areaCode={this.state.areaCode}/>:null}
                {this.state.weightShow&&this.state.ticketId?<WeightScreen navigator={this.props.navigator} ticketId={this.state.ticketId} weight={this.state.weight}/>:null}
                {this.state.removeShow&&this.state.ticketId?<RemoveScreen navigator={this.props.navigator} ticketId={this.state.ticketId} codeList={this.state.remove}/>:null}
                {this.state.showMoneyDialog?
                <View style={styles.moneyDialogLay}>
                  <View style={styles.moneyDialog}>
                    <Image source={require('../images/base/money-bg.png')} style={styles.backgroundImage}>
                        <TouchableOpacity style={{alignSelf:'flex-end',flexDirection:'column',justifyContent:'center',position:'absolute',right:1,top:moneyDialogHeight*0.121,width:30,height:32,alignItems:'center'}} onPress={()=>{this.setState({showMoneyDialog:false})}}><Text style={{fontSize:18,alignSelf:'center'}}>X</Text></TouchableOpacity>
                        <View style={{flexDirection:'row',top:moneyDialogHeight*0.34,position:'absolute'}}>
                          <Text style={{color:'#293f66',fontSize:16}}>你需要花费</Text>
                          <Text style={{color:'#fb622a',fontSize:24,lineHeight:18,marginLeft:4,marginRight:4}}>8</Text>
                          <Text style={{color:'#293f66',fontSize:16}}>个易废币</Text>
                        </View>
                        <Text style={{color:'#293f66',fontSize:15,position:'absolute',top:moneyDialogHeight*0.44}}>来进行报价</Text>
                        <View style={{flexDirection:'row',position:'absolute',bottom:moneyDialogHeight*0.3}}>
                        <Text style={{color:'#7887a2',fontSize:14}}>当前账号余额：</Text>
                        <Text style={{color:'#fb622a',fontSize:20,lineHeight:16}}>{this.state.myBit}</Text>
                        <Text style={{color:'#7887a2',fontSize:14}}>个易废币</Text>
                        </View>
                        {this.state.myBit>=8?
                        <TouchableOpacity style={{position:'absolute',bottom:moneyDialogHeight*0.09,backgroundColor:'#fa6726',width:200,height:40,alignItems:'center',justifyContent:'center',borderRadius:20}} onPress={this.confirmPay.bind(this)}>
                          <Text style={{color:'#fff',fontSize:16}}>确定支付</Text>
                        </TouchableOpacity>:<Text style={{color:'#fa6726',fontSize:16,bottom:moneyDialogHeight*0.12,position:'absolute'}}>请在电脑上充值后再进行报价</Text>}
                    </Image>
                </View>
                </View>
                :null}
                {this.state.showLicence?
                  <View style={styles.moneyDialogLay}>
                    <View style={styles.licenceDialog}>
                        <Text style={{fontSize:16,color:'#7887a2',alignSelf:'center',position:'absolute',top:moneyDialogHeight*0.08}}>提示</Text>
                        <View style={{alignSelf:'center',position:'absolute',top:moneyDialogHeight*0.25,width:widths*0.6}}>
                          <Text style={{fontSize:18,color:'#293f66',textAlign:'center',marginBottom:moneyDialogHeight*0.05}}>为了你更好的工作,</Text>
                          <Text style={{fontSize:18,color:'#293f66',textAlign:'center'}}>请在电脑上创建许可证</Text>
                        </View>
                        <TouchableOpacity style={{position:'absolute',alignSelf:'center',bottom:moneyDialogHeight*0.09,backgroundColor:'#fa6726',width:200,height:40,alignItems:'center',justifyContent:'center',borderRadius:20}} onPress={()=>{this.setState({showLicence:false})}}>
                          <Text style={{color:'#fff',fontSize:16}}>我知道了</Text>
                        </TouchableOpacity>
                  </View>
                  </View>
                  :null}
                  {this.state.showHasCompany?
                    <View style={styles.moneyDialogLay}>
                      <View style={styles.licenceDialog}>
                        <Image source={require('../images/base/noCompany.png')} style={styles.noCompanyImg}/>
                        <Text style={{color:'#293f66',fontSize:16,position:'absolute',bottom:moneyDialogHeight*0.22,lineHeight:24,width:widths*0.7,alignSelf:'center'}}>您还未登记所代理的处置企业，请在电脑上登记，登记后进行报价</Text>
                        <TouchableOpacity style={{position:'absolute',alignSelf:'center',borderColor:'#2290e9',borderWidth:1,bottom:moneyDialogHeight*0.05,backgroundColor:'#fff',width:200,height:34,alignItems:'center',justifyContent:'center',borderRadius:20}} onPress={()=>{this.setState({showHasCompany:false})}}>
                          <Text style={{color:'#2290e9',fontSize:16}}>我知道了</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  :null}
                  {this.state.showVersionDialog?
                    <View style={styles.versionDialog} width={widths} height={heights}>
                    <View>
                        <View style={styles.whiteBg}></View>
                        <Image style={styles.iconView}  source={require('../images/base/version_header.png')}>
                            <Text style={{color:'#263f67',fontSize:20,fontWeight:'bold',marginBottom:5,marginTop:30}}>发现新版本</Text>
                            <Text style={{color:'#263f67',fontSize:13}}>版本：{this.state.version.versionCode}</Text>
                        </Image>
                        <View style={[styles.contentView]}>
                                <Text style={styles.title}>更新内容</Text>
                                <View style={{paddingBottom:20}}>
                                  {contentArr}
                                </View>
                            </View>
                        <View style={{backgroundColor:'#fff',width:widths-40,borderBottomLeftRadius:5,borderBottomRightRadius:5,overflow:'visible'}}>
                                <View style={styles.btnView}>
                                    <TouchableOpacity style={styles.btnClick} onPress={this.cancel.bind(this)}><Text style={[styles.btnText,{color:'#9ba7bd'}]}>下次再说</Text></TouchableOpacity>
                                    <TouchableOpacity style={[styles.btnClick,{backgroundColor:'#2676ff'}]} onPress={this.confirm.bind(this)}><Text style={[styles.btnText,{color:'#fff'}]}>立即更新！</Text></TouchableOpacity>
                                </View>
                            </View>
                    </View>
                 </View>  
                    :null}
                <Toast ref="toast" />
            </View>
        );
    }
    cancel(){
      var versionCodeConfirm=this.state.version.versionCodeConfirm;
      versionCodeConfirm.push(this.state.version.versionCode);
      storage.save({
        key: 'versionCodeConfirm',  // 注意:请不要在key中使用_下划线符号!
        rawData: versionCodeConfirm
      });
      this.setState({
        showVersionDialog:false
      })
    }
    confirm(){
      this.cancel();
      NativeModules.DownloadApk.downloading('http://www.yifeiwang.com/yfw.apk',"yfw.apk");
      this.refs.toast.show('yfw.apk正在下载...');
    }
    checkContacts(text) {
      var entId=text.facilitatorEntId?text.facilitatorEntId:text.releaseEntId;
      console.log("开始检查企业联系人数量"+entId);
       NetUtil.ajax({
          url:'/userservice/getEnterpriseContacts',
          data:{
              enterpriseId: entId,
              ticketId: this.props.ticketId,
          },
          success:(responseJson)=>{
              var data = responseJson.data;
              console.log(data);
              if(data.length>1){
                  this.toChooseChatTarget(data);
              }else if(data.length==1){
                  NimModule.ChatWith(data[0]['loginName'],()=>{}) ;
              }else{
                  this.OfflineMessageView(text);
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
                  enterName:this.state.currentItem.entName,
              }
          });
      }
  };

  OfflineMessageView(){
      var rowData = {releaseEntName:this.state.currentItem.enterName};
      var entId=this.state.currentItem.facilitatorEntId?this.state.currentItem.facilitatorEntId:this.state.currentItem.releaseEntId;
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
}

const styles = StyleSheet.create({
  moneyDialogLay:{
    position:'absolute',
    width:'100%',
    height:'100%',
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  moneyDialog:{
    width:widths*0.8,
    height:moneyDialogHeight,
    position:'absolute',
    left:widths*0.1,
    top:140,
    zIndex:10000
},
backgroundImage:{
  flex:1,
  alignItems:'center',
  justifyContent:'center',
  width:null,
  height:null,
  backgroundColor:'rgba(0,0,0,0)',
},
licenceDialog:{
  width:widths*0.8,
    height:moneyDialogHeight,
    position:'absolute',
    left:widths*0.1,
    top:140,
    zIndex:10000,
    backgroundColor:'#fff',
    borderRadius:8
},
noCompanyImg:{
  width:widths*0.8,
  height:widths*0.8*240/470,
  position:'absolute',
  top:0,
  left:0,
},
whiteBg:{
  position:'absolute',
  backgroundColor:'#fff',
  height:(widths-40)*441/591,
  width:widths-40,
  // marginLeft:(202-widths)/2,
  // top:(widths-40)*441*0.01/591,
  borderTopLeftRadius:5,
  borderTopRightRadius:5,
  marginTop:60
},
versionDialog:{
 position: 'absolute',
 backgroundColor:'rgba(0,0,0,.4)',
 zIndex:1,
 flexDirection:'column',
 alignItems:'center',
 flex:1,
 alignSelf:'center',
 borderRadius: 10, 
 paddingTop:100
},
iconView:{
 width:widths-40,
  flexDirection:'column',
  alignItems:'center',
//    backgroundColor:'#fff',
 height:(widths-40)*441/591,
//    borderColor:'#ff0',
//    borderBottomWidth:1,
 paddingTop:(widths-40)*441*0.42/591,
//  paddingBottom:100,
//    borderRadius:5,
overflow:'visible',
},
contentView:{
  width:widths-40,
  backgroundColor:'#fff',
  alignSelf:'center',
  // paddingBottom:10,
  paddingTop:10,
  paddingLeft:20,
  paddingRight:20,
  marginTop:-(widths-40)*441*0.25/591
},
title:{
 color:'#2a3d65',
 fontSize:16,
 marginBottom:8
},
contentText:{
 color:'#293f66',
 fontSize:14,
 marginBottom:5
},
btnView:{
flexDirection:'row',
height:50,
backgroundColor:'#e7ebf6',
borderBottomLeftRadius:5,
borderBottomRightRadius:5,
},
btnClick:{
 flex:1,
 flexDirection:'column',
 alignItems:'center',
 justifyContent:'center',
},
btnText:{
 fontSize:16
}
});
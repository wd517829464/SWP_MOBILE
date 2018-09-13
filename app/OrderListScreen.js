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
    TouchableHighlight,
    BackHandler,
    DeviceEventEmitter,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
    NativeModules
} from 'react-native';
const {NimModule} = NativeModules;
import contactList from './ContactList';
import Header from './component/Header';
import OrderItemScreen from './component/OrderItemScreen';
import NetUtil from './util/NetUitl';
import Dialog from './component/dialog';
import Toast, { DURATION } from 'react-native-easy-toast';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
var statusList={'DONE':'已完成','ONGOING':'进行中'};
var dateTypeList={'TODAY':'今天','WEEK':'本周','MONTH':'本月'};
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
export default class OrderListScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            dataSource:ds.cloneWithRows([]),
            isLoading:false,
            isLoadingTail:false,
            loadComplete:false,
            noData:false,
            tabIndex:-1,
            orderStatus:'',
            dateType:'',
            managerIndex:-1,
            entIndex:-1,
            managerList:[],
            entList:[],
            currentItem:{}
        }
    }
    // componentWillReceiveProps(nextProps) {
    //     // alert(nextProps.need_info);
    //     console.log(nextProps.refresh);
    //     if (nextProps.refresh=='order') {
    //       //跳转到完善资料页
    //       this.orderStatus='';
    //       this.dateType='';
    //       this.entId='';
    //       this.manager='';
    //       this.setState({
    //         orderStatus:'',
    //         dateType:'',
    //         managerIndex:-1,
    //         entIndex:-1,
    //       })
    //     this.onRefresh();
    //     }
    //   }  
    componentWillMount(){
        this.orderStatus='';
        this.dateType='';
        this.startDate='';
        this.endDate='';
        this.activityId='';
        this.entId='';
        this.manager='';
      this.onRefresh();
      this.getManagerList();
      this.getEntList();
   }
   componentDidMount() {
    this.overListener=DeviceEventEmitter.addListener('overSuccess',(text)=>{
        if(text){
            this._messages[text]['busiStatus']='已完成';
            this.setState({
                dataSource:ds.cloneWithRows(this._messages)
            })
            this.refs.toast.show('完结成功');
        }
      });
      this.commentListener=DeviceEventEmitter.addListener('commentSuccess',(text)=>{
        if(text){
            this._messages[text]['evaluated']=true;
            this.setState({
                dataSource:ds.cloneWithRows(this._messages)
            })
        }
      });
      this.tabChangeListener=DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
        if(text=="order"){
            this.setState({
                orderStatus:'',
                dateType:'',
                managerIndex:-1,
                entIndex:-1,
            })
            this.orderStatus='';
            this.dateType='';
            this.entId='';
            this.manager='';
            this.onRefresh();
        }
      });
  }
  componentWillUnmount(){
    this.overListener.remove();
    this.commentListener.remove();
    this.tabChangeListener.remove();
}
  getManagerList(){
      NetUtil.ajax({
          url:'/entOrders/listInquiryPerson.htm',
          data:{
              ticketId:this.props.ticketId
          },
          success:(result)=>{
              if(result.status==1){
                  this.managerList=result.data;
                this.setState({
                    managerList:result.data
                  })
              }
          }
      })
  }
  getEntList(){
      NetUtil.ajax({
          url:'/entOrders/listReleaseEnt.htm',
          data:{
              ticketId:this.props.ticketId
          },
          success:(result)=>{
              if(result.status==1){
                  this.entList=result.data;
                this.setState({
                    entList:result.data
                  })
              }
          }
      })
  }
   async loadData(){
    if(this.state.loadComplete){
      this.setState({
          isLoadingTail: false,
          isLoading:false,
      });
      return;
  }
    var param={
      pageIndex:this.pageIndex,
      pageSize:this.pageSize,
      orderStatus:this.orderStatus,
      dateType: this.dateType,
      startDateTime:this.startDate,
      endDateTime:this.endDate,
      activityId:this.activityId,
      ticketId:this.props.ticketId,
      inquiryPersonId:this.manager,
      releaseEntId:this.entId
  }
    NetUtil.ajax({
      url:'/entOrders/listOrderByInquiryEntId.htm',
      data:param,
      success:(responseJson)=>{
        console.log(responseJson);
        var responseData = responseJson;
        var noData=this._messages.length==0&&(!responseData.data.orderList||responseData.data.orderList.length==0);
        if (responseData) {
             this.setState ({
                noData:noData,
                dataSource: responseData.data.orderList?this.getDataSource(responseData.data.orderList):ds,
                isLoading:false,
                isLoadingTail:false,
            });
        }else{
             this.setState ({
                noData:noData,
                dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
                isLoading:false,
                isLoadingTail:false,
            });
        }
    },
    error:(error)=>{
        this.setState ({
                noData:[],
                dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
                isLoading:false,
                isLoadingTail:false,
            });
    }
    });
}
 
  onRefresh(){
    this.pageIndex=1;
    this.pageSize=5;
    this._messages = [];
    this.setState({
        noData:false,
        dataSource:ds.cloneWithRows([]),
    });
    this.loadData();
  }
  search(){
    this.pageIndex=1;
    this.setState({
        noData:false,
        dataSource:ds.cloneWithRows([])
    });
    this._messages = [];
    this.loadData();
  }
  getDataSource(messages){
    if(messages.length<this.state.pageSize){
        this.refs.toast.show('数据加载完成');
    }
    if(!this.state.dataSource||this.pageIndex==1){
      this.state.dataSource=new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this._messages = [].concat(messages);
    }else{
      this._messages =this._messages.concat(messages);
    }
    return this.state.dataSource.cloneWithRows(this._messages);
  }
  _onEndReached() {
    if (!this.state||this.state.isLoadingTail) {
        return;
    }
    this.setState({
        isLoadingTail: true
    });
    this.pageIndex++;
    this.loadData();
  }
    changeTab(index){
        if(index==this.state.tabIndex){
        this.setState({
            tabIndex:-1
        })
        }else{
        this.setState({
            tabIndex:index
        })
        }
    }
    queryStatus(orderStatus){
        this.orderStatus=orderStatus;
        this.setState({
            orderStatus:orderStatus,
            tabIndex:-1
        })
        this.search();
      }
      queryDateType(dateType){
        this.dateType=dateType;
        this.setState({
            dateType:dateType,
            tabIndex:-1
        });
        this.search();
      }
      queryManager(managerIndex){
        if(managerIndex==-1){
            this.manager='';
        }else{
            this.manager=this.managerList[managerIndex]['userId'];
        }
        this.setState({
            managerIndex:managerIndex,
            tabIndex:-1
        })
        this.search();
      }
      queryEntId(entIndex){
          if(entIndex==-1){
            this.entId='';
          }else{
              this.entId=this.entList[entIndex]['id']
          }
        this.setState({
            entIndex:entIndex,
            tabIndex:-1
        })
        this.search();
      }
    render() {
        // {true?<Text style={styles.nodata}>数据加载完成</Text>:null}
        let shaixuan=<View></View>;
        if(this.state.tabIndex==1){
            shaixuan=<View style={styles.statusView}>
            <View style={[styles.itemView,this.state.orderStatus==''?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('')}>
                    <Text  style={[styles.statusText,this.state.orderStatus==''?{color:'#2676ff'}:{}]}>全部</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.orderStatus=='DONE'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('DONE')}>
                    <Text  style={[styles.statusText,this.state.orderStatus=='DONE'?{color:'#2676ff'}:{}]}>已完成</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.orderStatus=='ONGOING'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('ONGOING')}>
                    <Text  style={[styles.statusText,this.state.orderStatus=='ONGOING'?{color:'#2676ff'}:{}]}>进行中</Text>
                </TouchableOpacity>
            </View>
        </View>
        }else if(this.state.tabIndex==2){
            shaixuan=<View style={styles.statusView}>
            <View style={[styles.itemView,this.state.dateType==''?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryDateType('')}>
                    <Text  style={[styles.statusText,this.state.dateType==''?{color:'#2676ff'}:{}]}>全部</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.dateType=='TODAY'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryDateType('TODAY')}>
                    <Text  style={[styles.statusText,this.state.dateType=='TODAY'?{color:'#2676ff'}:{}]}>今天</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.dateType=='WEEK'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryDateType('WEEK')}>
                    <Text  style={[styles.statusText,this.state.dateType=='WEEK'?{color:'#2676ff'}:{}]}>本周</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.dateType=='MONTH'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryDateType('MONTH')}>
                    <Text  style={[styles.statusText,this.state.dateType=='MONTH'?{color:'#2676ff'}:{}]}>本月</Text>
                </TouchableOpacity>
            </View>
        </View>
        }else if(this.state.tabIndex==3){
            var arr=[];
            arr.push(
                <View style={[styles.itemView,this.state.managerIndex==-1?{borderColor:'#2676ff'}:{}]} key={-1}>
                    <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryManager(-1)}>
                        <Text  style={[styles.statusText,this.state.managerIndex==-1?{color:'#2676ff'}:{}]}>全部</Text>
                    </TouchableOpacity>
                </View>
            );
            for(var j in this.state.managerList){
                var obj=this.state.managerList[j];
                arr.push(
                    <View style={[styles.itemView,this.state.managerIndex==j?{borderColor:'#2676ff'}:{}]} key={j}>
                        <TouchableOpacity style={styles.statusTouch} onPress={this.queryManager.bind(this,j)}>
                            <Text  style={[styles.statusText,this.state.managerIndex==j?{color:'#2676ff'}:{}]}>{obj['chineseName']}</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            shaixuan=<View style={styles.statusView}>{arr}</View>;
        }else if(this.state.tabIndex==4){
            var arr=[];
            arr.push(
                <View style={[styles.itemView,this.state.entIndex==-1?{borderColor:'#2676ff'}:{}]} key={-1}>
                    <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryEntId(-1)}>
                        <Text  style={[styles.statusText,this.state.entIndex==-1?{color:'#2676ff'}:{}]}>全部</Text>
                    </TouchableOpacity>
                </View>
            );
            for(var i in this.state.entList){
                var obj=this.state.entList[i];
                arr.push(
                    <View style={[styles.itemView,this.state.entIndex==i?{borderColor:'#2676ff'}:{}]} key={i}>
                        <TouchableOpacity style={styles.statusTouch} onPress={this.queryEntId.bind(this,i)}>
                            <Text  style={[styles.statusText,this.state.entIndex==i?{color:'#2676ff'}:{}]}>{obj['enterName']}</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            shaixuan=<View style={[styles.statusView]}>{arr}</View>;
        }
        return (
            <View style={{flex:1}}>
                <Header navigator={this.props.navigator} ticketId={this.props.ticketId} title="我的订单"/>
                <View style={styles.tabSelect}>
                    <View style={[styles.tab,styles.tab_left]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==1?2:0}]} onPress={this.changeTab.bind(this,1)}>
                            <Text style={[styles.tab_text,this.state.tabIndex==1?{color:'#2676ff'}:{}]}>{statusList[this.state.orderStatus]?statusList[this.state.orderStatus]:'状态'}</Text>
                            {this.state.tabIndex==1?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.tab,styles.tab_left]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==2?2:0}]} onPress={this.changeTab.bind(this,2)}>
                            <Text style={[styles.tab_text,this.state.tabIndex==2?{color:'#2676ff'}:{}]}>{dateTypeList[this.state.dateType]?dateTypeList[this.state.dateType]:'时间'}</Text>
                            {this.state.tabIndex==2?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.tab,styles.tab_left]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==3?2:0}]} onPress={this.changeTab.bind(this,3)}>
                            <Text style={[styles.tab_text,this.state.tabIndex==3?{color:'#2676ff'}:{}]}>{this.state.managerIndex<0?'负责人':this.state.managerList[this.state.managerIndex]['chineseName']}</Text>
                            {this.state.tabIndex==3?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.tab,styles.tab_left]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==4?2:0}]} onPress={this.changeTab.bind(this,4)}>
                            <Text style={[styles.tab_text,this.state.tabIndex==4?{color:'#2676ff'}:{}]}>{this.state.entIndex<0?'企业':this.state.entList[this.state.entIndex]['enterName']}</Text>
                            {this.state.tabIndex==4?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                </View>
                {shaixuan}
                {this.state.noData?<Text style={styles.nodata}>暂无相关信息</Text>:null}
                <ListView
                dataSource={this.state.dataSource}
                enableEmptySections={true}
                refreshControl={  
                    <RefreshControl  
                    onRefresh={this.onRefresh.bind(this)}  
                    refreshing={this.state.isLoading}  
                    colors={['#ff0000', '#00ff00', '#0000ff']}  
                    enabled={true}  
                    />  
                }  
                  renderRow={(rowData,sectionID,rowID) => 
                  <OrderItemScreen rowData={rowData} rowID={rowID} callbackParent={(text)=>{this.onChildChanged(text)}} sectionID={sectionID} ticketId={this.props.ticketId} navigator={this.props.navigator}></OrderItemScreen>
                }
                onEndReachedThreshold={10}
                onEndReached={this._onEndReached.bind(this)}
            />
            {(this.state.isLoadingTail)?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
            <Toast ref="toast"/>
            </View>
        );
    }
    onChildChanged(text){
        this.setState({
            currentItem:text
          })
        this.checkContacts(text);
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
    statusView:{
        position:'absolute',
        top:90,
        zIndex:10,
        backgroundColor:'#fff',
    },
    itemView:{
        backgroundColor:'#f0f3fa',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:(Dimensions.get('window').width-30),
        height:30,
        marginLeft:15,
        marginTop:5,
        marginBottom:10,
        paddingLeft:2,
        paddingRight:2,
        borderRadius:4,
        borderWidth:1,
        borderColor:'#f0f3fa'
    },
    statusTouch:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:30,
    },
    statusText:{
        color:'#293f66',
        fontSize:12
    },
    tabSelect:{
        flexDirection: 'row',
        alignItems:'center',
        borderColor:'#e6ebf5',
        borderBottomWidth:1
    },
    tab:{
        flex:1,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'center',
        height:40
    },
    touchableArea:{
        flex:1,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'center',
        height:40,
        borderColor:'#2676ff',
        paddingLeft:5,
        paddingRight:5,
        backgroundColor:'#fff'
    },
    tab_text:{
        color:'#6b7c99',
        fontWeight:'bold',
        marginRight:4
    },
    tab_left:{
        borderColor:'#e6ebf5',
        borderRightWidth:1
    },
    loadImage:{
        alignSelf:'center',
        marginBottom:10,
        marginTop:10
    },
    nodata:{
        color:'#6b7c98',
        marginBottom:10,
        marginTop:10,
        alignSelf:'center',
    }
    
});
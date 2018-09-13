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
    TouchableOpacity
} from 'react-native';
import {NativeModules} from 'react-native';
import Header from './component/Header';
import InquiryItemScreen from './component/InquiryItemScreen';
import NetUtil from './util/NetUitl';
import Dialog from './component/dialog';
const {NimModule} = NativeModules;
import contactList from './ContactList';
import Toast, { DURATION } from 'react-native-easy-toast';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var statusList={'ACCEPT':'已成交','SUBMIT':'待确认','REFUSED':'已谢绝'};
var dateTypeList={'TODAY':'今天','WEEK':'本周','MONTH':'本月'};
export default class InquiryListScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            dataSource:ds.cloneWithRows([]),
            isLoading:false,
            isLoadingTail:false,
            loadComplete:false,
            noData:false,
            inquiryStatus:'',
            dateType:'',
            tabIndex:-1,
            currentItem:{}
        }
    }
    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.refresh=='inquiry'&&!this.refresh) {
    //         this.refresh=nextProps.refresh;
    //       //跳转到完善资料页
    //       this.inquiryStatus='';
    //       this.dateType='';
    //       this.setState({
    //         inquiryStatus:'',
    //         dateType:'',
    //       })
    //       this.onRefresh();
    //     }
    //   }  
    componentWillMount(){
        this.inquiryStatus='';
        this.dateType='';
        this.startDate='';
        this.endDate='';
        this.activityId='';
      this.onRefresh();
   }
   componentDidMount() {
    this.cancelListener=DeviceEventEmitter.addListener('cancelSuccess',(text)=>{
        if(text){
            this._messages.splice(text,1);
            this.setState({
                dataSource:ds.cloneWithRows(this._messages)
            })
            this.refs.toast.show('撤消成功');
        }
      });
      this.tabChangeListener=DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
        if(text=="inquiry"){
            this.setState({
                inquiryStatus:'',
                dateType:'',
            })
            this.inquiryStatus='';
            this.dateType='';
            this.onRefresh();
        }
      });
  }
    componentWillUnmount(){
        this.cancelListener.remove();
        this.tabChangeListener.remove();
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
      inquiryStatus:this.inquiryStatus,
      dateType: this.dateType,
      startDateTime:this.startDate,
      endDateTime:this.endDate,
      activityId:this.activityId,
      ticketId:this.props.ticketId
  }
    NetUtil.ajax({
      url:'/entInquiry/listEntInquiry.htm',
      data:param,
      success:(responseJson)=>{
        console.log(responseJson);
        var responseData = responseJson;
        var noData=this._messages.length==0&&(!responseData.data.inquiryList||responseData.data.inquiryList.length==0);
        if (responseData) {
             this.setState ({
                noData:noData,
                dataSource: responseData.data.inquiryList?this.getDataSource(responseData.data.inquiryList):ds,
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
        dataSource:ds.cloneWithRows([])
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
        this.setState({loadComplete:true,isLoadingTail:false});
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
  queryStatus(inquiryStatus){
    this.inquiryStatus=inquiryStatus;
    this.setState({
        inquiryStatus:inquiryStatus,
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
 
    render() {
        // {true?<Text style={styles.nodata}>数据加载完成</Text>:null}
        let shaixuan=<View></View>;
        if(this.state.tabIndex==1){
            shaixuan=<View style={styles.statusView}>
            <View style={[styles.itemView,this.state.inquiryStatus==''?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('')}>
                    <Text  style={[styles.statusText,this.state.inquiryStatus==''?{color:'#2676ff'}:{}]}>全部</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.inquiryStatus=='SUBMIT'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('SUBMIT')}>
                    <Text  style={[styles.statusText,this.state.inquiryStatus=='SUBMIT'?{color:'#2676ff'}:{}]}>待确认</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.inquiryStatus=='ACCEPT'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('ACCEPT')}>
                    <Text  style={[styles.statusText,this.state.inquiryStatus=='ACCEPT'?{color:'#2676ff'}:{}]}>已成交</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.itemView,this.state.inquiryStatus=='REFUSED'?{borderColor:'#2676ff'}:{}]}>
                <TouchableOpacity style={styles.statusTouch} onPress={()=>this.queryStatus('REFUSED')}>
                    <Text  style={[styles.statusText,this.state.inquiryStatus=='REFUSED'?{color:'#2676ff'}:{}]}>已谢绝</Text>
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
        }
        return (
            <View style={{flex:1}}>
                <Header navigator={this.props.navigator} ticketId={this.props.ticketId} title="报价单"/>
                <View style={styles.tabSelect}>
                    <View style={[styles.tab,styles.tab_left]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==1?2:0}]} onPress={this.changeTab.bind(this,1)}>
                            <Text style={[styles.tab_text,this.state.tabIndex==1?{color:'#2676ff'}:{}]}>{statusList[this.state.inquiryStatus]?statusList[this.state.inquiryStatus]:'报价单状态'}</Text>
                            {this.state.tabIndex==1?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.tab,styles.tab_left]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==2?2:0}]} onPress={this.changeTab.bind(this,2)}>
                            <Text style={[styles.tab_text,this.state.tabIndex==2?{color:'#2676ff'}:{}]}>{dateTypeList[this.state.dateType]?dateTypeList[this.state.dateType]:'报价时间'}</Text>
                            {this.state.tabIndex==2?
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
                  <InquiryItemScreen rowData={rowData} rowID={rowID} sectionID={sectionID} callbackParent={(text)=>{this.onChildChanged(text)}} ticketId={this.props.ticketId} navigator={this.props.navigator}></InquiryItemScreen>
                }
                onEndReachedThreshold={10}
                onEndReached={this._onEndReached.bind(this)}
            />
            {(this.state.isLoadingTail&&!this.state.loadComplete)?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
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
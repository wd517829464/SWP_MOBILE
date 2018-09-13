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
import NetUtil from './util/NetUitl';
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
import Toast, { DURATION } from 'react-native-easy-toast';
var downTextWidth=widths-90;
const {NimModule} = NativeModules;
import OfflineMessageView from './OfflineMessageView';
import contactList from './ContactList';
import SelectCZItem from './component/SelectCZItem';
import CFInquiryScreen from './CFInquiryScreen';

const TYPE_OPTIONS = [];
const dispositionTypes=[];
const buyWasteResourcePageData={};
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    

export default class CZSelectScreen extends Component {
    constructor(props) {
  super(props);
  this.state = {
    list:[],
    dataSource:ds.cloneWithRows([]),
    favorited:this.props.headData.favorited,
    ticketId:'',
    choosed:false,
    entType:'',
    customerId:''
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
    this.loadData();
}
    componentDidMount(){
        var st = this;
        BackHandler.addEventListener('hardwareBackPressBuy', this.backKeyPressed);
        this.msgListener = DeviceEventEmitter.addListener('wasteSelect',(customerId) => {
            this.setState({
                customerId:customerId
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

    back(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
    async loadData(){
        NetUtil.ajax({
            url:'/facilitatorCustomer/listFacilitatorCustomer.htm',
            data:{
                ticketId:this.props.ticketId,
                pageIndex:1,
                pageSize:100
            },
            success:(result)=>{
                if(result.status==1&&result.data.customerList&&result.data.customerList.length>0) {
                    this.setState({
                        list:result.data.customerList,
                        dataSource:ds.cloneWithRows(result.data.customerList),
                    })
                }
            },
            error:(error)=>{
                
            }
        });

    }
    render() {
        // <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"选择产废资源"}/>
        // {this.state.loading?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
        // <SelectCFItem navigator={this.props.navigator} callbackParent={(text)=>{this.onChildChanged(text)}} rowData={rowData} sectionID={sectionID} rowID={rowID} ticketId={this.state.ticketId}/>
        return (
            <View style={{flex:1,paddingBottom:70}}>
            <View style={styles.container}>
                <View style={styles.headBar}>
                    <View style={styles.back_view}><TouchableOpacity onPress={this.back.bind(this)}><Image style={[styles.back_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/header/nav_icon_back.png')} /></TouchableOpacity></View>
                    <View style={styles.middleView}>
                        <Text style={styles.middleText}>选择经营单位</Text>
                    </View>
                    <View></View>
                </View>
            </View>  
            <ListView
                dataSource={this.state.dataSource}
                enableEmptySections={true}
                renderRow={(rowData,sectionID,rowID) => 
                    <SelectCZItem navigator={this.props.navigator} callbackParent={(text)=>{this.onChildChanged(text)}} rowData={rowData} sectionID={sectionID} rowID={rowID} ticketId={this.state.ticketId}/>
                }
            />  
            {this.state.customerId?
                <View style={[styles.call_price_view,{backgroundColor:'#2676ff'}]}>
                    <TouchableOpacity style={styles.btn_touch} onPress={this.buy.bind(this)}>
                        <Text style={styles.call_price_text}>确认报价</Text>
                    </TouchableOpacity>
                </View>:
                <View style={[styles.call_price_view,{backgroundColor:'#cad5e6'}]}>
                    <Text style={styles.call_price_text}>确认报价</Text>
                 </View>
            }
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
        if(!this.state.customerId){
            return;
        }
        const { navigator } = this.props;
        navigator.push({
           name: 'CFInquiryScreen',
           component: CFInquiryScreen,
           params: {
               navigator:navigator,
               ticketId:this.props.ticketId,
               choosedList:this.props.choosedList,
               headData:this.props.headData,
               customerId:this.state.customerId,
               inquiryEntId:this.entId
           }
       });
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
        borderBottomWidth:0.5,
        borderBottomColor:'lightgrey',
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
        fontSize:13,
        color:'#293f66',
        textAlign:'left',
        flex:5
    },
    cellText_time:{
        color:'#8c9fbe',
        fontSize:11,
        textAlign:'right',
        flex:2
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
        position:'absolute',
        bottom:0,
        width:widths,
        // flex: 6.7,
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
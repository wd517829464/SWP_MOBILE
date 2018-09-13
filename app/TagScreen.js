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
import TagItem from './component/TagItem';
import AddTagScreen from './AddTagScreen';
import NetUitl from './util/NetUitl';
import BaseScreen from './base';
import Constants from './util/Constants';
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
import Toast, { DURATION } from 'react-native-easy-toast';
import { SwipeListView } from 'react-native-swipe-list-view';
import MessageCount from './component/MessageCount';
var downTextWidth=widths-90;

const TYPE_OPTIONS = [];
const dispositionTypes=[];
const buyWasteResourcePageData={};
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
var TAGSTATUS={'TAGGING':'自由标记','SAMPLING':'取样中','SAMPLED':'已取样','DELIVERED_LAB':'已送实验室','QUALIFIED':'合格','UNQUALIFIED':'不合格','DRAFTCONTRACT':'合同已拟定','SIGNCONTRACT':'合同已签定','DELIVERYCONTRACT':'合同已寄出'};
export default class TagScreen extends Component {
    constructor(props) {
  super(props);
  this.state = {
    dataSource:ds,
    nodata:false,
    ticketId:''
  };
    this.backKeyPressed = this.backKeyPressed.bind(this);
}
componentDidMount(){
    var _this=this;
    this.addTaglistener=DeviceEventEmitter.addListener('addTagSuccess',(text)=>{
        _this.refs.toast.show('添加标记成功'); 
        _this.loadData();
    });
    BackHandler.addEventListener('hardwareBackPressBuy', this.backKeyPressed);
}
componentWillMount(){
    storage.load({
        key: 'loginState',
    }).then(ret => {
        this.ticketId=ret['ticketId']
        this.setState({
            ticketId:this.ticketId
        });
        this.loadData();
    }).catch(err => {
        // alert('当前登录用户凭证已超时，请重新登录。');
    })
}
componentWillUnmount(){
    this.addTaglistener.remove();
    BackHandler.removeEventListener('hardwareBackPressBuy',this.backKeyPressed);
};
loadData(){
    NetUitl.ajax({
        url:'/discussTag/listDiscussTag.htm',
        data:{
            releaseId:this.props.releaseId,
            ticketId:this.ticketId
        },
        success:(responseJson)=>{
            var responseData = responseJson;
            if (responseData.status==1) {
                this.list=responseData.data;
                 this.setState ({
                    nodata:this.list.length==0,
                    dataSource: ds.cloneWithRows(this.list),
                });
            }
        }
    });

}
    backKeyPressed(){
        this.back();
        return true;
    }
    back(){
        var busiStatus='';
        if(this.list.length>0){
            busiStatus=this.list[0]['busiStatus'];
        }
        var tagInfo=this.props.tagInfo;
        if(!tagInfo){
            tagInfo={'count':0,tagStatus:''};
        }
        tagInfo.tagStatus=TAGSTATUS[busiStatus];
        tagInfo.count=this.list.length;
        tagInfo.releaseId=this.props.releaseId;
        DeviceEventEmitter.emit('tagChange',tagInfo);
       const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
   }

    render() {
        // <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"标记"}/>
        return (
            <View style={{flex:1,paddingBottom:60}}>
                <View style={styles.container}>
                    <View style={styles.headBar}>
                        <View style={styles.back_view}><TouchableOpacity onPress={this.back.bind(this)}><Image style={[styles.back_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/header/nav_icon_back.png')} /></TouchableOpacity></View>
                        <View style={styles.middleView}>
                            <Text style={styles.middleText}>标记</Text>
                        </View>
                        <MessageCount navigator={this.props.navigator} ticketId={this.state.ticketId}/>
                    </View>
                </View>  
                {
                    this.state.nodata?<Text style={{color:'#2b3e66',alignSelf:'center',marginTop:50}}>暂无相关数据</Text>:
                <SwipeListView style={{flex:1}}
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={(rowData,sectionID,rowID) => 
                        <TagItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} ticketId={this.state.ticketId}/>
                    }
                    renderHiddenRow={(data, secId, rowId, rowMap) => (
                        <View style={styles.rowBack}>
                            <TouchableOpacity style={[styles.backRightBtn]} onPress={_ => { rowMap[`${secId}${rowId}`].closeRow(); this.del(rowId); }}>
                                <Image style={{width:40,height:40}} resizeMode={Image.resizeMode.contain} source={require('../images/home/common_icon_delete.png')} />
                            </TouchableOpacity>
                        </View>
                    )}
                    disableRightSwipe={true}
                    recalculateHiddenLayout={true}
                    swipeToOpenPercent={20}
                    rightOpenValue={-110}
                />  
            }
                <View style={styles.btn_view}>
                    <TouchableOpacity style={styles.btn_touch} onPress={this.addTag.bind(this)}>
                        <Text style={[styles.chat_title,{color:'#fff',fontSize:20,marginRight:5}]}>+</Text><Text style={styles.chat_title}>添加标记</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref="toast"/>
             </View>
        );
    }
   addTag(){
         const { navigator } = this.props;
         navigator.push({
            name: 'AddTagScreen',
            component: AddTagScreen,
            params: {
                navigator:navigator,
                ticketId:this.state.ticketId,
                releaseId:this.props.releaseId,
                tagInfo:this.props.tagInfo
            }
        });
    }
    del(rowID){
        NetUitl.ajax({
            url:'/discussTag/deleteDiscussTag',
            data:{
                id:this.list[rowID]['id'],
                ticketId:this.state.ticketId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if (responseData.status&&responseData.data) {
                    this.refs.toast.show('删除标记成功'); 
                    this.loadData();
                    // this.list.splice(rowID,1);
                    //  this.setState ({
                    //     dataSource: ds.cloneWithRows(this.list),
                    // });
                }
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
    chat_title: {
        color: '#fff',
        fontSize:16,
    },
    btn_touch: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'#2676ff',
        height:60,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#fff',
        flex: 1,
        height:90,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        // marginBottom:16,
        marginTop:0,
        paddingTop:0,
        position:'relative',
        // zIndex:10
        // right:0
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top:0,
        width: 75,
        right: 0,
        backgroundColor: '#e8ebf2',
    },
});
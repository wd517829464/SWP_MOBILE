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
    ScrollView,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';

import InquiryItem from './InquiryItem'
import Constants from '../util/Constants';
var Dimensions = require('Dimensions');
import NetUtil from '../util/NetUitl';
import EvaluateScreen from './EvaluateScreen';
import TagScreen from '../TagScreen';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class OrderItemScreen extends Component {
    constructor(props) {
    super(props);
    this.state = {
        dataSource: ds.cloneWithRows([]),
        busiStatus:this.props.rowData.busiStatus,
        evaluated:this.props.rowData.evaluated,
        tagInfo:this.props.rowData.tagInfo
    };
}
    componentWillMount(){
    }
    componentDidMount() {
        this.commentListener=DeviceEventEmitter.addListener('commentSuccess',(text)=>{
            if(text==this.props.rowID){
                this.setState({
                    evaluated:true
                })
            }
          });
        this.tagListener=DeviceEventEmitter.addListener('tagChange',(text)=>{
            if(text.releaseId==this.props.rowData.releaseId){
                this.setState({
                    tagInfo:text
                })
            }
        });
      }
      componentWillUnmount(){
        this.tagListener.remove();
        this.commentListener.remove();
    }
    goInquiry(){
        var _this = this;
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'CFSelectScreen',
                component:CFSelectScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    headData:this.props.rowData
                }
            })
        }
    }
    contact(){
        var {rowData,rowID}=this.props;
        rowData['index']=rowID;
        rowData['action']='contact';
        this.props.callbackParent(rowData);
    }
    render() {
        var widths = Dimensions.get('window').width;
        const {rowData,sectionID,rowID}=this.props;
         var itemReleaseList=this.props.rowData.orderDetail;
         let cfList=(<View></View>);
         if(itemReleaseList&&itemReleaseList.length>0){
            var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
            var dataSource=ds.cloneWithRows(itemReleaseList);
            cfList=( <ScrollView><ListView
                    horizontal={true} 
                    dataSource={dataSource}
                    renderRow={(rowData,sectionID,rowID) => 
                         <InquiryItem navigator={this.props.navigator}  rowData={rowData} rowID={rowID} sectionID={sectionID}
                          ticketId={this.props.ticketId} headData={this.props.rowData}/>
                         }
                    /></ScrollView>);
         }
        let head=require('../../images/home/commom_icon_logo.png');
        if(rowData.fileId){
            head={uri:Constants.IMG_SERVICE_URL+'&fileID='+rowData.fileId};
        }
        var statusClass={'已完成':styles['ACCEPT'],'进行中':styles['SUBMIT']};
        return (
            <View style={styles.listBox} key={this.props.sectionID}>
                <View style={styles.cellBox}>
                    <View style={styles.cellBox_first}>
                        <Image style={[styles.cellText_icon]} resizeMode={Image.resizeMode.contain} source={head} />
                        <Text style={[styles.cellText_Ent]}>{rowData.releaseEntName}</Text> 
                        <Text style={[styles.cellText_time]}>{rowData.orderDate&&rowData.orderDate.substring(0,10)}</Text>
                        <Text style={[styles.status,statusClass[this.state.busiStatus]]}>{this.state.busiStatus}</Text>
                    </View>
                    <View style={{flexDirection:'row'}}>
                        {cfList}
                    </View>
                    {rowData.disEntName?
                    <View style={{flexDirection:'row',borderStyle:'dotted',borderColor:'#eeeefa',borderTopWidth:1,padding:10}}>
                        <Text style={{color:'#6b7c98'}}>处置企业：</Text>
                        <Text style={{color:'#293f66'}}>{rowData.disEntName}</Text>
                    </View>
                    :null}
                    {rowData.inquiryRemark?
                        <View style={styles.infoView}>
                        <Text style={styles.remark}>备注：{rowData.inquiryRemark}</Text>
                    </View>:null}
                    <View style={[styles.total,this.state.busiStatus=='待确认'?{}:{borderBottomWidth:0}]}>
                        <View style={{flexDirection:'row',paddingLeft:10}}>
                            <Text style={{color:'#6b7c98'}}>数量：</Text><Text style={{color:'#293e69',fontWeight:'bold'}}>{rowData.totalAmount}</Text>
                        </View>
                        <Text style={{alignSelf:'center',color:'#e6efff'}}>|</Text>
                        <View style={{flexDirection:'row',paddingRight:10}}>
                            <Text style={{color:'#6b7c98'}}>总额：</Text><Text style={{color:'#fe3f5e',fontWeight:'bold'}}>￥{rowData.totalPrice}</Text>
                        </View>
                    </View>
                    {!this.props.noButton?
                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <Text></Text>
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <TouchableOpacity onPress={this.contact.bind(this)}>
                                    <View style={{flexDirection:'row',marginRight:20,justifyContent:'center',alignItems:'center',alignSelf:'center'}}>
                                        <Image style={[{width:18,height:18,marginRight:4}]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/contact.png')} />
                                        <Text style={{color:'#1171d1',fontSize:14}}>联系TA</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.goTag.bind(this)}>
                                    <View style={{flexDirection:'row',alignItems:'center',marginRight:10}}>
                                        <Image style={[styles.cellText_icon1]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/sign.png')} />
                                        <Text style={{color:'#6b7c98'}}>{this.state.tagInfo&&this.state.tagInfo.tagStatus?this.state.tagInfo.tagStatus:'标记'}</Text>
                                        <Text style={{color:'#6b7c98'}}>({this.state.tagInfo?this.state.tagInfo.count:0})</Text>
                                        <Text style={{color:'#bac5d9',fontSize:26,marginLeft:3,position:'relative',top:-2}}>›</Text>
                                    </View>
                                </TouchableOpacity>
                                {this.state.busiStatus=='进行中'?
                                <TouchableOpacity style={styles.cancelBtn} onPress={()=>{this.over()}}>
                                    <Text style={{color:'#196eff',alignSelf:'center'}}>完  结</Text>
                                </TouchableOpacity>:null}
                                {this.state.busiStatus=='已完成'&&this.state.evaluated?
                                    <TouchableOpacity style={[styles.cancelBtn,{borderColor:'#6b7c98'}]}  onPress={()=>{this.evaluate()}}>
                                        <Text style={{color:'#6b7c98',alignSelf:'center'}}>查看评价</Text>
                                    </TouchableOpacity>
                                :null}
                        </View></View>:null
                }
                </View>
                <View style={styles.splitLine} width={widths}></View>
            </View>
        );
    }
    goTag(){
        var _this = this;
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'TagScreen',
                component:TagScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    releaseId:this.props.rowData.releaseId,
                    tagInfo:this.state.tagInfo
                }
            })
        }
    }
    over(){
        Alert.alert('提示', '此操作将完结该订单, 是否确定?', [
            { text: '取消', style: 'cancel' },
            { text: '确定', onPress: () => this.confirm() }
        ])
    }
    confirm(){
        const {rowData}=this.props;
        NetUtil.ajax({
            url:'/entOrders/closeOrder.htm',
            data:{
                orderId:rowData.id,
                releaseEntId:rowData.releaseEntId,
                ticketId:this.props.ticketId
            },
            success:(result)=>{
                if(result.status==1&&result.data==true){
                    this.setState({
                        busiStatus:'已完成'
                    })
                    DeviceEventEmitter.emit('overSuccess',this.props.rowID);
                }
            }
        });
    }
    evaluate(){
        var _this = this;
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'EvaluateScreen',
                component:EvaluateScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    rowData:this.props.rowData,
                    rowID:this.props.rowID
                }
            })
        }
    }
}
const styles = StyleSheet.create({
    listBox:{
        flexDirection:'column',
        backgroundColor:'#fff'
    },
    cellBox:{
        flexDirection:'column',
    },
    cellBox_first:{
        flexDirection:'row',
        justifyContent: 'center',
        borderBottomWidth:0.5,
        borderBottomColor:'lightgrey',
        height:40,
        // paddingBottom:5,
        paddingLeft:15,
        paddingRight:15,
        alignItems:'center'
    },
    cellText_icon:{
        width:19,
        height:19,
        // flex:0.5,
        marginRight:10,
        borderRadius:9.5
    },
    cellText_icon1:{
        width:18,
        height:18,
        marginRight:5,
        position:'relative',
        top:1
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
        flex:1
    },
    cellText_time:{
        color:'#8c9fbe',
        fontSize:11,
        textAlign:'right',
        // flex:2
    },
    status:{
        fontSize: 13,
        borderWidth:1,
        borderColor:'#ccc',
        paddingLeft:3,
        paddingRight:3,
        borderRadius:4,
        marginLeft:10,
        height:20,
        lineHeight:19,
        overflow:'hidden'
    },
    ACCEPT:{
        color: '#18caa6',
        borderColor: '#18caa6'
    },
    SUBMIT:{
        color: '#feb300',
        borderColor: '#feb300'
    },
    REFUSED:{
        color: '#97a4b4',
        borderColor: '#97a4b4'
    },
    splitLine:{
        height:12,
        backgroundColor:'#f1f2f7',
        borderBottomWidth:0.5,
        borderBottomColor:'#dcedf7',
        borderTopWidth:0.5,
        borderTopColor:'#e9edf7',
    },
    infoView:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:10,
        marginRight:10,
        borderStyle:'dotted',
        borderColor:'#eeeefa',
        borderTopWidth:1,
        paddingTop:10,
        paddingBottom:10
    },
    remark:{
        color:'#6b7c98'
    },
    total:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderColor:'#dce3f3',
        borderTopWidth:1,
        borderBottomWidth:1,
        paddingTop:12,
        paddingBottom:12
    },
    cancelBtn:{
        borderColor:'#196eff',
        borderWidth:1,
        alignSelf:'flex-end',
        paddingTop:5,
        paddingBottom:5,
        paddingLeft:16,
        paddingRight:16,
        borderRadius:3,
        marginTop:10,
        marginBottom:10,
        marginRight:10
    }
});
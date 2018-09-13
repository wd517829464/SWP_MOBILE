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
import TagScreen from '../TagScreen';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class InquiryItemScreen extends Component {
    constructor(props) {
    super(props);
    this.state = {
        dataSource: ds,
        tagInfo:this.props.rowData.tagInfo
    };
}
    componentWillMount(){
        
    }
    componentDidMount(){
        this.tagListener=DeviceEventEmitter.addListener('tagChange',(text)=>{
            if(text.releaseId==this.props.rowData.releaseId){
                this.setState({
                    tagInfo:text
                })
            }
        });
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
    componentWillUnmount(){
        this.tagListener.remove();
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
         var itemReleaseList=this.props.rowData.inquiryDetail;
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
        var statusClass={'已成交':styles['ACCEPT'],'待确认':styles['SUBMIT'],'已谢绝':styles['REFUSED']};
        // {cfList}
        // <TouchableOpacity onPress={this.onPressEnter.bind(this,rowData.enterId)}></TouchableOpacity>
        // <View style={styles.infoView}>
        //     {rowData.inquiryPersonName?
        //     <View style={{flexDirection:'row',marginRight:20}}>
        //         <Image style={[styles.cellText_icon1]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/personIcon.png')} />
        //         <Text style={{color:'#6b7c98'}}>{rowData.inquiryPersonName}</Text>
        //     </View>:null}
        //     <View style={{flexDirection:'row',marginRight:20}}>
        //         <Image style={[styles.cellText_icon1]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/quiryTypeIcon.png')} />
        //         <Text style={{color:'#6b7c98'}}>{rowData.quotedType==0?'打包报价':'单独报价'}</Text>
        //     </View>
        //     <View style={{flexDirection:'row',marginRight:20}}>
        //         <Image style={[styles.cellText_icon1]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/common_icon_resouce.png')} />
        //         <Text style={{color:'#6b7c98'}}>{rowData.activityName?rowData.activityName:'资源池'}</Text>
        //     </View>
            
        // </View>
        return (
            <View style={styles.listBox} key={this.props.sectionID}>
                <View style={styles.cellBox}>
                    <View style={styles.cellBox_first}>
                        <Image style={[styles.cellText_icon]} resizeMode={Image.resizeMode.contain} source={head} />
                        <Text style={[styles.cellText_Ent]}>{rowData.releaseEnterName}</Text> 
                        <Text style={[styles.cellText_time]}>{rowData.inquiryDate&&rowData.inquiryDate.substring(0,10)}</Text>
                        <Text style={[styles.status,statusClass[rowData.busiStatus]]}>{rowData.busiStatus}</Text>
                    </View>
                    <View style={{flexDirection:'row'}}>
                        {cfList}
                    </View>
                    {rowData.inquiryEnterType=='DIS_FACILITATOR'?
                    <View style={{flexDirection:'row',borderStyle:'dotted',borderColor:'#eeeefa',borderTopWidth:1,padding:10}}>
                        <Text style={{color:'#6b7c98'}}>处置企业：</Text>
                        <Text style={{color:'#293f66'}}>{rowData.inquiryEnterName.split('-')[0]}</Text>
                    </View>
                    :null}
                    {rowData.inquiryRemark?
                        <View style={styles.infoView}>
                        <Text style={styles.remark}>备注：{rowData.inquiryRemark}</Text>
                    </View>:null}
                    <View style={[styles.total,rowData.busiStatus=='待确认'?{}:{borderBottomWidth:0}]}>
                        <View style={{flexDirection:'row',paddingLeft:10}}>
                            <Text style={{color:'#6b7c98'}}>数量：</Text><Text style={{color:'#293e69',fontWeight:'bold'}}>{this.getQualityTextBySelection(rowData.inquiryDetail)}</Text>
                        </View>
                        <Text style={{alignSelf:'center',color:'#e6efff'}}>|</Text>
                        <View style={{flexDirection:'row',paddingRight:10}}>
                            <Text style={{color:'#6b7c98'}}>总额：</Text><Text style={{color:'#fe3f5e',fontWeight:'bold'}}>￥{rowData.totalPriceStr}</Text>
                        </View>
                    </View>
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
                            {rowData.busiStatus=='待确认'?
                            <TouchableOpacity style={styles.cancelBtn} onPress={()=>{this.cancelInquiry()}}>
                                <Text style={{color:'#6b7c98',alignSelf:'center'}}>撤消报价</Text>
                            </TouchableOpacity>:null}
                        </View>
                    </View>
                </View>
                <View style={styles.splitLine} width={widths}></View>
            </View>
        );
    }
    getQualityTextBySelection(arr) {
        var obj = {};
        // var laNumber = new $.LaNumber();
        for(var i in arr) {
            var key = arr[i]['unitValue'];
            var value = parseFloat(arr[i]['amount']);
            if(key=='吨'||key=='千克'||key=='克'){
                switch (key){
                    case '千克':
                        value=value/1000;
                        break;
                    case '克':
                        value=value/1000000;
                        break;
                }
                if(obj['吨']){
                    obj['吨']=obj['吨']+value;
                }else{
                    obj['吨']=value;
                }
            }else{
                if(obj[key]) {
                    obj[key] =obj[key]+value ;
                } else {
                    obj[key] = value;
                }
            }
        }
        var str='';
        for (var prop in obj) {
            str+=obj[prop].toFixed(3)+prop+'，';
        }
        str=str.substring(0,str.length-1);
        return str;
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
    cancelInquiry(){
        Alert.alert('提示', '此操作将撤销该报价, 是否确定?', [
            { text: '取消', style: 'cancel' },
            { text: '确定', onPress: () => this.confirm() }
        ])
    }
    confirm(){
        const {rowData}=this.props;
        NetUtil.ajax({
            url:'/entInquiry/deleteEntInquiry',
            data:{
                inquiryId:rowData.inquiryId,
                releaseId:rowData.releaseId,
                ticketId:this.props.ticketId
            },
            success:(result)=>{
                if(result.status==1&&result.data==true){
                    DeviceEventEmitter.emit('cancelSuccess',this.props.rowID);
                }
            }
        });
    }
}
const styles = StyleSheet.create({
    listBox:{
        paddingBottom:10,
        // paddingTop:10,
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
        fontSize:12,
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
        paddingBottom:10,
        flexWrap:'wrap'
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
        borderColor:'#6b7c98',
        borderWidth:1,
        // alignSelf:'flex-end',
        paddingTop:5,
        paddingBottom:5,
        paddingLeft:12,
        paddingRight:12,
        borderRadius:3,
        marginTop:10,
        marginBottom:10,
        marginRight:10
    }
});
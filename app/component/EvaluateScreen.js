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
    DeviceEventEmitter,
    TextInput,
    NativeModules,
    BackHandler
} from 'react-native';

import InquiryItem from './InquiryItem'
import Constants from '../util/Constants';
var Dimensions = require('Dimensions');
import NetUtil from '../util/NetUitl';
import Top from './Top';
import OrderItemScreen from './OrderItemScreen';
import Toast, { DURATION } from 'react-native-easy-toast';
var COMMENT={'5':'好评','3':'中评','1':'差评'};
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const { NimModule } = NativeModules;
import OfflineMessageView from '../OfflineMessageView';
import contactList from '../ContactList';
export default class EvaluateScreen extends Component {
    constructor(props) {
    super(props);
    this.state = {
        commentType:'',
        commentText:'',
        evaluated:this.props.rowData.evaluated,
        dataSource:ds.cloneWithRows([]),
        ticketId:''
    };
    this.backKeyPressed = this.backKeyPressed.bind(this);
}
    componentWillMount(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.entId=ret.entId;
            this.ticketId=ret.ticketId;
            this.setState({
                ticketId:this.ticketId
            });
            if(this.props.rowData.evaluated){
                this.loadCommentList();
            }
        }).catch(err => {
            console.log(JSON.stringify(err));
        })
    }
    componentDidMount(){
        BackHandler.addEventListener('hardwareBackPressBuy', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBuy',this.backKeyPressed);
    };
    backKeyPressed(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
        return true;
    }
    changeCommentType(commentType){
        this.setState({
            commentType:commentType
        })
    }
    onChangeEvalText(text){
        this.setState({
            commentText:text
        })
    }
    async loadCommentList(){
        NetUtil.ajax({
            url:'/entEvaluate/listEntEvaluate.htm',
            data:{
                orderId:this.props.rowData.id,
                ticketId:this.ticketId
            },
            success:(result)=>{
                if(result.status==1){
                    this.setState({
                        evaluated:true,
                        dataSource:ds.cloneWithRows(result.data)
                    })
                }
            }
        });
    }
    render() {
        var widths = Dimensions.get('window').width;
        const {rowData}=this.props;
        const imgList={'5':require('../../images/orderlist/common_icon_wellrecieved_p.png'),'3':require('../../images/orderlist/common_icon_assessment_p.png'),'1':require('../../images/orderlist/common_icon_badrewiew_p.png')}
        return (
            <View style={{flex:1,flexDirection:'column'}}>
                <Top navigator={this.props.navigator} ticketId={this.state.ticketId} title={"评价订单"} />
                <ScrollView>
                    <OrderItemScreen rowData={rowData} ticketId={this.state.ticketId} navigator={this.props.navigator} noButton={'true'}></OrderItemScreen>
                    {this.state.evaluated?
                        <ListView
                        dataSource={this.state.dataSource}
                        enableEmptySections={true}
                        renderRow={(rowData1,sectionID,rowID) => 
                            <View>
                                <View style={[styles.commentTypeView,{paddingLeft:10,paddingTop:10,paddingBottom:10}]}><Text style={{color:'#293f68'}}>{rowData1.evaluatedBy==this.entId?'我发布的评价':'对我的评价'}</Text></View>
                                <View style={[styles.commentTypeView,{flexDirection:'column'}]}>
                                    <View style={[styles.commentType,{marginLeft:0,marginBottom:10}]}>
                                        <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={imgList[rowData1.score]} />
                                        <Text style={{color:'#293f68'}}>{COMMENT[rowData1.score]}!</Text>
                                    </View>
                                    <View><Text style={{color:'#293f68'}}>{rowData1.comment}</Text></View>
                                </View>
                                <View style={styles.splitLine} width={widths}></View>
                            </View>
                        }
                    />
                    :<View>
                        <View style={styles.commentTypeView}>
                            <Text style={{color:'#6c7b9a',fontWeight:'bold'}}>综合评价</Text>
                            <TouchableOpacity style={styles.commentType} onPress={()=>{this.changeCommentType(5)}}>
                                {this.state.commentType==5?
                                    <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_wellrecieved_p.png')} />:
                                    <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_wellrecieved_n.png')} />
                                }
                                <Text>好评</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentType} onPress={()=>{this.changeCommentType(3)}}>
                                {this.state.commentType==3?
                                    <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_assessment_p.png')} />:
                                    <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_assessment_n.png')} />
                                }
                                <Text>中评</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentType} onPress={()=>{this.changeCommentType(1)}}>
                                {this.state.commentType==1?
                                    <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_badrewiew_p.png')} />:
                                    <Image style={styles.commentTypeIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_badrewiew_n.png')} />
                                }
                                <Text>差评</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TextInput  underlineColorAndroid={"transparent"}
                                multiline={true}
                                numberOfLines={4}
                                maxLength={60}
                                onChangeText={(text) => this.onChangeEvalText(text)}
                                value={this.state.commentText}
                                style={styles.commentInput}
                                placeholder='添加文字评论'
                                placeholderTextColor='#8f9fc1'
                            />
                        </View>
                    </View>
                     }
                    <View style={{height:30}}></View>
                </ScrollView>
                {!this.state.evaluated?
                <TouchableOpacity style={[styles.commentBtn,{width:widths}]} onPress={this.saveComment.bind(this)}>
                    <Text style={styles.commentBtnText}>发表评价</Text>
                </TouchableOpacity>:
                <TouchableOpacity style={[styles.commentBtn,{width:widths}]} onPress={this.checkContacts.bind(this)}>
                    <Text style={styles.commentBtnText}>咨询</Text>
                </TouchableOpacity>
            }
                <Toast ref="toast"/>
            </View>
        );
    }
    saveComment(){
        var entId=this.props.rowData.facilitatorEntId?this.props.rowData.facilitatorEntId:this.props.rowData.releaseEntId;
        NetUtil.ajax({
            url:'/entEvaluate/addEntEvaluate.htm',
            data:{
                orderId:this.props.rowData.id,
                score:this.state.commentType,
                comment:this.state.commentText,
                evaluatedEntId:entId,
                evaluatedBy:this.props.rowData.inquiryEntId,
                ticketId:this.ticketId
            },
            success:(data)=> {
                if(data.status==1&&data.data){
                    this.refs.toast.show('评价成功');
                    DeviceEventEmitter.emit('commentSuccess',this.props.rowID);
                    this.loadCommentList();
                }
            }
        });
    }
    /**
     * 检查聊天对象企业的联系人数量
     * 
     * @memberof CFDetailScreen
     */
    checkContacts() {
        var entId=this.props.rowData.facilitatorEntId?this.props.rowData.facilitatorEntId:this.props.rowData.releaseEntId;
         NetUtil.ajax({
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
                    enterName:this.props.rowData.releaseEntName,
                }
            });
        }
    };

    showChatView(){
        var entId=this.props.rowData.facilitatorEntId?this.props.rowData.facilitatorEntId:this.props.rowData.releaseEntId;
         NetUtil.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:entId,
                ticketId: this.ticketId,
            },
            success:(responseJson)=>{
                var responseData = responseJson;
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
        var entId=this.props.rowData.facilitatorEntId?this.props.rowData.facilitatorEntId:this.props.rowData.releaseEntId;
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
                        }) //
                    }
    }    
}
const styles = StyleSheet.create({
    commentBtn:{
        position:'absolute',
        bottom:0,
        backgroundColor:'#2676ff',
        paddingTop:12,
        paddingBottom:12,
        // alignSelf:'flex-end'
    },
    commentBtnText:{
        color:'#fff',
        alignSelf:'center',
        fontSize:16
    },
    commentInput:{
        marginLeft:10,
        marginRight:10,
        // borderColor:'#ff0',
        // borderWidth:1
    },
    commentTypeView:{
        flexDirection:'row',paddingLeft:10,paddingRight:10,
        paddingTop:10,paddingBottom:10,
        borderColor:'#dcedf7',
        // borderTopWidth:1,
        borderBottomWidth:0.5
    },
    commentType:{
        flexDirection:'row',
        marginLeft:20,
        marginRight:20
    },
    commentTypeIcon:{
        width:20,
        height:20,
        marginRight:5
    },
    listBox:{
        paddingBottom:10,
        // paddingTop:10,
        flexDirection:'column'
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
        height:15,
        backgroundColor:'#f7f8fa',
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
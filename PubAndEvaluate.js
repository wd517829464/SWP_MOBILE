/**
 * Created by zhangl 17/03/23.
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
    StatusBar,
    View,
    Platform,
    Button,
    TextInput,
    ScrollView,
    Alert,
    TouchableHighlight,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    DeviceEventEmitter,
    Keyboard,
    TouchableWithoutFeedback,        
    NativeModules,
    BackHandler,
} from 'react-native';
import NetUtil from './app/util/NetUitl';
import MessageCount from './app/component/MessageCount';
import Toast, {DURATION} from 'react-native-easy-toast';
import contactList from './app/ContactList';

var { width, height, scale } = Dimensions.get('window');
var orderValuationDetail = {};
var wellVal = require('./images/orderlist/common_icon_wellrecieved_p.png');
var acessVal = require('./images/orderlist/common_icon_assessment_n.png');
var badVal = require('./images/orderlist/common_icon_badrewiew_n.png');
const { NimModule } = NativeModules;
import Constants from './app/util/Constants';
import LeaveMessage from './app/component/LeaveMessage';
import OfflineMessageView from './app/OfflineMessageView';

export default class PubAndEvaluate extends Component {

    constructor(props) {
        super(props);
        const { rowData } = this.props;
        this.state = {

            loaded: false,
            ticketId: '',
            idx: 0,
            editable: true,
            isLoading: true,
            text: '',
            score: 5,
            valuation: '中评',
            buttonShow: true,//默认未评价 true未评价  false已评价
            orderValuation: rowData.orderValuation,
            wellFlag: true,
            acessFlag: true,
            badFlag: true,
            animating: false,
            disabledFlag: false,//评价禁用的标识
            commentEdit:false,
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);
        


    }
    activityIndicatorMethod() {

        if (this.state.animating) {
            this.setState({
                animating: false,


            });
        } else {
            this.setState({
                animating: true,
            });
        }
    }
    loadData(ticketId) {
        const { rowData } = this.props;
        var st = this;
        if (rowData.orderValuation) {
            NetUtil.ajax({
                url: '/mobileOrderService/getOrderValuation',
                data: {
                    ticketId: ticketId,

                    orderId: rowData['orderId'],

                },
                success: (responseJson) => {
                    var responseData = responseJson;
                    if (responseData) {
                        console.log(JSON.stringify(responseData));
                        var v = '';

                        if (responseData["status"] == 1) {
                            orderValuationDetail = responseData['data']["orderValuation"];
                            if (orderValuationDetail["score"] == 5) {
                                acessVal = require('./images/orderlist/common_icon_wellrecieved_p.png');
                                v = '好评';
                            } else if (orderValuationDetail["score"] == 3) {
                                acessVal = require('./images/orderlist/common_icon_assessment_p.png');
                                v = '中评';
                            } else {
                                acessVal = require('./images/orderlist/common_icon_badrewiew_p.png');
                                v = '差评';
                            }

                            st.setState({
                                loaded: true, text: orderValuationDetail['comment'],accId:responseData["data"]["accid"],
                                editable: false, valuation: v, buttonShow: false, wellFlag: false, acessFlag: true, badFlag: false, disabledFlag: true,
                            });
                        }
                    }
                },
                error: (err) => {

                    console.log(err);

                }
            });
        } else {

        }
        this.setState({ ticketId: ticketId });


    }
    onEvalPress(score) {
        if (score == 5) {
            wellVal = require('./images/orderlist/common_icon_wellrecieved_p.png');
            acessVal = require('./images/orderlist/common_icon_assessment_n.png');
            badVal = require('./images/orderlist/common_icon_badrewiew_n.png');

        } else if (score == 3) {
            acessVal = require('./images/orderlist/common_icon_assessment_p.png');
            wellVal = require('./images/orderlist/common_icon_wellrecieved_n.png');
            badVal = require('./images/orderlist/common_icon_badrewiew_n.png');

        } else {
            badVal = require('./images/orderlist/common_icon_badrewiew_p.png');
            wellVal = require('./images/orderlist/common_icon_wellrecieved_n.png');
            acessVal = require('./images/orderlist/common_icon_assessment_n.png');
        }
        this.setState({ editable: true, score: score });
    }
    onChangeEvalText(text) {
        this.setState({ text: text });

    }
    onSubmitVal(text) {
        const { rowData } = this.props;
        var st = this;
        this.activityIndicatorMethod();
        storage.load({
            key: 'loginState',
        }).then(ret => {
            NetUtil.ajax({
                url: '/orderValuation/saveOrderValuation',
                data: {
                    ticketId: ret['ticketId'],
                    score: st.state.score,
                    orderId: rowData['orderId'],
                    comment: st.state.text

                },
                success: (responseJson) => {
                    var responseData = responseJson;
                    if (responseData) {

                        if (responseData["status"] == 1) {
                            DeviceEventEmitter.emit('reloadOrderList', '');
                            this.refs.toast.show('评论成功!');
                            var { navigator } = this.props;
                            if (navigator) {
                                navigator.pop();
                            }
                            st.activityIndicatorMethod();
                        }
                    }
                },
                error: (err) => {

                    console.log(err);

                }
            });

        }).catch(err => {
            alert('当前登录用户凭证已超时，请重新登录。');
        })



    }
    onSubmit(text) {
        var st = this;
        Alert.alert('提示', '你即将对这次交易做出评价，\n是否要继续', [
            { text: '取消', onPress: () => this.cancle(text), style: 'cancel' },
            { text: '确认', onPress: () => this.confirm(text) }
        ])
    }
    cancle(index) {


    }
    confirm(text) {

        this.onSubmitVal(text);
    }
    componentDidMount() {


        const { rowData } = this.props;
        var st = this;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            if (rowData['orderValuation']) {

                this.loadData(ret['ticketId']);
            } else {
                //reset 各控件状态
                wellVal = require('./images/orderlist/common_icon_wellrecieved_p.png');
                acessVal = require('./images/orderlist/common_icon_assessment_n.png');
                badVal = require('./images/orderlist/common_icon_badrewiew_n.png');
                this.setState({ wellFlag: true, acessFlag: true, badFlag: true, disabledFlag: false, });

            }

        }).catch(err => {
            alert('当前登录用户凭证已超时，请重新登录。');
        })
        BackHandler.addEventListener('hardwareBackPressPAE',this.backKeyPressed);

    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressPAE',this.backKeyPressed);
    }
    backKeyPressed(){
        this.goBack();
        return true;
    }
    goBack() {
        var { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    dismissKeyboard() {
        Keyboard.dismiss();
    }
    goCommentEdit(){
        this.setState({commentEdit:!this.state.commentEdit});
    }

    /**
     * 检查聊天对象企业的联系人数量
     * 
     * @memberof CFDetailScreen
     */
    checkContacts() {
        console.log("订单详情：开始检查企业联系人数量");
        const { rowData ,isSold} = this.props;
        var entId = '';
        if(isSold){
            entId = rowData["responseEnterpriseId"]?rowData["responseEnterpriseId"]:'';
        }else{
            entId = rowData["releaseEnterpriseId"]?rowData["releaseEnterpriseId"]:'';
        }
        NetUtil.ajax({
            url:'/userservice/getEnterpriseContacts',
            data:{
                enterpriseId:entId,
            },
            success:(responseJson)=>{
                // console.log("getUserAdminByEnterId responseJsonData = " + responseJson.data);
                // var responseData = responseJson;
                // if (responseData&&responseData.status==1) {
                //     NimModule.ChatWith(responseData.data,()=>{}) ;
                // }else{
                //     this.OfflineMessageView();
                // }
                var data = responseJson.data;


                console.log("获取到的联系人数据"+data);
                console.log("获取到的企业联系人数量有"+data.length);
                if(data.length>1){
                    this.toChooseChatTarget(data);
                }else{
                    this.showChatView();
                }
            },
            error:(err)=>{
                this.OfflineMessageView();
                console.log("获取企业联系人出错"+err);
            }
        });
    }

    /**
     * 开启选择聊天对象界面
     * @memberof RNDemo
     */
    toChooseChatTarget = (data) => {
        // const {navigate} = this.props.navigation;
        // navigate('page2');

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
        const { rowData ,isSold} = this.props;
        var entId = '';
        if(isSold){
            entId = rowData["responseEnterpriseId"]?rowData["responseEnterpriseId"]:'';
        }else{
            entId = rowData["releaseEnterpriseId"]?rowData["releaseEnterpriseId"]:'';
        }
        NetUtil.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:entId,
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
                this.OfflineMessageView();
                console.log(err);
            }
        });
        //responseEnterpriseId
        //releaseEnterpriseId
    }
    OfflineMessageView(){
        var { rowData ,isSold,navigator} = this.props;
        var entId = '';
        if(isSold){
            entId = rowData["responseEnterpriseId"]?rowData["responseEnterpriseId"]:'';
        }else{
            entId = rowData["releaseEnterpriseId"]?rowData["releaseEnterpriseId"]:'';
        }
      
                    if(navigator){
                        navigator.push({
                            name:'OfflineMessageView',
                            component:OfflineMessageView,
                            params:{
                                navigator:navigator,
                                ticketId:this.props.ticketId,
                                rowData:rowData,
                                entId:entId,
                            }
                        }) 
                    }
    }
    render() {

        const { rowData ,isSold} = this.props;
        let head=null;
        if(rowData['imgList']&&rowData['imgList'].length>0){
            var obj=rowData['imgList'][0];
            var imgUrl={uri:Constants.IMG_SERVICE_URL+'&businessCode='+obj.businessCode+'&fileID='+obj.fileId};
            head=(<Image style={[styles.info_right_img]} resizeMode={Image.resizeMode.contain} source={imgUrl} />);
        }

        return (
            <View style={styles.box}>
               
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={() => this.dismissKeyboard()}>
                    
                    <View style={styles.box}>
                    <View style={styles.headBar}>
                        <TouchableHighlight activeOpacity={0.6} underlayColor={'transparent'} onPress={(text) => { this.goBack() }}>
                            <Image source={require('./images/navigator/nav_icon_back.png')} style={styles.headerLeftIcon} />
                        </TouchableHighlight>
                        <Text style={styles.headerTitle}>订单详情</Text>
                        {/*<Image source={require('./images/shopcart/nav_icon_message.png')} style={styles.headerRightIcon} />*/}
                                            <View style={{ paddingBottom: 10, }}>
                        <MessageCount navigator={this.props.navigator} />
                    </View>
                    </View>
                    <ScrollView style={styles.cellBox}>
                    <View style={styles.cellBox}>

                        <View style={styles.splitLineTop}></View>
                        <View style={styles.cellBox_first}>
                            <Image source={require('./images/orderlist/common_icon_buyorder.png')} style={styles.entLogo}></Image>
                            <Text style={styles.cellText_Ent}>{rowData.orderCode}</Text>
                            <Text style={{ width:10, color: '#99a8bf', fontSize: 18,textAlign:'center'}}>|</Text>
                            {isSold?<Text style={styles.cellText_time}>{rowData.responseEntName}</Text>
                            :<Text style={styles.cellText_time}>{rowData.releaseEntName}</Text>}
                            <Text style={styles.right_arrow}>&gt;</Text>
                        </View>
                        <View style={styles.splitLine}></View>
                        <View style={[styles.cellTextBox,{paddingBottom:-8,}]}>
                        <View style={styles.cellTextBox_left}>
                            <Text style={styles.cellText_wasteName} numberOfLines={3}>{rowData.wasteName||'--'}</Text>
                            <Text style={styles.cellText_telNumber}>{rowData.wasteCode}</Text>

                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 5, }}>
                            <View style={styles.cellTextBox_right}>
                                <Text style={styles.cellButtonTitle_wasteMethod}>{rowData.dispositionTypeLabel}</Text>
                            </View>
                            <View style={styles.cellTextBox_right}>

                                <Text style={styles.cellButtonTitle_wasteNumText}></Text>
                                <Text style={styles.cellButtonTitle_wasteWeight}></Text>
                                <Text style={styles.cellButtonTitle_wasteUnitText}></Text>
                            </View>
                        </View>
                    </View>
                        <View>
                            <Image source={require('./images/common_dashline.png')} style={{ height: 0.5, width: 375, marginLeft: 0, marginRight: 12, }} />
                        </View>
                        <View style={styles.detailBox}>
                            <View>
                                <Text style={{ color: '#6b7c99', fontSize: 12, textAlign: 'left'}}>
                                 处置时间: {rowData.capacity_start_date} 至 {rowData.capacity_end_date}</Text>
                                {/*<Text style={{ marginTop: 10, color: '#6b7c99', fontSize: 12, textAlign: 'left', marginLeft: 12, }}>二位码: {rowData.wasteTypeCode}{rowData.wasteTypeDescription} </Text>*/}
                                <Text style={{ marginTop: 5,marginBottom: 5, color: '#6b7c99', fontSize: 12, textAlign: 'left',  }}>有毒有害物质: {rowData.harmful}</Text>
                                <Text style={{ color: '#6b7c99', fontSize: 12, textAlign: 'left' }}>成交时间: {rowData.confirmedTime}</Text>
                            </View>
                            {head}
                        </View>
                        <View>
                            <Image source={require('./images/common_dashline.png')} style={{ height: 0.5, width: 375, marginLeft: 0, marginRight: 12, }} />
                        </View>
                             <View style={styles.splitLine}></View>

                    <View style={styles.cellTextBox}>


                        <View style={[styles.cellPriceLeftBox]}>
                            <Text style={{ color: "#6b7c99", fontSize: 13, paddingLeft: 10, paddingTop: 16, }}>单价:</Text>
                            <View style={{ flexDirection: 'column', }}>
                                <Text style={[styles.cellPriceLeftText, { paddingTop: 0, }]}>￥ {parseFloat(rowData.price).toFixed(3)}</Text>
                                <Text style={[styles.cellPriceLeftText, { color: "#99a8bf", fontSize: 11, marginLeft: 18, marginTop: 2, }]}>
                                    {rowData.operatingPartyPaymentInfo}</Text>
                            </View>
                        </View>


                        <View style={styles.cellTextBox_right}>
                            <Text style={[styles.cellButtonTitle_wasteNumText, { paddingTop: 10, }]}>数量:</Text>
                            <Text style={styles.cellButtonTitle_wasteWeight}>{parseFloat(rowData.quantity).toFixed(3)}</Text>
                            <Text style={styles.cellButtonTitle_wasteUnitText}>{rowData.unitValue}</Text>
                        </View>

                    </View>
                    <View style={styles.splitLine}></View>
                    <View style={styles.cellPriceBox}>
                        <View style={styles.cellPriceRightBox}>

                            <Text style={{ color: "#6b7c99", fontSize: 13, paddingTop: 12, marginRight: 8, textAlign: 'right', }}>总额:</Text>
                            <View style={styles.cellPriceRightRightBox}>
                                <Text style={styles.cellPriceRightText}>￥ {parseFloat(rowData.amount).toFixed(3)}</Text>
                                <Text style={{ color: "#99a8bf", fontSize: 11, paddingLeft: 10, paddingRight: 10, paddingTop: 4, textAlign: 'right', }}>{rowData.Cfr}</Text>
                            </View>
                        </View>
                    </View>


                        <View style={styles.splitLineBottom}></View>


                    </View>
                    <View style={{ height: 12 }}></View>
                    {isSold?null:
                    <View style={styles.evalBox}>
                        <View style={styles.evalEmojiBox}>
                            <Text style={{ paddingLeft: 12, fontWeight: 'bold', fontSize: 14, color: '#6b7c99',backgroundColor: 'white', }}>
                                综合评价</Text>
                            {this.state.buttonShow&&!this.state.commentEdit?
                                <Text style={{flex:1,textAlign:'center',color:'#99a8bf',paddingRight:100,fontSize:14,marginTop:-1}}>未评价</Text>:
                                <View style={{flexDirection:'row',alignItems:'center',alignSelf:'center',justifyContent:'center'}}>
                                    {this.state.wellFlag ?
                                    <TouchableHighlight activeOpacity={0.6} underlayColor={'transparent'} onPress={(text) => { this.onEvalPress(5) }} disabled={this.state.disabledFlag}>


                                        <View style={{ flexDirection: 'row',alignItems:'center',justifyContent:'center' }}>
                                            <Image source={wellVal} style={{ width: 20, height: 20, marginLeft: 32, }}></Image>
                                            <Text style={{ marginLeft: 4, }}>好评</Text>
                                        </View>

                                    </TouchableHighlight>
                                    : null}
                                {this.state.acessFlag ?
                                    <TouchableHighlight activeOpacity={0.6} underlayColor={'transparent'} onPress={(text) => { this.onEvalPress(3) }} disabled={this.state.disabledFlag}>

                                        <View style={{ flexDirection: 'row',alignItems:'center',justifyContent:'center'  }}>
                                            <Image source={acessVal} style={{ width: 20, height: 20, marginLeft: 40, }}></Image>
                                            <Text style={{ marginLeft: 4, }}>{this.state.valuation}</Text>
                                        </View>

                                    </TouchableHighlight>
                                    : null}
                                {this.state.badFlag ?
                                    <TouchableHighlight activeOpacity={0.6} underlayColor={'transparent'} onPress={(text) => { this.onEvalPress(1) }} disabled={this.state.disabledFlag}>

                                        <View style={{ flexDirection: 'row',alignItems:'center',justifyContent:'center' }}>
                                            <Image source={badVal} style={{ width: 20, height: 20, marginLeft: 40, marginRight: 0, }}></Image>
                                            <Text style={{ marginLeft: 4, }}>差评</Text>
                                        </View>

                                    </TouchableHighlight>
                                    : null}
                                </View>
                        }
                        </View>

                    </View> 
                    }
                    <View style={{ height: 8, backgroundColor: 'white', }}></View>
                    <View style={styles.splitLineBottom}></View>
                   
                    {(!this.state.buttonShow||this.state.commentEdit&&!isSold)?
                        <View style={{ backgroundColor: '#ffffff', marginTop: 0, height: 120, }}>
                        <TextInput  underlineColorAndroid={"transparent"}
                            multiline={true}
                            numberOfLines={4}
                            maxLength={60}
                            editable={this.state.editable}
                            onChangeText={(text) => this.onChangeEvalText(text)}//
                            value={this.state.text}
                            style={{ backgroundColor: '#ffffff', flex: 1, paddingLeft: 12, fontSize: 15, height: 112, marginTop: 12, }}
                            placeholder='添加文字评论'
                            placeholderTextColor='#8f9fc1'
                        />
                    </View>:null
                    }
                    
                    </ScrollView>
                    <Toast ref="toast" />

                    <ActivityIndicator style={{ width: 20, height: 20, paddingTop: 20, }} color="#ffffff"
                        animating={this.state.animating} size={'small'}
                        hidesWhenStopped={true} />
                    {(this.state.commentEdit&&!isSold)?
                        <View style={{ flex: 1, }}>
                            <TouchableHighlight activeOpacity={0.6} style={{
                                flex: 1, paddingTop: 24, position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, backgroundColor: '#2676ff'
                                , alignItems: 'center',
                            }} underlayColor={'transparent'} onPress={(text) => { this.onSubmit(text) }}>
                                <Text style={{ fontSize: 16, color: 'white', backgroundColor: 'transparent', marginTop: -8, }}>发表评论</Text>
                            </TouchableHighlight>
                        </View>
                        : null}

                        {this.state.buttonShow&&!this.state.commentEdit&&!isSold?
                           <View style={styles.chartAndComment}>
                            <View style={styles.chart_btn_view}>
                                <TouchableOpacity style={styles.btn_click} onPress={_ => {this.checkContacts();}}>
                                    <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('./images/message/common_icon_chat.png')} />
                                    <Text style={styles.comment_btn_text}>咨询</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.comment_btn_view}>
                                <TouchableOpacity style={styles.btn_click} onPress={this.goCommentEdit.bind(this)}><Text style={styles.comment_btn_text}>评价</Text></TouchableOpacity>
                            </View>
                        </View>:null 
                    }
                    {(!this.state.buttonShow||isSold)?
                        <View style={styles.chartAndComment}>
                                <View style={styles.chart_btn_view}>
                                    <TouchableOpacity style={styles.btn_click} onPress={_ => {this.checkContacts();}}>
                                        <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('./images/message/common_icon_chat.png')} />
                                        <Text style={styles.comment_btn_text}>咨询</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>:null
                    }
                        
                        </View>
                        
                </TouchableWithoutFeedback>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    chartAndComment:{
        flexDirection:'row',
        height:50,
        borderColor:'#e6ebf5',
        borderTopWidth:1,
        backgroundColor:'#fff'
    },
    chart_btn_view:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        borderColor:'#e6ebf5',
        borderRightWidth:1
    },
    chart_btn:{
         width:20,
        height:20,
        marginRight:8
    },
    comment_btn_view:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    btn_click:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:50
    },
    info_right_img:{
        width:50,
        height:50
    },
    comment_btn_text:{
        color:'#6b7c99'
    },
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    headerTitle: {
        textAlign: 'center',
        color: 'white',
        flex: 1,
        fontSize: 16,

    },
    cellBox: {
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    detailBox: {
        height:80,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginLeft:12,
        marginRight:12

    },
    cellBox_first: {
        height: 38,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom: 5,
        backgroundColor: 'white',
        marginRight:12
    },
    cellBox_second: {
        flexDirection: 'row',
        flex: 2,
    },
    cellBox_third: {
        flexDirection: 'row',
        flex: 3

    },
    cellText_distance: {
        fontSize: 12,
        color: '#6edce0',
        flex: 3,
        paddingTop: 15,
        paddingLeft: 12,
        // borderLeftColor:'#6edce0',
        // borderLeftWidth:1,

    },
    cellText_Ent: {
        fontSize: 12,
        color: '#293f66',
        width:140,
        textAlign: 'left',
        paddingLeft: 10,
        // paddingTop: 15,
        // paddingBottom: 10,

    },
    cellTextBox_left: {
        flexDirection: 'column',
        paddingLeft: 10,
        backgroundColor: 'white',

    },
    cellTextBox_right: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,
        // marginTop:-12,
        paddingBottom: 5,
        backgroundColor: 'white',

    },
    cellTextBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        backgroundColor: 'white',
    },
    cellText_wasteName: {
        marginTop: 8,
        fontSize: 15,
        color: '#293f6d',
        paddingBottom: 4,

    },
    cellText_telNumber: {
        marginTop: 4,
        fontSize: 14,
        color: '#5b709c',
        paddingBottom: 4,

    },
    cellText_time: {
        color: '#293f66',
        fontSize: 12,
        flex:1,
        textAlign: 'left',
    },
    right_arrow:{
        fontSize:18,
        color:'#e3e9f3',
        width:15
    },
    splitLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#E9EDF7'
    },
    splitLineTop: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#E9EDF7",
    },
    splitLineBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#dce4f2",
    },
    cellButton_wasteWeight: {
        padding: 0,
        margin: 0,
        flex: 8,
    },
    cellButtonTitle_wasteNumText: {
        fontSize: 12,
        color: '#6b7c99',
        flex: 8,
        textAlign: 'right',

        paddingBottom: 1,

    },
    cellButtonTitle_wasteWeight: {
        fontSize: 14,
        color: '#6b7c99',
        paddingLeft: 12,
        textAlign: 'right',
        // flex:4,

    },

    cellButtonTitle_wasteMethod: {
        fontSize: 14,
        color: '#6b7c99',
        paddingRight: 12,
        textAlign: 'right',
        paddingTop: 7,
        // flex:4,

    },

    cellButtonTitle_wasteUnitText: {
        fontSize: 14,
        flex: 1,
        color: '#6b7c99',
        textAlign: 'right',
        paddingBottom: 2,
        paddingRight: 12,

    },
    headBar: {
        flexDirection: 'row',
        // 水平排布
        paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
        height: Platform.OS === 'ios' ? 64 : 44,   // 处理iOS状态栏
        backgroundColor: '#2676ff',
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
    },
    searchArea: {
        backgroundColor: "white",
        height: 40,

        alignItems: 'center',

    },
    searchBox: {
        height: 30,
        flexDirection: 'row',
        borderRadius: 5,  // 设置圆角边
        backgroundColor: '#e6ebf5',
        marginLeft: 12,
        marginRight: 12,
        marginTop: 5,
        // paddingBottom:4,
        borderColor: "grey",
    },
    scanIcon: {
        height: 26.7,
        width: 26.7,
        resizeMode: 'stretch'
    },
    searchIcon: {
        marginLeft: 6,
        marginRight: 6,
        width: 16.7,
        height: 16.7,
        resizeMode: 'stretch',
        marginTop: 4,
    },
    headerLeftIcon: {
        marginLeft: 12,
        marginRight: 6,
        width: 12,
        height: 20,
        resizeMode: 'stretch'
    },
    headerRightIcon: {
        marginLeft: 5,
        marginRight: 8,
        width: 20,
        height: 20,
        resizeMode: 'stretch'
    },
    inputText: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 14,
        color: '#293f66',
        // textAlign:'center'
    },
    cellPriceBox: {

        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingBottom: 12,
        backgroundColor: 'white',
        //  borderStyle:'dashed', RN不支持这个属性
        //  borderTopWidth:1,
        //  borderTopColor:'#e6ebf5',



    },
    cellPriceLeftBox: {
        flexDirection: 'row',
        paddingTop: 10,

    },
    cellPriceRightBox: {
        flexDirection: 'row',
        paddingTop: 2,

    },
    cellPriceRightRightBox: {
        flexDirection: 'column',
        paddingLeft: 4,

    },
    cellPriceLeftText: {
        paddingLeft: 12,
        fontSize: 14,
        color: "#293f66",
    },
    cellPriceRightText: {
        paddingRight: 10,
        fontSize: 14,
        color: "#ff4060",
        textAlign:'right',


    },
    entLogo: {
        width: 18,
        height: 20,
        marginLeft: 12,
        // marginTop: 12,

    },
    disposeLogo: {
        width: 16,
        height: 16,
        marginLeft: 12,
        marginTop: 16,


    },
    editAndComfirmButton: {
        paddingTop: 4,
        flex: 1,
        paddingRight: 10,

    },
    editAndComfirmButtonText: {
        fontSize: 12,
        color: '#2676ff',
        textAlign: 'center',
        paddingTop: 10,
    },
    evalBox: {
        backgroundColor: 'white',
    },
    evalEmojiBox: {
        // justifyContent:'space-between',
        flexDirection: 'row',
        alignItems:'center',
        // backgroundColor:'#ff0',
        borderTopWidth:0

    },


});
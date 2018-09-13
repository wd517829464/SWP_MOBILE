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
    NativeModules,
    StatusBar,
    BackHandler,
} from 'react-native';
import Top from './component/Top';
import NetUitl from './util/NetUitl';
import Swiper from 'react-native-swiper';
import CFBuyScreen from './CFBuyScreen';
import Constants from './util/Constants';
import OfflineMessageView from './OfflineMessageView';
import contactList from './ContactList';

const { NimModule } = NativeModules;

// var ViewPager = require('react-native-viewpager');
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var downTextWidth = widths - 90;
const TYPE_OPTIONS = [];
const dispositionTypes = [];
const buyWasteResourcePageData = {};
var imgType={"e":"化验单图片","f":"产废图片"};
export default class CFDetailScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pay: false,
            data: '',
            dispositionTypeIndex: -1,
            price: 0,
            buttonDisable: false,
            loading: true,
            accId: '',
            images:[],
            index:0
        };
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    componentWillMount() {
        NetUitl.ajax({
            url: '/mobilePlanResponseService/initBuyWasteResourcePageData.htm',
            data: {
                ticketId: this.props.ticketId,
                'planItemReleaseId': this.props.planitemReleaseId
            },
            success: (responseJson) => {
                var responseData = responseJson;
                var st = this;
                if (responseData) {
                    if (responseData.status == "Failure") {
                        this.setState({
                            data: [],
                            loading: false,
                            accId: "",
                            images:[]
                        });
                    } else {
                        buyWasteResourcePageData = responseData.data.pageData;
                        dispositionTypes = JSON.parse(responseData.data.pageData.dispositionTypeSuggest);
                        TYPE_OPTIONS = [];
                        for (var i = 0; i < dispositionTypes.length; i++) {
                            TYPE_OPTIONS.push(dispositionTypes[i].dispositionTypeLabel)
                        }
                        TYPE_OPTIONS = TYPE_OPTIONS.length == 0 ? new Array() : TYPE_OPTIONS;
                            st.setState({
                                data: responseData.data.pageData,
                                loading: false,
                                accId: buyWasteResourcePageData.planReleaseUser,
                                
                            });
                             setTimeout(function() 
                             {st.setState({images:responseData.data.pageData.imgList}); }, 200);
                    }
                } else {
                    this.setState({
                        data: [],
                        loading: false,
                        accId: "",
                        images:[]
                    });
                }
            }
        });
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressCFD', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressCFD',this.backKeyPressed);
    }
    backKeyPressed(){
        this.goback();
        return true;
    }
    goback() {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    render() {
        var data = this.state.data;
        var date = data.planStartDate && data.planStartDate.length > 10 ? (data.planStartDate.substring(0, 10) + '至' + data.planEndDate.substring(0, 10)) : ('无');
    //     <View style={styles.view}>
    //     <Text style={styles.line}>------</Text><Text style={styles.view_title}>产废图片展示</Text><Text style={styles.line}>-------</Text>
    // </View>
        return (
            <View style={{ flex: 1,paddingBottom:60 }}>
                <StatusBar barStyle="light-content" />
                <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"产废资源详情"} />
                <ScrollView>
                    <View style={styles.cellBox_first}>
                        <Image style={[styles.cellText_icon]} resizeMode={Image.resizeMode.contain} source={require('../images/home/commom_icon_logo.png')} />
                        <Text style={[styles.cellText_Ent]}>{this.props.enterName || '--'}</Text>
                        <Text style={[styles.cellText_distance]}>l  {this.props.cantonName || '暂无'}</Text>
                    </View>
                    <View style={styles.msgView}>
                        <View style={styles.info1}>
                            <Text style={styles.name}>{data.wasteName}</Text>
                            <Text style={styles.code}>{data.wasteCode}</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_text}>有毒有害物质：{data.enterpriseWasteDescription}</Text>
                        <Text style={styles.info_text}>处理时间：{date}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.info_text_count}>数量：{data.planDisposeQuantity}{data.unitCode == 'C' ? '只' : '吨'}</Text>
                    </View>
                    {this.state.images.length==0?
                    <View style={styles.imgView}>
                        <View style={styles.view}>
                            <Text style={styles.line}>------</Text><Text style={styles.view_title}>暂无图片</Text><Text style={styles.line}>-------</Text>
                        </View>
                    </View>:null}
                    <Swiper 
                        height={300}
                        loop={true}
                        style={styles.swipe}
                        // showsButtons={true}  
                        index={this.state.index}
                        autoplay={false}
                        horizontal={true}
                        key={Math.random()}
                    >
                        {this.renderImg()}
                    </Swiper>
                   
                </ScrollView>
                <View style={styles.btn_view}>
                    <View style={styles.chart_view}>
                        <TouchableOpacity style={[styles.btn_touch, { width: widths * 0.33 }]} onPress={this.checkContacts.bind(this)}>
                            <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../images/message/common_icon_chat.png')} />
                            <Text style={styles.chat_title}>咨询</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.call_price_view}>
                        <TouchableOpacity style={styles.btn_touch} onPress={this.goBuy.bind(this)}>
                            <Text style={styles.call_price_text}>报价</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.loading ? <Image style={styles.loadImage} resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} /> : null}

            </View>
        );
    }
    
    /**
     * 检查聊天对象企业的联系人数量
     * 
     * @memberof CFDetailScreen
     */
    checkContacts() {
        console.log("开始检查企业联系人数量");
        console.log("产废详情页企业ID为：this.props.enterId = "+this.props.enterId);
         NetUitl.ajax({
            url:'/userservice/getEnterpriseContacts',
            data:{
                enterpriseId:this.props.enterId,
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
                console.log(data);
                if(data.length>1){
                    this.toChooseChatTarget(data);
                }else{
                    this.goChat();
                }
            },
            error:(err)=>{
                this.OfflineMessageView();
                console.log(err);
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

    goChat() {
        // var rowData = { toId: this.state.accId };
        // if(this.state.accId&&this.state.accId.length>0){
        //     NimModule.doAddFriend(this.state.accId,"",true);
        // }else{
        //     this.OfflineMessageView();           
        // }
        console.log("产废详情页企业ID为：this.props.enterId = "+this.props.enterId);
         NetUitl.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:this.props.enterId,
            },
            success:(responseJson)=>{
                console.log("getUserAdminByEnterId responseJsonData = " + responseJson.data);
                var responseData = responseJson;
                if (responseData&&responseData.status==1) {
                    // NimModule.ChatWith(responseData.data,()=>{}) ;
                    console.log("获取到的企业联系人信息"+responseData.data);
                }else{
                    this.OfflineMessageView();
                }
            },
            error:(err)=>{
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
                                entId:this.props.enterId,
                            }
                        }) //
                    }
    }    
    renderImg() {
        var imageViews = [];
        for (var i = 0; i < this.state.images.length; i++) {
            var obj=this.state.images[i];
            var imgUrl={uri:Constants.IMG_SERVICE_URL+'&businessCode='+obj.businessCode+'&fileID='+obj.fileId};
            var imgTypeText=imgType[obj.fileType];
            imageViews.push(
                <View key={Math.random()} style={{ flex: 1 }}>
                    <View style={styles.view}>
                        <Text style={styles.line}>------</Text><Text style={styles.view_title}>{imgTypeText}</Text><Text style={styles.line}>-------</Text>
                    </View>
                    <Image
                    style={{ flex: 1 }}
                    width={widths}
                    source={imgUrl}
                />
                </View>
                
                
            );
        }
        return imageViews;
    }
    goBuy() {
        const { navigator } = this.props;
        console.log("准备跳转到报价单页面的时候企业id为"+this.props.enterId,);
        if (navigator) {
            navigator.push({
                name: 'CFBuyScreen',
                component: CFBuyScreen,
                params: {
                    navigator: navigator,
                    ticketId: this.props.ticketId,
                    planitemReleaseId: this.props.planitemReleaseId,
                    enterName: this.props.enterName,
                    region: this.props.region,
                    publisherId: this.props.publisherId,
                    enterId:this.props.enterId,
                    cantonName:this.props.cantonName,
                }
            })
        }
    }
}

const styles = StyleSheet.create({
    swipe: {
        // marginLeft:10,
        // marginRight:10
    },
    loadImage: {
        position: 'absolute',
        top: 250,
        alignSelf: 'center',
        zIndex: 2
    },
    cellBox_first: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: 'lightgrey',
        paddingBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
    },
    cellText_icon: {
        width: 18,
        height: 18,
        // flex:0.5,
        marginRight: 10,
        marginTop: -1
    },
    cellText_distance: {
        fontSize: 10,
        color: '#16d2d9',
        flex: 2
    },
    cellText_Ent: {
        fontSize: 13,
        color: '#293f66',
        textAlign: 'left',
        flex: 5
    },
    msgView: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        padding: 12,
    },
    icon: {
        width: 22,
        height: 22,
        marginRight: 10,
        marginLeft: -45
    },
    info1: {
        flex: 1,
    },
    info: {
        marginLeft: 15,
        marginRight: 15,
        paddingTop: 8,
        paddingBottom: 8,
        borderTopWidth: 1,
        borderTopColor: '#e9edf7',
    },
    info_text: {
        color: '#6b7c99',
        fontSize: 13,
        lineHeight: 22
    },
    info_text_count: {
        color: '#293f66',
        fontSize: 15,
        lineHeight: 22,
        alignSelf: 'flex-end'
    },
    name: {
        color: '#293f66',
        fontSize: 16,
        lineHeight: 30
    },
    code: {
        color: '#6b7c99',
        fontSize: 14
    },
    view: {
        backgroundColor: '#f7f8fa',
        flexDirection: 'row',
        height: 46,
        justifyContent: 'center',
        alignItems: 'center'
    },
    view_title: {
        color: '#afbad0',
        marginLeft: 10,
        marginRight: 10
    },
    line: {
        color: '#afbad0'
    },
    btn_view: {
        flexDirection: 'row',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: Dimensions.get('window').width,
        bottom: 0
    },
    chart_view: {
        flex: 3.3,
        height: 60,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#f7f8fa',
        backgroundColor: '#f7f8fa'
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
        flex: 6.7,
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
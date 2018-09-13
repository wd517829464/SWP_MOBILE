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
    Alert,
    TouchableHighlight,
    RefreshControl,
    Dimensions,
    DeviceEventEmitter,
    TouchableOpacity,
    BackHandler,
} from 'react-native';

import Header from './Header';
import OrderListItem from './app/component/OrderListItem';
import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import NetUtil from './app/util/NetUitl';
import MessageCount from './app/component/MessageCount';

var { width, height, scale } = Dimensions.get('window');

export default class UserOrderList extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2;
            }
        });
        var ds2 = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2;
            }
        });
        this.state = {
            dataSource: ds,
            soldDataSource:ds2,
            loaded: false,
            idx: 0,
            editing: false,
            isLoading: true,
            boughtPageIndex:1,
            boughtPageSize:10,
            soldPageIndex:1,
            soldPageSize:10,
            boughtOrderList:[],
            soldOrderList:[],
            isLoadingTail:false,
            isLoadingTailSold:false
        };
        this.backKeyPressed = this.backKeyPressed.bind(this);
        var st = this;
        this.subscription = DeviceEventEmitter.addListener('reloadOrderList', function (t) {
            st.soldPageIndex = 1;
            st.boughtPageIndex = 1;
            st.setState({dataSource: st.state.dataSource.cloneWithRows([]),boughtOrderList:[],});
            st.loadData(true);
        });
        BackHandler.addEventListener('hardwareBackPressUO', this.backKeyPressed);
        this.boughtPageIndex = 1;
        this.soldPageIndex = 1;
        this.boughtOrderList = [];
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressUO',this.backKeyPressed);
        this.subscription.remove();
    }
    backKeyPressed(){
        this.goBack();
        return true;
    }
    _onSoldEndReached() {
        // if (this.state.isLoadingTailSold || this.state.isLoading) {//this.state.loadcomplete
        //     return;
        // }
        this.setState({
            isLoadingTailSold: true
        });
        var st = this;
        this.soldPageIndex++;
        st.loadSoldData(false);        
    }
    _onBoughtEndReached() {
        // if (this.state.isLoadingTail || this.state.isLoading) {//this.state.loadcomplete
        //     return;
        // }
        console.log("_onBoughtEndReached   ,pageIndex: "+this.state.boughtPageIndex);
        this.setState({
            isLoadingTail: true
        });
        var st = this;
        this.boughtPageIndex++;
        st.loadData(false);       
    }
    async loadData(editing) {
        var st = this;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            var data = { ticketId: ret["ticketId"], pageIndex: st.boughtPageIndex, 
            pageSize: st.state.boughtPageSize, };
            if (editing) {
                data = { ticketId: ret["ticketId"], pageIndex: 1, pageSize: st.state.boughtPageSize, };
                this.setState({ soldPageIndex: 1, boughtOrderList:[],});
                st.boughtOrderList = [];
                st.soldPageIndex = 1;
            } else {}            
            NetUtil.ajax({
                url: '/mobileOrderService/initMyBoughtOrdersData.htm',
                data: data,
                success: (responseJson) => {                  
                    this.setState({ isLoading: false });
                    var responseData = responseJson;
                    if (responseData) {
                        if (responseData["status"] == 1) {
                            var data = responseData['data'];
                            if (data) {
                                var oData = data['ordersData'];
                                var orderList = [];
                                for (var i = 0; i < oData.length; i++) {
                                    var orderDetail = oData[i]['orderDetail'];
                                    var releaseEnterpriseId=oData[i]['releaseEnterpriseId'];
                                    if (oData[i]['isCfr'] == "1") {
                                        oData[i]['Cfr'] = '已包含运费';
                                    } else {
                                        oData[i]['Cfr'] = '未包含运费';
                                    }
                                    for (var j = 0; j < orderDetail.length; j++) {
                                        var tmpDetail = orderDetail[j];
                                        tmpDetail["orderCode"] = oData[i]["orderCode"];
                                        tmpDetail["Cfr"] = oData[i]["Cfr"];
                                        tmpDetail["responseEntName"] = oData[i]["responseEntName"];
                                        tmpDetail["releaseEntName"] = oData[i]["releaseEntName"];
                                        tmpDetail["wasteTypeCode"] = tmpDetail["wasteTypeCode"] ? tmpDetail["wasteTypeCode"] : "--";
                                        tmpDetail["wasteTypeDescription"] = tmpDetail["wasteTypeDescription"] ? tmpDetail["wasteTypeDescription"] : "--";
                                        tmpDetail["confirmedTime"] = oData[i]["confirmedTime"] ? oData[i]["confirmedTime"] : "--";
                                        tmpDetail["capacity_start_date"] = oData[i]["capacity_start_date"] ? oData[i]["capacity_start_date"] : "--";
                                        tmpDetail["capacity_end_date"] = oData[i]["capacity_end_date"] ? oData[i]["capacity_end_date"] : "--";
                                        if (parseInt(oData[i]["isHarmful"]) > 0) {
                                            tmpDetail["harmful"] = "是";
                                        } else {
                                            tmpDetail["harmful"] = "否";
                                        }                                        
                                        if (tmpDetail['operatingPartyPayment'] == '1') {
                                            tmpDetail['operatingPartyPaymentInfo'] = '经营方支付';
                                        } else {
                                            tmpDetail['operatingPartyPaymentInfo'] = '产废方支付';
                                        }
                                        tmpDetail['releaseEnterpriseId']=releaseEnterpriseId;
                                        orderList.push(tmpDetail);
                                    }
                                }
                                var bolist = st.boughtOrderList;//st.state.boughtOrderList;
                                if(editing){
                                    bolist = [];
                                }
                                if(orderList.length < 1){

                                }else{
                                    bolist = bolist.concat(orderList);
                                }
                                st.setState({
                                    dataSource: st.state.dataSource.cloneWithRows(bolist),
                                    boughtPageIndex:st.state.boughtPageIndex+1,
                                    boughtOrderList:bolist,
                                    isLoadingTail:false
                                });
                                st.boughtOrderList = bolist;
                            } else {}
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
    async loadSoldData(editing) {
        var st = this;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            var data = { 
                ticketId: ret["ticketId"], 
            pageIndex: st.soldPageIndex, 
            pageSize: st.state.soldPageSize, };
            if (editing) {
                data = { 
                    ticketId: ret["ticketId"], 
                    pageIndex: 1, 
                    pageSize: st.state.soldPageSize, 
                };
                this.setState({ soldPageIndex: 1, soldOrderList:[],});
                st.soldPageIndex = 1;
            } else {}
            NetUtil.ajax({
                url: '/mobileOrderService/initMySelledOrdersData.htm',
                data: data,
                success: (responseJson) => {
                    this.setState({ isLoading: false });
                    var responseData = responseJson;
                    if (responseData) {
                        if (responseData["status"] == 1) {
                            var data = responseData['data'];
                            if (data) {
                                var oData = data['ordersData'];
                                var orderList = [];
                                for (var i = 0; i < oData.length; i++) {
                                    var orderDetail = oData[i]['orderDetail'];
                                    var responseEnterpriseId=oData[i]['responseEnterpriseId'];// releaseEnterpriseId
                                    if (oData[i]['isCfr']=="1") {
                                        oData[i]['Cfr'] = '已包含运费';
                                    } else {
                                        oData[i]['Cfr'] = '未包含运费';
                                    }
                                    for (var j = 0; j < orderDetail.length; j++) {
                                        var tmpDetail = orderDetail[j];
                                        tmpDetail["orderCode"] = oData[i]["orderCode"];
                                        tmpDetail["Cfr"] = oData[i]["Cfr"];
                                        tmpDetail["responseEntName"] = oData[i]["responseEntName"];
                                        tmpDetail["releaseEntName"] = oData[i]["releaseEntName"];
                                        tmpDetail["wasteTypeCode"] = tmpDetail["wasteTypeCode"] ? tmpDetail["wasteTypeCode"] : "--";
                                        tmpDetail["wasteTypeDescription"] = tmpDetail["wasteTypeDescription"] ? tmpDetail["wasteTypeDescription"] : "--";
                                        tmpDetail["confirmedTime"] = oData[i]["confirmedTime"] ? oData[i]["confirmedTime"] : "--";
                                        tmpDetail["capacity_start_date"] = oData[i]["capacity_start_date"] ? oData[i]["capacity_start_date"] : "--";
                                        tmpDetail["capacity_end_date"] = oData[i]["capacity_end_date"] ? oData[i]["capacity_end_date"] : "--";
                                        if (parseInt(oData[i]["isHarmful"]) > 0) {
                                            tmpDetail["harmful"] = "是";
                                        } else {
                                            tmpDetail["harmful"] = "否";
                                        }                                        
                                        if (tmpDetail['operatingPartyPayment'] == '1') {
                                            tmpDetail['operatingPartyPaymentInfo'] = '经营方支付';
                                        } else {
                                            tmpDetail['operatingPartyPaymentInfo'] = '产废方支付';
                                        }
                                        tmpDetail['responseEnterpriseId']=responseEnterpriseId;
                                        //isHarmful
                                        orderList.push(tmpDetail);
                                    }
                                }
                                var solist = st.state.soldOrderList;
                                if(editing){
                                    solist = [];
                                }
                                if(orderList.length < 1){
                                }else{
                                    solist = solist.concat(orderList);
                                }
                                st.setState({
                                    soldDataSource: st.state.dataSource.cloneWithRows(solist),
                                    soldPageIndex:st.state.soldPageIndex+1,
                                    soldOrderList:solist,
                                    isLoadingTailSold:false
                                });
                            } else {}
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
    componentDidMount() {
        // console.log(1);
        // if(this.props.pagerIdx == 1){
        //     this.loadSoldData(false);
        // }else{
        //     this.loadData(false);
        // }
        this.loadData(false);
        this.loadSoldData(false);        
    }
    getEditAndComfirmButtonText() {
        if (this.state.editing == true) {
            return (<Text style={styles.editAndComfirmButtonText}>完成</Text>);
        } else {
            return (<Text style={styles.editAndComfirmButtonText}>编辑</Text>);
        }
    }
    onRefresh() {
        this.boughtOrderList = [];
        this.boughtPageIndex = 1;
        this.loadData(true);
    }
    onSoldRefresh(){
        this.soldPageIndex = 1;
        this.loadSoldData(true);
    }
    _renderTitleIndicator() {
        return <PagerTitleIndicator titles={['购买的订单', '卖出的订单']}
            style={{ marginTop: 0,backgroundColor:'#fff',borderColor:'#dce4f2',borderBottomWidth:1 }}
            itemTextStyle={styles.itemTextStyle}
            selectedItemTextStyle={styles.selectedItemTextStyle}
            selectedBorderStyle={styles.selectedBorderStyle} />;
    }
    goBack() {
        var { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    render() {
        return (
            <View style={styles.box}>
                <StatusBar barStyle="default" />
                <View style={styles.headBar}>
                    <TouchableHighlight activeOpacity={0.6} underlayColor={'transparent'} onPress={(text) => { this.goBack() }}>
                        <Image source={require('./images/navigator/nav_icon_backblue.png')} style={styles.headerLeftIcon} />
                    </TouchableHighlight>
                    <Text style={styles.headerTitle}>我的订单</Text>
                    {/*<Image source={require('./images/navigator/nav_icon_searchblue.png')} style={styles.headerRightIcon} />
                    <Image source={require('./images/navigator/nav_icon_scan.png')} style={styles.headerRightIcon} />*/}
                </View>
                <IndicatorViewPager
                    style={{ flex: 1, paddingTop: 0, backgroundColor: 'white', borderTopColor: '#e6ebf5', borderTopWidth: 0.5, borderBottomColor: '#dce4f2', borderBottomWidth: 0.5, }}
                    indicator={this._renderTitleIndicator()} initialPage={this.props.pagerIdx}>
                    <View style={{ backgroundColor: '#f7f8fa' }}>
                        <View style={styles.listBox}>
                            <ListView
                                dataSource={this.state.dataSource}
                                enableEmptySections = {true} 
                                refreshControl={
                                    <RefreshControl
                                        onRefresh={this.onRefresh.bind(this)}
                                        refreshing={this.state.isLoading}
                                        colors={['#ff0000', '#00ff00', '#0000ff']}
                                        enabled={true}
                                    />               
                                }
                                renderRow={(rowData, sectionID, rowID) =>
                                    <OrderListItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} isSold={false}/>
                                }
                                onEndReachedThreshold={10}
                                onEndReached={this._onBoughtEndReached.bind(this)}
                            />
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#f7f8fa' }}>
                        <View style={styles.listBox}>
                            <ListView
                                dataSource={this.state.soldDataSource}
                                refreshControl={
                                    <RefreshControl
                                        onRefresh={this.onSoldRefresh.bind(this)}
                                        refreshing={this.state.isLoading}
                                        colors={['#ff0000', '#00ff00', '#0000ff']}
                                        enabled={true}
                                    />
                                }
                                renderRow={(rowData, sectionID, rowID) =>
                                    <OrderListItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} isSold={true} />
                                }
                                onEndReachedThreshold={10}
                                onEndReached={this._onSoldEndReached.bind(this)}
                            />
                        </View>
                    </View>
                </IndicatorViewPager>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    teststyle: {
        color: 'red',
    },
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    listBox: {
        flex: 1,
        flexDirection: 'row',
    },
    headerTitle: {
        textAlign: 'center',
        color: '#2676ff',
        flex: 1,
        fontSize: 16,
        paddingRight:22,
    },
    cellBox: {
        flexDirection: 'column',
        flex: 1,
        marginTop: 10,
        backgroundColor: 'white',
    },
    cellBox_first: {
        flexDirection: 'row',
        flex: 7,
        marginBottom: 5,
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
    },
    cellText_Ent: {
        fontSize: 12,
        color: '#8f9fc1',
        textAlign: 'left',
        paddingLeft: 10,
        paddingTop: 15,
        paddingBottom: 10,
    },
    cellTextBox_left: {
        flexDirection: 'column',
        paddingLeft: 10,

    },
    cellTextBox_right: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,
        paddingBottom: 5,
    },
    cellTextBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
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
        color: '#8c9fbe',
        fontSize: 12,
        textAlign: 'left',
        paddingTop: 15,
        paddingRight: 16,
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
    },
    cellButtonTitle_wasteMethod: {
        fontSize: 14,
        color: '#6b7c99',
        paddingRight: 12,
        textAlign: 'right',
        paddingTop: 7,
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
        backgroundColor: 'white',
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
        height: 19,
        resizeMode: 'stretch'
    },
    inputText: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 14,
        color: '#293f66',
    },
    cellPriceBox: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingBottom: 12,
    },
    cellPriceLeftBox: {
        flexDirection: 'row',
        alignSelf: 'center',
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
        paddingRight: 60,
        fontSize: 14,
        color: "#ff4060",
    },
    entLogo: {
        width: 18,
        height: 20,
        marginLeft: 12,
        marginTop: 12,
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
    indicatorContainer: {
        height: 40,
        flexDirection: 'row',
        backgroundColor: 'white'
    },
    itemTextStyle: {
        color: '#6b7c99',
        fontSize: 14
    },
    selectedItemTextStyle: {
        color: '#2676ff',
        fontSize: 14
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedBorderStyle: {
        backgroundColor: '#2676ff',
        height:2,
        width: 83,
        position: 'absolute',
        bottom: 0,
        left: 0 + width/4 - 41,
        right: 0,
    }
});
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
    StatusBar,
    View,
    Platform,
    Button,
    TextInput,
    Alert,
    TouchableHighlight,
    TouchableOpacity,
    RefreshControl,
    DeviceEventEmitter,
    BackHandler,

} from 'react-native';

import Login from './Login';
import Header from './Header';
import DisposeBuyItem from './app/component/DisposeBuyItem'
import MessageCount from './app/component/MessageCount';
import Dialog from './app/component/dialog';
import NetUtil from './app/util/NetUitl'
import Toast, { DURATION } from 'react-native-easy-toast'
import { SwipeListView } from 'react-native-swipe-list-view';
import InfoCenter from './InfoCenter';

var newSingleShopList = [];

export default class DisposeBuy extends Component {

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2;
            }
        });
        // this.datas = props.singleShopList.slice(0);
        const { ticketId } = this.props;
        // alert(ticketId);
        this.state = {
            dataSource: ds,
            loaded: false,
            idx: 0,
            editing: false,
            loading: false,
            ticketId: ticketId,
            updateSuccess: false,
            isLoading: true,
            tip: '修改已生效',
            hasData: true,
            hasNetWork: true,
            statusText: '网络连接中断,请检查网络',
        };


    }
    async loadData(editing) {
        var st = this;
        newSingleShopList = [];
        this.setState({ isLoading: true, loading: editing });//loading: true,
        NetUtil.ajax({
            url: '/shoppingchartservice/displayshoppingcart',
            data: {
                ticketId: this.state.ticketId,
                enterpriseId: "",
            },
            success: (responseJson) => {

                var responseData = responseJson;
                if (responseData) {
                    if (responseData["status"] == 1) {

                        // console.log(responseData);
                        var ret = responseData.data.shoppingCartsData;
                        if (ret && ret.length > 0) {
                            st.setState({ hasData: true, hasNetWork: true, });
                            // this.setState({ loading: false, isLoading: false, hasNetWork: true, hasData: false,statusText:'暂无数据,', });
                            st.processResponseData(ret, editing);
                        } else {
                            st.setState({ hasData: false, });
                            this.setState({ loading: false, isLoading: false, hasNetWork: true, hasData: false, statusText: '暂无数据,', });
                        }

                    }
                }
            },
            error: (err) => {
                console.log(err);
                this.setState({ loading: false, isLoading: false, hasNetWork: false, hasData: false, statusText: '网络连接中断,请检查网络,', });
            }
        });


    }

    componentDidMount() {
        var st = this;
        this.loadData(false);
        DeviceEventEmitter.addListener('updateSuccess', function (text) {
            newSingleShopList = [];
            st.loadData(true);
            if (text == '更新') {
                st.setState({ tip: '修改已生效', });
            } else {
                st.setState({ tip: '删除成功', });
            }
        });
        //changeHomeTab
     DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
      if(text=="cart"){
        this.loadData(false);
      }
     });
     DeviceEventEmitter.addListener('toast',(text)=>{
      if(text){
        this.refs.toast.show(text);
      }
     });

    }


    componentWillReceiveProps(newProps) {

    }

    getEditAndComfirmButtonText() {
        if (this.state.editing == true) {
            return (<Text style={styles.editAndComfirmButtonText}>完成</Text>);
        } else {
            return (<Text style={styles.editAndComfirmButtonText}>编辑</Text>);
        }
    }
    onRefresh() {
        this.loadData(false);
    }


    processResponseData(ret, editing) {
        var st = this;
        newSingleShopList = [];
        st.setState({
            dataSource: st.state.dataSource.cloneWithRows([])
        });
        for (var i = 0; i < ret.length; i++) {
            var element = ret[i];
            if (element["isCfr"] == "1") {
                ret[i]["Cfr"] = "包含运费";
            } else {
                ret[i]["Cfr"] = "不含运费";
            }
            var shoppingDetails = element["shoppingDetails"];
            if (shoppingDetails) {
                if (shoppingDetails.length > 0) {
                    for (var j = 0; j < shoppingDetails.length; j++) {
                        shoppingDetails[j]["Cfr"] = ret[i]["Cfr"];
                        shoppingDetails[j]["releaseEntName"] = ret[i]["releaseEntName"];
                        shoppingDetails[j]["releaseEnterpriseId"] = ret[i]["releaseEnterpriseId"];

                        shoppingDetails[j]["createTime"] = shoppingDetails[j]["createTime"].substring(0, 10);
                        shoppingDetails[j]["index"] = j;
                        if (shoppingDetails[j]['operatingPartyPayment'] == '1') {
                            shoppingDetails[j]['operatingPartyPayment'] = true;
                            shoppingDetails[j]['operatingPartyPaymentInfo'] = '经营方支付';
                        } else {
                            shoppingDetails[j]['operatingPartyPayment'] = false;
                            shoppingDetails[j]['operatingPartyPaymentInfo'] = '产废方支付';
                        }
                        if (shoppingDetails[j]['amount']) {
                            var tmp = shoppingDetails[j]['amount'].split(",").join("");;
                            var amount = parseFloat(tmp).toFixed(3);
                            shoppingDetails[j]['amount'] = amount.toString();

                        }
                        shoppingDetails[j]["releaseUserPhone"] = ret[i]["releaseUserPhone"];
                        newSingleShopList.push(shoppingDetails[j]);
                    }
                }
            }
        }
        if (ret.length > 0) {
            st.setState({
                dataSource: st.state.dataSource.cloneWithRows(newSingleShopList), loading: false, isLoading: false,
                updateSuccess: editing
            });
            let seconds = 1;
            st.interval = setInterval(() => {
                if (seconds <= 0) {
                    clearInterval(st.interval);
                    st.setState({ updateSuccess: false, });
                    return;
                }
                seconds--;
            }, 1000);

        } else {


        }

    }
    async confirmDelOrder(index) {
        const { rowData, rowID, sectionID } = this.props;
        var st = this;
        setTimeout(function () {
            st.setState({ loading: true, });
        }, 100);
        storage.load({
            key: 'loginState',
        }).then(ret => {
            NetUtil.ajax({
                url: '/shoppingchartservice/deleteshoppingcart',
                data: {
                    ticketId: ret["ticketId"],
                    id: newSingleShopList[index]['id'],
                },
                success: (responseJson) => {
                    var responseData = responseJson;
                    if (responseData) {
                        // console.log(JSON.stringify(responseData));
                        if (responseData["status"] == 1) {
                            st.setState({ updateSuccess: true, tip: '删除成功！', });
                            st.loadData(false);
                        }
                    }
                },
                error: (err) => {
                    st.setState({ loading: false, });
                    console.log(err);
                    alert('请求出错!');

                }
            });
        }).catch(err => {
            st.setState({ loading: false, isLoading: false });
            alert('当前登录用户凭证已超时，请重新登录。');
            console.log(JSON.stringify(err));
        })
    }
    del(index) {
        var st = this;
        if(newSingleShopList[index]["plan_status"]) {
            switch (newSingleShopList[index]["plan_status"]) {
                case "SUBMIT":

                    break;
                case "REFUSED":
                    Alert.alert('提示', '该次报价单已经被谢绝，您不可以删除相关信息。', [
                        { text: '确认', onPress: () => this.cancle() }
                    ])
                    return;
                    // break;
                case "PROCESSED":

                    Alert.alert('提示', '该次报价单已经被确认，您不可以删除相关信息。', [
                        { text: '确认', onPress: () => this.cancle() }
                    ])
                    return;
                    // break;
                default:
                    break;
            }
        }
        Alert.alert('提示', '你即将从报价单中删除这一次产品报价，\n是否要继续', [
            { text: '取消', onPress: () => this.cancle(index), style: 'cancel' },
            { text: '确认', onPress: () => this.confirm(index) }
        ])
    }
    edit(index) {

        if(newSingleShopList[index]["plan_status"]) {
            switch (newSingleShopList[index]["plan_status"]) {
                case "SUBMIT":

                    break;
                case "REFUSED":
                    Alert.alert('提示', '该次报价单已经被谢绝，您不可以编辑相关信息。', [
                        { text: '确认', onPress: () => this.cancle() }
                    ])
                    return;
                    // break;
                case "PROCESSED":

                    Alert.alert('提示', '该次报单已经被确认，您不可以编辑相关信息。', [
                        { text: '确认', onPress: () => this.cancle() }
                    ])
                    return;
                    // break;
                default:
                    break;
            }
        }

        this.setState({ tip: '修改成功', });
        DeviceEventEmitter.emit('editShopcart', index);
    }
    cancle(index) {


    }
    confirm(index) {

        this.confirmDelOrder(index);
        DeviceEventEmitter.emit('endEditShopcart', index);

    }
    gotoMessageList() {
        var { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'InfoCenter',
                component: InfoCenter,
                params: {
                    ticketId: this.state.ticketId
                }
            });
        }
    }
    render() {
        return (

            <View style={styles.box}>

                <StatusBar barStyle="light-content" />

                <View style={styles.headBar}>
                    <Text style={styles.headerTitle}>报价单</Text>
                    <View style={{ paddingBottom: 10, }}>
                        <MessageCount navigator={this.props.navigator} />
                    </View>
                </View>
    
                

                {this.state.hasData ? <View style={styles.listBox}>

                    <SwipeListView style={{flex:1,}}
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
                        renderRow={(rowData, sectionID, rowID) =>
                            <DisposeBuyItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} ref='item' />

                        }
                        renderHiddenRow={(data, secId, rowId, rowMap) => (
                            <View style={styles.rowBack}>
                                <Text>左</Text>
                                {/*<View style={[styles.backRightBtn, styles.backRightBtnLeft]}>*/}
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={_ => { rowMap[`${secId}${rowId}`].closeRow(); this.edit(rowId); }}>
                                    <Text style={styles.backTextWhite}>编辑</Text>
                                </TouchableOpacity>
                                {/*</View>*/}
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={_ => { rowMap[`${secId}${rowId}`].closeRow(); this.del(rowId); }}>
                                    <Text style={styles.backTextWhite}>删除</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        disableRightSwipe={true}
                        recalculateHiddenLayout={true}
                        swipeToOpenPercent={20}
                        rightOpenValue={-150}
                    />
                </View> :
                    <TouchableOpacity style={styles.box} onPress={_ => {
                        this.loadData(true);
                    }}>

                        <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                            {this.state.hasNetWork ?
                                <Image source={require('./images/error/bg_暂无数据.png')} style={{ top: 66, alignSelf: 'center', width: 207, height: 192, }} />
                                :
                                <Image source={require('./images/error/bg_网络连接中断.png')} style={{ top: 66, alignSelf: 'center', width: 207, height: 192, }} />
                            }

                            <Text style={{ textAlign: 'center', color: '#8c9dbf', top: 104, }}>{this.state.statusText}</Text>
                            <View style={{ top: 116, flexDirection: 'row', }}>
                                <Text style={{ textAlign: 'center', color: '#8c9dbf', }}>轻点屏幕重试</Text><Image style={{ width: 16, height: 16, marginLeft: 4, marginTop: 0, }} source={require('./images/error/common_icon_refresh.png')} />
                            </View>
                        </View>

                    </TouchableOpacity>}

                {this.state.loading ? <Image style={styles.loadImage} resizeMode={Image.resizeMode.contain} source={require('./images/base/load.gif')} /> : null}
                {this.state.updateSuccess ? <Dialog type="success" title='提示' tip={this.state.tip} /> : null}
                <Toast ref="toast"/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    loadImage: {
        position: 'absolute',
        top: 250,
        alignSelf: 'center',
    },
    listBox: {
        flex: 1,
        // padding:10,
        flexDirection: 'row',

    },
    headerTitle: {
        textAlign: 'center',
        color: 'white',
        flex: 1,
        fontSize: 16,
        marginLeft: 44,

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
        // justifyContent: 'space-between',

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
        // borderLeftColor:'#6edce0',
        // borderLeftWidth:1,

    },
    cellText_Ent: {
        fontSize: 12,
        color: '#8f9fc1',
        // flex:8,
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
        // marginTop:-12,
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
        paddingTop: 14,
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
        width: 20,
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
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingBottom: 12,
        //  borderStyle:'dashed', RN不支持这个属性
        //  borderTopWidth:1,
        //  borderTopColor:'#e6ebf5',
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
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 10,
        width: 75
    },
    backRightBtnLeft: {
        backgroundColor: '#cad5e6',
        right: 75
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0
    },
    cellButtonDel: {
        backgroundColor: '#cad5e6',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: 153,
    },
    cellButtonEdit: {
        backgroundColor: "#2676ff",
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',

    },
    backTextWhite: {
        color: '#FFF'
    },

});
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
    TimerMixin,
    TouchableHighlight,
    TouchableOpacity,
    Dimensions,
    DeviceEventEmitter,
    Switch,
    NativeModules,

} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Header from './Header';
import NetUtil from '../util/NetUitl';
import Toast, { DURATION } from 'react-native-easy-toast'
const {NimModule} = NativeModules;
import OfflineMessageView from '../OfflineMessageView';
import contactList from '../ContactList';
import CollapsibleText from './CollapsibleText';

var { width, height, scale } = Dimensions.get('window');
var widths = Dimensions.get('window').width;
var downTextWidth = widths - 100;
// const TYPE_OPTIONS = ['处置','利用','清洗','收集','水泥窑共处置'];
const dispositionTypes = [];
const TYPE_OPTIONS = [];
const _options = [];
const _options_id = [];
var pattern=/^(?=([0-9]{1,10}$|[0-9]{1,7}\.))(0|[1-9][0-9]*)(\.[0-9]{1,3})?$/;

export default class DisposeBuyItem extends Component {
    static get defaultProps() {
        return {
            todos: [],

        }
    }
    static propTypes = {
        todos: React.PropTypes.array.isRequired,

    }
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        // this.datas = props.todos.slice(0);
        const { rowData, rowID, sectionID } = this.props;

        this.state = {
            dataSource: ds,
            loaded: false,
            idx: -1,
            editing: false,
            show: false,
            price: parseFloat(rowData.price),
            reamrk: rowData.remark,
            rowIndex: 0,
            allAmount: parseFloat(rowData.amount).toFixed(3),
            isSelfPay: rowData.operatingPartyPayment,
            accId: rowData.releaseUserPhone,
            localQty:parseFloat(rowData.quantity).toFixed(3),
            localPrice:parseFloat(rowData.price).toFixed(3),
        };


    }
    componentWillMount() {
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.loadData(ret['ticketId']);
        }).catch(err => {
            alert('当前登录用户凭证已超时，请重新登录。');
        })

    }


    /**
     * 检查聊天对象企业的联系人数量
     * 
     * @memberof CFDetailScreen
     */
    checkContacts() {
        console.log("订单详情：开始检查企业联系人数量,企业ID为"+this.props.rowData.releaseEnterpriseId);
        // const { rowData ,isSold} = this.props;
        // var entId = '';
        // if(isSold){
        //     entId = rowData["responseEnterpriseId"]?rowData["responseEnterpriseId"]:'';
        // }else{
        //     entId = rowData["releaseEnterpriseId"]?rowData["releaseEnterpriseId"]:'';
        // }
        
        NetUtil.ajax({
            url:'/userservice/getEnterpriseContacts',
            data:{
                enterpriseId:this.props.rowData.releaseEnterpriseId,
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
                    enterName:this.props.rowData.releaseEntName,
                }
            });
        }
    };

    showChatView() {
        NetUtil.ajax({
            url:'/userservice/getUserAdminByEnterId.htm',
            data:{
                enterpriseId:this.props.rowData.releaseEnterpriseId,
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
    }
    OfflineMessageView(){
        const {navigator} = this.props;
                    if(navigator){
                        navigator.push({
                            name:'OfflineMessageView',
                            component:OfflineMessageView,
                            params:{
                                navigator:navigator,
                                ticketId:this.props.ticketId,
                                rowData:this.props.rowData,
                                entId:this.props.rowData.releaseEnterpriseId,
                            }
                        }) //
                    }
    }
    checkEditState(index) {
        // console.log('checkedit ' + index + ' ' + this.state.rowIndex + ' ' + this.state.editing)
        if (index == this.state.rowIndex) {
            if (this.state.editing) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    editingOrder(index) {
        var st = this;
        if(pattern.test(st.state.price)){

        }else{
            // ToastAndroid.show("您输入的单价有误，请重新输入!",ToastAndroid.SHORT);
            DeviceEventEmitter.emit('toast',"您输入的单价有误，请重新输入!");
            return;
        }
        
        st.setState({ editing: false, idx: index });

        setTimeout(function () {

            if (st.state.editing) {

            } else {
                if (st.state.idx < 0) {
                    // ToastAndroid.show("请选择处置方式!",ToastAndroid.SHORT);
                    DeviceEventEmitter.emit('toast',"您还未选择处置方式");
                } else {
                    if (st.state.price < 0) {
                        // ToastAndroid.show("单价必须不小于0!",ToastAndroid.SHORT);
                        DeviceEventEmitter.emit('toast',"单价不可以小于0");

                    } else {
                        st.comfirmUpdateOrder(index);
                    }
                }

            }
        }, 100);

    }
    comfirmEdit(index) {
        this.editingOrder(this.state.idx);
    }
    async comfirmUpdateOrder(index) {
        const { rowData, rowID, sectionID } = this.props;
        var st = this;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            NetUtil.ajax({
                url: '/shoppingchartservice/updateshoppingcart',
                data: {
                    ticketId: ret["ticketId"],
                    amount: st.state.allAmount,
                    dispositionTypId: _options_id[st.state.idx],
                    price: st.state.price,
                    remark: st.state.reamrk,
                    id: rowData['id'],
                    operatingPartyPayment: st.state.isSelfPay?"1":"0",
                },
                success: (responseJson) => {
                    var responseData = responseJson;
                    if (responseData) {
                        console.log('update' + JSON.stringify(responseData));
                        if (responseData["status"] == 1) {
                            // st.setState({ idx: -1 });//重置下拉框选择项 不需要额外重置 数据源若稳定
                            DeviceEventEmitter.emit('updateSuccess', '更新');
                        }
                    }
                },
                error: (err) => {
                    DeviceEventEmitter.emit('toast',"网络异常,请重试!");
                    console.log(err);

                }
            });
        }).catch(err => {
            alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    async confirmDelOrder() {
        const { rowData, rowID, sectionID } = this.props;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            NetUtil.ajax({
                url: '/shoppingchartservice/deleteshoppingcart',
                data: {
                    ticketId: ret["ticketId"],
                    id: rowData['id'],
                },
                success: (responseJson) => {
                    var responseData = responseJson;
                    if (responseData) {
                        // console.log(JSON.stringify(responseData));
                        if (responseData["status"] == 1) {
                            DeviceEventEmitter.emit('updateSuccess', '删除');
                        }
                    }
                },
                error: (err) => {
                    DeviceEventEmitter.emit('toast',"网络异常,请重试!");
                    console.log(err);

                }
            });
        }).catch(err => {
            alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    del(index) {
        var st = this;
        Alert.alert('提示', '你即将从购物车中删除一笔购买，\n是否要继续', [
            { text: '取消', onPress: () => this.cancle(index), style: 'cancel' },
            { text: '确认', onPress: () => this.confirm(index) }
        ])
    }
    cancle(index) {
        // Alert.alert('你点了取消');
        this.setState({ editing: false });

    }
    confirm(index) {
        // console.log('右侧按钮点击了');  
        this._setModalVisible();
        this.setState({ editing: false });
        this.confirmDelOrder(index);
    }
    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }
    getEditAndComfirmButtonText() {
        // alert(this.state.editing);
        if (this.state.editing == true) {
            return (<Text style={styles.editAndComfirmButtonText}>完成</Text>);
        } else {
            return (<Text style={styles.editAndComfirmButtonText}>编辑</Text>);
        }
    }
    dropdownSelect(idx) {
        // console.log(idx);
        const { rowData, rowID, sectionID } = this.props;

        // console.log(rowID);
        var value = '';
        if (idx >= 0) {
            value = TYPE_OPTIONS[idx].toString();
        }
        this.setState({
            buttonText: value,
            idx: idx,
        });
    }
    dropdown_renderRow(rowData, rowID, highlighted) {
        let icon = highlighted ? require('../../images/dropdown/heart.png') : require('../../images/dropdown/flower.png');
        let evenRow = rowID % 2;
        if (TYPE_OPTIONS.length < 1) {
            return (
                <View></View>);
        }
        return (
            <TouchableOpacity underlayColor='cornflowerblue'>
                <View style={[styles.dropdown_row, { backgroundColor: evenRow ? '#e0e4eb' : 'white' }]}>
                    <Text style={[styles.dropdown_row_text, highlighted && { color: 'mediumaquamarine' }]}>
                        {`${rowData}`}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
        if (rowID == TYPE_OPTIONS.length - 1) return;
        if (TYPE_OPTIONS.length < 1) return;
        let key = `spr_${rowID}`;
        return (<View style={styles.dropdown_2_separator} key={key} />);
    }

    onRemarkTextChange(text){
        // this.setState({reamrk:text});
    }

    changeSinglePrice(price) {
        const { rowData, rowID, sectionID } = this.props;
        var pri = 0;
        if (price.length < 1) {
            price = '';
            pri = 0;
        }else{
            pri = parseFloat(price);
        }
        var st = this;
        st.setState({ allAmount: (pri * st.state.localQty).toFixed(3), localPrice: pri,price:price });
    }
    onQtyChangeText(amount){
        const { rowData, rowID, sectionID } = this.props;
        var tmp_amount = 0;
        if (amount.length < 1) {
            amount = '';
            tmp_amount = 0;
        }else{
            tmp_amount = parseFloat(amount).toFixed(3);
        }
        var st = this;
        st.setState({ allAmount: (st.state.localPrice * amount).toFixed(3), qty: amount,localQty:tmp_amount });
    }
    componentDidMount() {
        var st = this;
        DeviceEventEmitter.addListener('editShopcart', function (index) {
            setTimeout(function () {
                st.setState({ rowIndex: index, editing: true });
            }, 100);
            // console.log('emit edit' + st.state.editing);endEditShopcart
        });
        DeviceEventEmitter.addListener('endEditShopcart', function (index) {
            setTimeout(function () {
                st.setState({ rowIndex: index, editing: false });
            }, 100);
            // console.log('emit edit' + st.state.editing);
        });
    }
    async loadData(ticketId) {
        const { rowData, rowID, sectionID } = this.props;
        var st = this;
        //    console.log(ticketId+''+rowData['wasteCode']);
        NetUtil.ajax({
            url: '/shoppingchartservice/getdispositiontypes',
            data: {
                ticketId: ticketId,
                wasteCode: rowData['wasteCode'],
            },
            success: (responseJson) => {
                var responseData = responseJson;
                if (responseData) {
                    // console.log(JSON.stringify(responseData));
                    if (responseData["status"] == 1) {
                        var listType = responseData["data"]["listDispositionType"];
                        _options = [];
                        _options_id = [];
                        for (var i = 0; i < listType.length; i++) {
                            _options.push(listType[i]["dispositionTypeLabel"]);
                            _options_id.push(listType[i]["dispositionTypeId"]);
                        }
                        TYPE_OPTIONS = _options;
                        if (_options.length > 0) {
                            st.setState({ idx: 0 });
                        } else {
                            st.setState({ idx: -1 });
                        }
                    }
                }
            },
            error: (err) => {
                // DeviceEventEmitter.emit('toast',"网络异常,请重试!");
                console.log(err);

            }
        });
    }
    renderCartStatusText() {
        const { rowData, rowID, sectionID } = this.props;
        var statusText = "";
        var statusStyle = {};
        switch (rowData["plan_status"]) {
            case "SUBMIT":
                statusText = "待反馈";
                statusStyle =  styles.cellText_status_submitted ;
                break;
            case "REFUSED":
                statusText = "已谢绝";
                statusStyle =  styles.cellText_status_refused ;

                break;
            case "COLSED":
                statusText = "已关闭";
                statusStyle =  styles.cellText_status_refused ;

                break;                
            case "ACCEPT":
                statusText = "已确认";
                statusStyle =  styles.cellText_status_processed ;

                break;
            case "PROCESSED":
                statusText = "已被他方认购";
                statusStyle =  styles.cellText_status_processed ;
                break;
            
            default:
                break;
        }

        return (<Text numberOfLines={3} style={statusStyle}>{statusText}</Text>);
    }
    render() {
        const { rowData, rowID, sectionID } = this.props;
        let editContent;
        var dropdownDefaultValue = '';
        if (TYPE_OPTIONS.length > 0) {
            dropdownDefaultValue = TYPE_OPTIONS[0];

        } else {

        }
        if(rowData.price){
            rowData.price = parseFloat(rowData.price).toFixed(3);
        }
        if(rowData.amount){
            rowData.amount = parseFloat(rowData.amount).toFixed(3);
        }
        return (
            <View style={styles.listBox}>

                <View style={styles.cellBox}>
                    <View style={styles.splitLineTop}></View>
                    <View style={styles.cellBox_first}>
                        <View style={{ flexDirection: 'row', flex: 10, }}>
                            <Image source={require('../../images/shopcart/commom_icon_logo.png')} style={styles.entLogo}>

                            </Image>
                            <Text style={styles.cellText_Ent}>

                                {rowData.releaseEntName}</Text>
                        </View>

                        <Text style={styles.cellText_time}>{rowData.createTime}</Text>
                        {this.renderCartStatusText()}

                    </View>
                    <View style={styles.splitLine}></View>
                    <View style={styles.cellTextBox}>

                        <View style={styles.cellTextBox_left}>

                            <Text style={styles.cellText_wasteName} numberOfLines={3}>{rowData.wasteName}</Text>
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
                    <View style={styles.splitLine}></View>
                    <View style={styles.cellTextBox}>
                        {!this.checkEditState(rowID) ?
                            <View style={{ flexDirection: 'row', }}>
                                <View style={[styles.cellPriceLeftBox]}>
                                    <Text style={{ color: "#6b7c99", fontSize: 13, paddingLeft: 10, paddingTop: 1, }}>单价:</Text>
                                    <Text style={styles.cellPriceLeftText}>￥ {rowData.price}</Text>
                                </View>
                            </View> :
                            <View style={{ flexDirection: 'row', }}>

                            </View>


                        }
                        <Image source={require('../../images/common_dashline1x66.png')}
                            style={{ height: 42, width: 0.5, marginTop: 4, marginBottom: 4, marginLeft: 44, }} />

                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 5, }}>
                            <Text style={styles.cellButtonTitle_wasteNumText}>数量:</Text>
                            <Text style={styles.cellButtonTitle_wasteWeight}>{rowData.quantity}{rowData.unitValue}</Text>

                        </View>
                    </View>
                    <View>
                        <Image source={require('../../images/common_dashline.png')} style={{ height: 0.5, width: widths, marginLeft: 0, marginRight: 12, }} />
                    </View>

                    {!this.checkEditState(rowID) ?
                        <View style={styles.cellPriceBox}>
                            <View style={styles.cellPriceRightBox}>
                                <Text style={{ color: "#6b7c99", fontSize: 13, paddingTop: 12, marginRight: 8, textAlign: 'right', }}>总额:</Text>
                                <View style={styles.cellPriceRightRightBox}>
                                    <Text style={styles.cellPriceRightText}>￥ {rowData.amount}</Text>
                                    <Text style={{ color: "#293f66", fontSize: 10, paddingTop: 2, paddingBottom: 4, paddingRight: 12, }}>({rowData.Cfr} {rowData.operatingPartyPaymentInfo})</Text>
                                                                                   {/*Android only*/}
                                </View>
                            </View>
                            
                            <View>
                                <Image source={require('../../images/common_dashline.png')} style={{ height: 0.5, width: widths, marginLeft: 0, marginRight: 12, }} />
                            </View>
                            
                            {rowData.remark?<View style={styles.cellPriceRightBox}>
                                {/* <Text style={{ color: "#6b7c99", fontSize: 13, paddingTop: 12, marginRight: 8, textAlign: 'left', }}>我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊我是备注啊</Text> */}
                                <CollapsibleText numberOfLines={3}>{rowData.remark}</CollapsibleText>
                            </View>:<View/>
                            }
                            
                        </View> :
                        <View style={styles.form}>
                            <View style={styles.form_info}>
                                <Text style={styles.form_title}>处置方式</Text>
                                <View style={styles.input_view}>
                                    <ModalDropdown style={styles.dropdown}
                                        textStyle={[styles.dropdown_text, { width: downTextWidth }]}
                                        defaultValue={TYPE_OPTIONS[0] || '--'}
                                        dropdownStyle={[styles.dropdown_dropdown, { width: downTextWidth + 8 }]}
                                        options={TYPE_OPTIONS}
                                        onSelect={(idx) => this.dropdownSelect(idx)}
                                        renderRow={this.dropdown_renderRow.bind(this)}
                                        renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this.dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                                    />
                                    <Image style={styles.down_arrow} resizeMode={Image.resizeMode.contain} source={require('../../images/base/commom_icon_arrowdown.png')} />
                                </View>
                            </View>
                            <View style={styles.form_info}>
                                <Text style={styles.form_title}>单价</Text>
                                <View style={[styles.input_view, styles.input_view_price]}>
                                    <TextInput underlineColorAndroid={"transparent"} 
                                    placeholder="输入新的单价金额(最多3位小数)" 
                                    style={[styles.input_price]} keyboardType={'numeric'}
                                        value={'' + this.state.price} onChangeText={(text) => this.changeSinglePrice(text)} />
                                    <View style={styles.input_title_view}><Text style={styles.input_title}>￥</Text></View>
                                </View>
                            </View>
                            <View style={styles.tipView}>
                                {/*<Text style={styles.tipLeft}>产废企业默认</Text>*/}
                                <Text style={styles.tipRight}>{rowData.Cfr}</Text>
                            </View>

                            <View style={styles.form_info_remark}>
                                <Text style={styles.from_title}>备注</Text>
                                {/* <View style={styles.input_view}>
                                    <TextInput style={styles.input_price}></TextInput>
                                </View> */}

                                <TextInput underlineColorAndroid={"transparent"} 
                                            selectionColor={'#284173'} 
                                            style={[styles.remarkInput]} 
                                            value={rowData.remark}
                                            textAlignVertical = 'top'
                                            multiline={true}
                                            onChangeText={(text) => this.onRemarkTextChange(text)}>
                                        
                                </TextInput>
                     
                            </View>

                            <View style={styles.tipRightLast}>
                                <Text style={{ color: '#294171', marginRight: 10 }}>经营方支付
                                 </Text>
                                <Switch
                                    onValueChange={(value) => this.setState({ isSelfPay: value })}
                                    onTintColor='#246eeb'
                                    value={this.state.isSelfPay} />
                            </View>

                            <View style={styles.form_total_btn} width={widths}>
                                <View style={styles.form_total_left}>
                                    <Text style={styles.total_price_title}>总额:</Text>
                                    <View>
                                        <Text numberOfLines={2} style={styles.total_price}>￥{this.state.allAmount}</Text>
                                        <Text style={styles.total_price_tip}>({rowData.Cfr} {this.state.isSelfPay ? "经营方支付" : "产废方支付"})</Text>
                                    </View>
                                </View>
                                <View style={[styles.chart_view, { borderRightWidth: 1 }]}>
                                    <TouchableOpacity style={[styles.btn_touch, { width: widths * 0.33 }]} onPress={this.checkContacts.bind(this)}>
                                        <Image style={[styles.chart_btn]} resizeMode={Image.resizeMode.contain} source={require('../../images/message/common_icon_chat.png')} />
                                        <Text style={styles.chat_title}>咨询</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={this.comfirmEdit.bind(this, rowData.index)}><View
                                    style={styles.del_btn}><Text style={styles.del_btn_text}>完成</Text></View></TouchableOpacity>
                            </View>
                        </View>
                    }
                    <Toast ref="toast" position="top"/>
                    <View style={styles.splitLineBottom}></View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    listBox: {
        // flex: 1,
        // padding:10,
        flexDirection: 'row',

    },
    headerTitle: {
        textAlign: 'center',
        color: 'white',
        flex: 1,
        fontSize: 16,

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
        justifyContent: 'space-between',

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
        color: '#293f66',
        // flex:8,
        textAlign: 'left',
        paddingLeft: 10,
        marginTop: 15,
        paddingBottom: 10,

    },
    cellTextBox_left: {
        flexDirection: 'column',
        paddingLeft: 10,
        flex: 7,


    },
    cellTextBox_right: {
        flexDirection: 'row',
        // alignItems: 'flex-end',
        flex: 1,
        // marginTop:-12,

        paddingBottom: 5,

    },
    cellTextBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        textAlign: 'right',
        marginTop: 15,
        flex: 5,
        // paddingRight: 16,
        marginRight: 12,
        // borderLeftWidth:1,
        // borderColor:'#99a8bf',
        // paddingLeft:8,

    },
    cellText_status_submitted: {
        color: '#16d2d9',
        fontSize: 11,
        width: 40,
        height: 18,
        borderWidth: 1,
        borderColor: '#16d2d9',
        borderRadius: 2,
        textAlign: 'center',
        marginRight: 12,
        lineHeight:(Platform.OS === "ios")?15:18,
        marginTop:12,
    },
    cellText_status_refused: {
        color: '#6b7c99',
        fontSize: 11,
        width: 40,
        height: 18,
        borderWidth: 1,
        borderColor: '#99a8bf',
        flex: 2,
        borderRadius: 2,
        textAlign: 'center',
        marginRight: 12,
        lineHeight:(Platform.OS === "ios")?15:18,
        marginTop:12,
    },
    cellText_status_processed: {
        color: '#2676ff',
        fontSize: 11,
        width: 40,
        height: 18,
        borderWidth: 1,
        borderColor: '#2676ff',
        flex: 2,
        borderRadius: 2,
        textAlign: 'center',
        marginRight: 12,
        lineHeight:(Platform.OS === "ios")?15:18,
        marginTop:12,
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
    remarkInput:{
        flex:1,
        height:100,
        lineHeight:20,
        fontSize:15,
        paddingLeft:10,
        paddingRight:10,
        // alignItems:'flex-start',
        flexDirection:'column',
        // maxLength:'500',
        marginTop:10,
        borderWidth:1,
        borderColor:'#cad5e6',
        borderRadius:3,
        paddingTop:10,
        backgroundColor:'#FFF',
        // paddingLeft:30,
        paddingBottom:10,
    },
    cellButtonTitle_wasteNumText: {
        fontSize: 13,
        color: '#6b7c99',
        flex: 8,
        textAlign: 'right',
        paddingRight: 12,
        paddingBottom: 1,
        paddingTop: 1,

    },
    cellButtonTitle_wasteWeight: {
        fontSize: 14,
        color: '#293f66',
        paddingLeft: 6,
        paddingRight: 8,
        textAlign: 'right',
        // flex:4,

    },

    cellButtonTitle_wasteMethod: {
        fontSize: 14,
        color: '#6b7c99',
        marginRight: 12,
        textAlign: 'right',
        paddingTop: 7.5,
        // flex:4,

    },

    cellButtonTitle_wasteUnitText: {
        fontSize: 14,
        flex: 4,
        color: '#6b7c99',
        textAlign: 'left',
        paddingBottom: 2,
        paddingRight: 16,

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
        // flex: 6,
        justifyContent: 'flex-end',
        alignItems:'flex-end',
        // flexDirection: 'column',
        //  borderStyle:'dashed', RN不支持这个属性
        //  borderTopWidth:1,
        //  borderTopColor:'#e6ebf5',
    },
    cellPriceLeftBox: {
        flexDirection: 'row',
        alignSelf: 'center',


    },
    cellPriceRightBox: {
        flexDirection: 'row',
        paddingBottom: 12,
        // paddingTop: 2,
    },
    cellPriceRightRightBox: {
        flexDirection: 'row',
        paddingLeft: 4,
        paddingTop: 12,

    },
    cellPriceLeftText: {
        paddingLeft: 12,
        fontSize: 14,
        // flex:1,
        paddingBottom: 1,
        textAlign: 'center',
        color: "#293f66",
    },
    cellPriceRightText: {
        paddingRight: 4,
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
        // color: '#2676ff',
        textAlign: 'center',
        paddingTop: 11,
        // marginRight:12,
    },
    form: {
        backgroundColor: '#f7f8fa',
        borderTopWidth: 1,
        borderTopColor: '#e9edf7',
        borderBottomWidth: 1,
        borderBottomColor: '#e9edf7',
        paddingTop: 20,
    },
    form_info: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
    },
    form_info_remark: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
    },
    input_view: {
        flexDirection: 'row',
        // marginBottom:20,
        alignItems: 'center',
        flex: 2
    },
    input_view_price: {
        marginBottom: 8,
    },
    form_title: {
        color: '#284173',
        fontSize: 15,
        width: 70,
        textAlign: 'right',
        marginRight: 10
    },
    down_arrow: {
        position: 'absolute',
        right: 5,
        width: 20,
        height: 20,
        top: 10,
    },
    input_title_view: {
        position: 'absolute',
        left: 10,
        top: 15,
        height: 28,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    input_title: {
        fontSize: 16
    },
    input_price: {
        flex: 1,
        backgroundColor: '#fff',
        height: 40,
        lineHeight: 40,
        fontSize: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#cad5e6',
        borderRadius: 3,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30
    },
    tipView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 75,
    },
    tipLeft: {
        color: '#99a8bf',
        fontSize: 13
    },
    tipRight: {
        color: '#16d2d9',
        fontSize: 13
    },
    tipRightLast: {
        marginLeft: 40,
        marginTop: 8,
        flexDirection: 'row',
        alignSelf: 'flex-end',
        alignItems: 'center',
        marginRight: 20,
    },
    totalprice_view: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 45,
        paddingRight: 45,
        paddingTop: 10,
        paddingBottom: 10
    },
    dropdown: {
        flex: 1,
        backgroundColor: '#fff',
        height: 40,
        // paddingLeft: 10,
        // marginTop:0,
        borderWidth: 1,
        borderColor: '#cad5e6',
        borderRadius: 3,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'flex-end'
    },
    dropdown_text: {
        fontSize: 14,
        color: '#99a8bf',

        textAlign: 'left',
        height: 32,
        lineHeight: 32,
        marginTop: -8,
    },
    dropdown_dropdown: {
        borderColor: '#cad5e6',
        borderWidth: 1,
        borderRadius: 3,
        height: 200,
        justifyContent: 'flex-end',
        marginLeft: -7
    },
    dropdown_row: {
        flex: 1,

        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
    },
    dropdown_row_text: {
        flex: 1,
        marginHorizontal: 4,
        fontSize: 16,
        color: '#909bb0',
        textAlignVertical: 'center',
        textAlign: 'left'
    },
    form_total_btn: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 60,
        paddingLeft: 40,
        backgroundColor: '#fff',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e9edf7',
    },
    form_total_left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    total_price_title: {
        color: '#293f66',
        fontSize: 14,
        marginRight: 5,
    },
    total_price: {
        color: '#ff4060',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
        marginBottom: 2,
        
    },
    total_price_tip: {
        color: '#293f66',
        fontSize: 10,
        paddingRight: 1,
    },
    del_btn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        width: 100,
        backgroundColor: '#2676ff',
        height: 60,
    },
    del_btn_text: {
        color: '#fff'
    },
    chart_view: {
        width: 80,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#f7f8fa',
        borderTopWidth: 1,
        backgroundColor: '#fff',
        borderLeftWidth: 1
    },
    chart_btn: {
        width: 20,
        height: 20,
        marginBottom: 5
    },
    chat_title: {
        color: '#6b7c99',
        fontSize: 13
    },
    btn_touch: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
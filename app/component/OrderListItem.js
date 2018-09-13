/**
 * Created by zhangl on 17/03/23.
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
    ToastAndroid
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Header from './Header';
import PubAndEvaluate from '../../PubAndEvaluate';


var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var downTextWidth = widths - 180;
export default class OrderListItem extends Component {
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

        this.state = {
            dataSource: ds,
            loaded: false,
            idx: 0,
            editing: false,
        };


    }
    editingOrder(index) {
        this.setState({ editing: !this.state.editing, idx: index });
    }
    del(index) {
        var st = this;
        Alert.alert('提示', '你即将从订单历史中删除这条订单，\n是否要继续', [
            { text: '取消', onPress: () => this.cancle(index), style: 'cancel' },
            { text: '确认', onPress: () => this.confirm(index) }
        ])
    }
    cancle(index) {
        // Alert.alert('你点了取消');
        this.editingOrder(index);
    }
    confirm(index) {
        // Alert.alert('你点了确认');
        this.editingOrder(index);
    }
    checkEvaluate(index) {
        var { navigator } = this.props;
        const { rowData, rowID, sectionID,isSold } = this.props;
        if (navigator) {
            navigator.push({
                name: 'PubAndEvaluate',
                component: PubAndEvaluate,
                params: {
                    rowData: rowData,
                    isSold:isSold,

                }
            });
        }
    }
    getEditAndComfirmButtonText() {
        // alert(this.state.editing);
        if (this.state.editing == true) {
            return (<Text style={styles.editAndComfirmButtonText}>完成</Text>);
        } else {
            return (<Text style={styles.editAndComfirmButtonText}>编辑</Text>);
        }
    }


    render() {
        const { rowData, rowID, sectionID,isSold } = this.props;
        let editContent;
        if (this.state.editing) {

        }
        return (
            <TouchableOpacity onPress={this.checkEvaluate.bind(this, rowData.index)}>
            <View style={styles.listBox}>
                
                <View style={styles.cellBox}>
                    <View style={styles.splitLineTop}></View>
                    <View style={styles.cellBox_first}>
                        <Image source={require('../../images/shopcart/commom_icon_logo.png')} style={styles.entLogo}>

                        </Image>
                        <Text style={styles.cellText_Ent}>

                            {rowData.orderCode}</Text>
                        <Text style={{width: 6, color: '#99a8bf', fontSize: 18, paddingTop: 11, marginLeft: 6, marginRight: 6, }}>|</Text>
                        {isSold?<Text style={styles.cellText_time}>{rowData.responseEntName}</Text>
                        :<Text style={styles.cellText_time}>{rowData.releaseEntName}</Text>
                        }
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

                {isSold?null:
                    <View style={styles.cellBottomOptBox}>
                        {rowData.orderValuation?
                             <View style={[styles.delOrder_btn_second,{borderWidth:0}]}><Text style={styles.delOrder_btn_text}>已评价</Text></View>:
                             <View style={[styles.delOrder_btn_second]}><Text style={styles.delOrder_btn_text}>评价</Text></View>
                         }
                    </View>
                }
                    <View style={styles.splitLineBottom}></View>
                </View>
                
            </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
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
        color: '#293f66',
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
        paddingBottom: 10,

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
        color: '#293f66',
        fontSize: 12,

        textAlign: 'left',
        paddingTop: 16.0,
        paddingRight: 16,
        paddingBottom: 10,
        flex:1
        // borderLeftWidth:1,
        // borderColor:'#99a8bf',
        // paddingLeft:8,

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
        justifyContent: 'flex-end',
        flexDirection: 'row',
        paddingBottom: 12,
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
        marginTop: 8,
    },
    cellPriceRightText: {
        paddingRight: 10,
        fontSize: 14,
        color: "#ff4060",
        textAlign: 'right',

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
        paddingLeft: 40,
        paddingRight: 40,
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
        top: 6,
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
        paddingLeft: 120,
    },
    tipLeft: {
        color: '#99a8bf',
        fontSize: 13
    },
    tipRight: {
        color: '#16d2d9',
        fontSize: 13
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
        paddingLeft: 10,
        // marginTop:0,
        borderWidth: 1,
        borderColor: '#cad5e6',
        borderRadius: 3,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'flex-end'
    },
    dropdown_text: {
        fontSize: 15,
        color: '#99a8bf',
        // backgroundColor:'#ff0',
        // paddingTop:,
        paddingLeft: 10,
        height: 32,
        lineHeight: 32,
        marginTop: -9,
    },
    dropdown_dropdown: {
        borderColor: '#cad5e6',
        borderWidth: 1,
        borderRadius: 3,
        height: 200,
        justifyContent: 'flex-end',
        marginLeft: -19
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
        textAlign: 'center'
    },
    form_total_btn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 50,
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
        fontSize: 16,
        marginRight: 5
    },
    total_price: {
        color: '#ff4060',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 10
    },
    total_price_tip: {
        color: '#99a8bf',
        fontSize: 14,
    },
    cellBottomOptBox: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,
        height: 38,
        justifyContent: 'flex-end',
    },
    del_btn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        width: 100,
        backgroundColor: '#2676ff',
        height: 50,
    },
    del_btn_text: {
        color: '#fff'
    },
    delOrder_btn: {
        alignSelf: 'flex-end',
        height: 24,
        borderColor: '#8c9dbf',
        borderRadius: 1,
        borderWidth: 0.5,
        marginTop: 7,
        marginBottom: 7,
        marginLeft: 12,
        marginRight: 12,
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',


    },
    delOrder_btn_second: {
        alignSelf: 'flex-end',
        height: 24,
        borderColor: '#8c9dbf',
        borderRadius: 1,
        borderWidth: 0.5,
        marginTop: 7,
        marginBottom: 7,

        marginRight: 12,
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',


    },
    delOrder_btn_text: {
        color: '#8c9dbf',
        padding: 4,
        fontSize: 13,
    },

});
/**
 * Created by zl on 17/04/09.
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
    NativeModules,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Header from './Header';
import NetUtil from '../util/NetUitl';
import Toast, {
    DURATION
} from 'react-native-easy-toast'
import UserOrderList from '../../UserOrderList';
import OrderListScreen from '../OrderListScreen';
import InquiryListScreen from '../InquiryListScreen';
import DisposeBuy from '../../DisposeBuy';
import BaseScreen from '../base';
import MyResourceScreen from '../MyResourceScreen';
const {NimModule} = NativeModules;
var selectedTab = {"NEW_ORDER":'order',"PURCHASE_STATUS":'inquiry',
"BaseScreen":BaseScreen,"NEW_RESOURCELIST":'home'};
// var routes = {"UserOrderList":OrderListScreen,"DisposeBuy":InquiryListScreen,
// "BaseScreen":BaseScreen,"MyResourceScreen":MyResourceScreen};
var {
    width,
    height,
    scale
} = Dimensions.get('window');
var widths = Dimensions.get('window').width;
var downTextWidth = widths - 100;

const dispositionTypes = [];
const TYPE_OPTIONS = [];
const _options = [];
const _options_id = [];
export default class InfoCenterItem extends Component {
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
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        // this.datas = props.todos.slice(0);
        const {
            rowData,
            rowID,
            sectionID
        } = this.props;

        this.state = {
            dataSource: ds,
            loaded: false,
            idx: -1,
            editing: false,
            show: false,
            isHasRead: rowData.isHasRead,

        };


    }
    componentWillMount() {


    }
    signHasRead(rId) {
        var st = this;
        const {
            rowData,
            rowID,
            sectionID,
            moduleEngName,
            navigator,
        } = this.props;
        storage.load({
            key: 'loginState',
        }).then(ret => {
            if (moduleEngName == "yunxinMessage") {
                st.setState({isHasRead:true,});
                NimModule.ChatWith(rowData["contactId"],()=>{});
                DeviceEventEmitter.emit('updateYXMessageStatus', rowID);
                return;
            } else {
                if(rowData['hasRead']==0){
                    NetUtil.ajax({
                        url: '/sysNoticeMb/readNotice',
                        data: {
                            ticketId: ret['ticketId'],
                            noticeId: rowData["noticeId"],
                        },
                        success: (responseJson) => {
                            var responseData = responseJson;
                            if (responseData) {
                                st.setState({isHasRead:true,});
                            }                                  
                        },
                        error: (err) => {
                            console.log(err);
                        }
                    });
                }
                console.log(rowData['noticeCategory']);
                var noticeCategory=rowData['noticeCategory'];
                const { navigator} = this.props;
                if (navigator) {
                    navigator.push({
                        name:'BaseScreen',
                        component:BaseScreen,
                        params:{
                            navigator:navigator,
                            ticketId:this.props.ticketId,
                            selectedTab:selectedTab[noticeCategory]
                        }
                    })
                }
            }
        }).catch(err => {
            console.log(JSON.stringify(err));
        })



    }

    componentDidMount() {


    }
    async loadData(ticketId) {

    }

    render() {
        const {
            rowData,
            rowID,
            sectionID
        } = this.props;
        return (
            <View>
                <TouchableOpacity onPress={_ => { this.signHasRead(rowID) }}>
                    <View style={styles.splitLine}></View>
                    <View style={styles.messageBox}>
                        <View style={[styles.messageBoxLeft, { width: 24, }]}>
                            {!this.state.isHasRead ? <Image source={require('../../images/message/messages_icon_unread.png')}
                                style={{ width: 6, height: 6, marginLeft: 12, marginTop: 28, }} /> : null}
                        </View>
                        <View style={styles.messageBoxRight}>
                            <View style={styles.messageBoxRightUp}>
                                <Text style={{ fontSize: 14, color: '#293f66', textAlign: 'left', }} >
                                    {rowData.senderName}
                                </Text>
                                <Text style={{ fontSize: 11, color: '#99a8bf', textAlign: 'right', marginRight: 12, }}>{rowData.createTime}</Text>
                            </View>
                            <View style={styles.messageBoxRightDown}>
                                <Text style={{ fontSize: 11, color: '#99a8bf', textAlign: 'left', marginTop: 8, paddingRight: 10, }}>{rowData.noticeContent}
                                </Text></View>
                        </View>
                    </View>
                </TouchableOpacity>
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
        color: '#2676ff',
        flex: 1,
        fontSize: 16,
        paddingRight: 24,

    },

    splitLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#E6EbF5'
    },
    splitLineTop: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#E9EDF7",
    },
    splitLineBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#dce4f2",
    },
    messageBox: {
        height: 72,

        flexDirection: 'row',
        backgroundColor: 'white',

    },
    messageBoxLeft: {

    },
    messageBoxRight: {
        flex: 9,
        flexDirection: 'column',
        marginLeft: 12,

    },
    messageBoxRightUp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    messageBoxRightDown: {

    },

    headBar: {
        flexDirection: 'row',
        // 水平排布
        paddingTop: Platform.OS === 'ios' ? 20 : 0, // 处理iOS状态栏
        height: Platform.OS === 'ios' ? 64 : 44, // 处理iOS状态栏
        backgroundColor: 'white',
        alignItems: 'center' // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
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
        top: 0,
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

    backTextWhite: {
        color: '#FFF'
    },
});
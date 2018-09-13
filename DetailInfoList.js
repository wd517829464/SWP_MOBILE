
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

import Header from './Header';
import DisposeBuyItem from './app/component/DisposeBuyItem'
import Dialog from './app/component/dialog';
import NetUtil from './app/util/NetUitl'
import Toast, { DURATION } from 'react-native-easy-toast'
import InfoCenterItem from './app/component/InfoCenterItem.js';

export default class DetailInfoList extends Component {
            

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => {
                return r1 !== r2;
            }
        });
        const { ticketId, moduleEngName, moduleChsName, iconNameSource } = this.props;
        this.state = {
            dataSource: ds,
            isLoading: false,
            loading: true,
            pageIndex: 1,
            pageSize: 10,
            ticketId: ticketId,
            moduleEngName: moduleEngName,
            moduleChsName: moduleChsName,
            iconNameSource: iconNameSource,
            readStatus: false,
            statusText: "暂无数据",
            hasData: true,
            hasNetWork: true,

        };
        this.pageIndex = 1;
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
    backKeyPressed(){
        this.goBack();
        return true;
    }
    componentWillMount() {
        this.pageIndex = 1;
        this.systemMessageList = [];
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.ticketId=ret['ticketId'];
            this.setState({
                ticketId:this.ticketId
            })
            this.loadData(false);
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressDL', this.backKeyPressed);
        this.updateMessageListener=DeviceEventEmitter.addListener('updateMessageStatus', function (noticeId) {
            st.systemMessageList = [];
            st.pageIndex = 1;
            st.loadData(false);
        });
        this.toastListener=DeviceEventEmitter.addListener('toast', function (text) {
            if(text){
                this.refs.toast.show(text);
            }
        });
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressDL',this.backKeyPressed);
        this.toastListener.remove();
        this.updateMessageListener.remove();
    }
    goback() {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    async loadData(editing) {
        var st = this;
        st.setState({ dataSource: st.state.dataSource.cloneWithRows([]), loading: false, hasData: true, });
        
        NetUtil.ajax({
            url: '/sysNoticeMb/pageNotice',
            data: {
                ticketId: st.ticketId,
                pageIndex: st.pageIndex,
                pageSize: st.state.pageSize,
                noticeCategory:st.props.code,
            },
            success: (responseJson) => {
                var responseData = responseJson;
                if (responseData) {
                    var moreData = responseData["data"]["datas"];
                    if (moreData) {

                    } else {
                        return;
                    }
                    for (var i = 0; i < moreData.length; i++) {
                        if (moreData[i]["hasRead"] == '0') {
                            moreData[i]["isHasRead"] = false;
                        } else {
                            moreData[i]["isHasRead"] = true;
                        }
                        moreData[i].senderName = moreData[i]["senderName"];

                        moreData[i]["noticeId"] = moreData[i]["id"];

                        moreData[i]["createTime"] = moreData[i].createTime.substring(0,10);
                    }
                    st.systemMessageList = st.systemMessageList.concat(moreData);
                    // alert("st.systemMessageList.length:"+st.systemMessageList.length+" st.state.pageIndex:"+st.state.pageIndex);
                    if(st.systemMessageList&&st.systemMessageList.length>0){
                        st.setState({ dataSource: st.state.dataSource.cloneWithRows(st.systemMessageList), loading: false, hasData: true, });
                    }else{
                        if(st.pageIndex>1){//若是加载下一页
                            st.setState({loading: false, hasData: true, });                            
                        }
                        st.setState({ dataSource: st.state.dataSource.cloneWithRows(st.systemMessageList), loading: false, hasData: false, });
                    }
                }
            },
            error: (err) => {
                console.log(err);
            }
        });

    }

    signHasRead(rId) {
        // var st = this;
        // st.systemMessageList[rId]["isHasRead"] = true;
        // st.setState({ dataSource: st.state.dataSource.cloneWithRows(st.systemMessageList),readStatus:!st.state.readStatus });

    }
    del(index) {

    }

    onRefresh() {
        console.log("refresh");
        var st = this;
        
            // st.setState({ pageIndex: 1, });
            this.pageIndex = 1;
            st.systemMessageList = [];
       
        this.loadData(false);
    }
    onEndReached() {
        if (this.pageIndex > 100) {
            return;
        }
        console.log("endReached");
        var st = this;
        setTimeout(function () {
            st.setState({ pageIndex: st.state.pageIndex + 1, });
            st.pageIndex = st.pageIndex + 1;
        }, 100);
        // this.loadData(false);
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
                    <TouchableOpacity onPress={_ => { this.goBack() }}>
                        <Image source={require('./images/navigator/nav_icon_backblue.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{this.state.moduleChsName}</Text>

                </View>

                <View style={styles.splitLine}></View>

                <View style={[styles.messageBox, { height: 38, }]}>
                    <View style={styles.messageBoxLeft}>
                        {/* <Image style={{ width: 24, height: 24, marginLeft: 12, marginTop: 7, }} source={this.state.iconNameSource}> */}
                            {/*<View style={{ width: 6, height: 6, marginLeft: 18, marginTop: 0, backgroundColor: 'red', borderRadius: 3, overflow: 'visible', }}></View>*/}

                        {/* </Image> */}

                    </View>
                    <View style={[styles.messageBoxRight, { height: 38, }]}>
                        <Text style={{ fontSize: 14, color: '#293f66', textAlign: 'left', marginTop: 12, }}>{this.state.moduleChsName}</Text>
                    </View>
                </View>
                {this.state.hasData ?
                    <View style={styles.listBox}>
                        <ListView
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
                            renderRow={(rowData, sectionID, rowID, moduleEngName) =>
                                <InfoCenterItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} moduleEngName={this.state.moduleEngName} />

                            }
                            onEndReachedThreshold={20}
                            onEndReached={this.onEndReached.bind(this)}

                        />
                    </View> : <TouchableOpacity style={styles.box} onPress={_ => {
                        var st = this;
                        setTimeout(function () {
                            {/* st.setState({ pageIndex: 1, }); */}
                            st.pageIndex = 1;
                            st.systemMessageList = [];
                        }, 100);
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
        height: 60,

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
        paddingTop: Platform.OS === 'ios' ? 20 : 0,  // 处理iOS状态栏
        height: Platform.OS === 'ios' ? 64 : 44,   // 处理iOS状态栏
        backgroundColor: 'white',
        alignItems: 'center'  // 使元素垂直居中排布, 当flexDirection为column时, 为水平居中
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
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

import Header from '../Header';
import ResourceItem from './component/ResourceItem'
import Dialog from './component/dialog';
import NetUitl from './util/NetUitl';
import Toast, { DURATION } from 'react-native-easy-toast'
import { SwipeListView } from 'react-native-swipe-list-view';
import InfoCenter from '../InfoCenter';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class MyResourceScreen extends Component {

    constructor(props) {
        super(props);

        this.state={
            isLoading:true,
            dataSource:ds.cloneWithRows([]),
            nodata:false,
            statusText:'',
            pageSize:5,
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);

    }
     componentWillMount(){
       this.responseList = [];
       this._messages=[];
        this.loadData();
    }
     async loadData(){
        NetUitl.ajax({
            url:'/wastecircleserivice/getMyResources.htm',
            data:{
                ticketId: this.props.ticketId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                var nodata=responseData.data.responseList.length==0&&this._messages.length==0;
                if (responseData) {
                     this.responseList=responseData.data.responseList;
                     this.setState ({
                        dataSource: this.getDataSource(responseData.data.responseList),
                        isLoading:false,
                        isLoadingTail: false,
                        loading:false,
                        nodata:nodata,
                        hasNetWork:false,
                        statusText:nodata?'暂无数据':''
                    });
                }
            },
            error:(error)=>{
                this.setState({nodata:true,hasNetWork:true,statusText:'网络连接中断'});
            }
        });

    }
    onRefresh(){
        this.responseList = [];
       this._messages=[];
       this.loadData();
    }
    getDataSource(messages){
        if(messages.length<this.state.pageSize){
            this.setState({loadComplete:true,isLoadingTail:false});
        }
      if(!this.state.dataSource||this.state.pageIndex==1){
        this.state.dataSource=new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this._messages = [].concat(messages);
      }else{
        this._messages =this._messages.concat(messages);
      }
      return this.state.dataSource.cloneWithRows(this._messages);
  }
    _onEndReached() {
        if (!this.state||this.state.isLoadingTail) {
            return;
        }
        this.setState({
            isLoadingTail: true
        });
        this.loadData();
    }

    makeNo(rowID){
        Alert.alert('提示', '你即将从资源单中谢绝一笔资源，\n是否要继续', [
            { text: '取消', style: 'cancel' },
            { text: '确认', onPress: () => this.confirm1(rowID) }
        ])
    }
    makeYes(rowID){
         Alert.alert('提示', '你即将从资源单中确认一笔资源，\n是否要继续', [
            { text: '取消', style: 'cancel' },
            { text: '确认', onPress: () => this.confirm2(rowID) }
        ])
    }
    confirm1(rowID){
        // Alert.alert('你选择了谢绝');
        var responseObj=this.responseList[rowID];
        this.setState({loading:true});
        NetUitl.ajax({
            url:'/wastecircleserivice/refusedBusiness.htm',
            data:{
                ticketId: this.props.ticketId,
                detailResponseId:responseObj.detailResponseId,
                capacityResponseId:responseObj.responseId,
                versioncode:responseObj.versionCode
            },
            success:(responseJson)=>{
                if(responseJson.status==1){
                    if(responseJson.data.status==0){
                        Alert.alert('谢绝成功');
                        this.responseList.splice(rowID,1)
                        this._messages=[];
                        this.setState ({
                            dataSource: this.getDataSource(this.responseList),
                            loading:false
                        });
                    }else{
                        Alert.alert(responseJson.data.msg);
                        this.setState ({
                            loading:false
                        });
                    }
                }else{
                    this.setState ({
                        loading:false
                    });
                }
                
            },
            error:(error)=>{
                Alert.alert('error',error+'');
            }
        });
    }
    confirm2(rowID){
        // Alert.alert('你选择了确认');
       var responseObj=this.responseList[rowID];
       this.setState({loading:true});
        NetUitl.ajax({
            url:'/wastecircleserivice/capacityResponseConfirm.htm',
            data:{
                ticketId: this.props.ticketId,
                detailResponseId:responseObj.detailResponseId,
                capacityResponseId:responseObj.responseId,
                versioncode:responseObj.versionCode,
                capacitydetaiReleaseId:responseObj.releaseDetailId,
                capacityitemReleaseId:responseObj.releaseItemId,
                responseQuantity:responseObj.responseQuantity,
                capacityReleaseId:responseObj.releaseId
            },
            success:(responseJson)=>{
                if(responseJson.status==1){
                    if(responseJson.data.status==0){
                        Alert.alert(responseJson.data.msg);
                        this.responseList.splice(rowID,1)
                        this._messages=[];
                        this.setState ({
                            dataSource: this.getDataSource(this.responseList),
                            loading:false
                        });
                    }else{
                        Alert.alert(responseJson.data.msg);
                        this.setState({loading:false});
                    }
                }else{
                    this.setState({loading:false});
                }
            },
            error:(error)=>{
                Alert.alert('error',error+'');
            }
        });
    }
    back(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
    backKeyPressed(){
        this.back();
        return true;
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressMR', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressMR',this.backKeyPressed);
    }
    render() {
        return (
            <View style={styles.box}>
                 <StatusBar barStyle="default" />
                <View style={styles.top}>
                    <TouchableOpacity onPress={this.back.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_backblue.png')} resizeMode={Image.resizeMode.contain} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <Text style={styles.middleText}>我的发布</Text>
                    <Text></Text>
                </View>
                <Toast ref="toast" />
                <View style={styles.listBox}>
                    {this.state.nodata?
                        <TouchableOpacity style={styles.box} onPress={_ => {
                        this.loadData();
                    }}>

                        <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                            {this.state.hasNetWork ?
                                <Image source={require('../images/error/bg_暂无数据.png')} style={{ top: 66, alignSelf: 'center', width: 207, height: 192, }} />
                                :
                                <Image source={require('../images/error/bg_网络连接中断.png')} style={{ top: 66, alignSelf: 'center', width: 207, height: 192, }} />
                            }
                            <Text style={{ textAlign: 'center', color: '#8c9dbf', top: 104, }}>{this.state.statusText}</Text>
                            <View style={{ top: 116, flexDirection: 'row', }}>
                                <Text style={{ textAlign: 'center', color: '#8c9dbf', }}>轻点屏幕重试</Text><Image style={{ width: 16, height: 16, marginLeft: 4, marginTop: 0, }} source={require('../images/error/common_icon_refresh.png')} />
                            </View>
                        </View>
                    </TouchableOpacity>:
                        <SwipeListView
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
                            <ResourceItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} ref='item' />
                        }
                        renderHiddenRow={(data, secId, rowId, rowMap) => (
                            <View style={styles.rowBack}>
                                <Text>左</Text>
                                {/*<View style={[styles.backRightBtn, styles.backRightBtnLeft]}>*/}
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={_ => { rowMap[`${secId}${rowId}`].closeRow(); this.makeNo(rowId); }}>
                                    <Text style={styles.backTextWhite}>谢绝</Text>
                                </TouchableOpacity>
                                {/*</View>*/}
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={_ => { rowMap[`${secId}${rowId}`].closeRow(); this.makeYes(rowId); }}>
                                    <Text style={styles.backTextWhite}>确认</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        disableRightSwipe={true}
                        recalculateHiddenLayout={true}
                        swipeToOpenPercent={20}
                        rightOpenValue={-150}
                    />
                }
                </View>
                {this.state.loading?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    headerLeftIconView:{
        paddingRight:15,
        paddingTop:8,
        paddingBottom:8
    },
    headerLeftIcon:{
        width:12,
        height:20,
        marginLeft:15
    },
    top:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor:'#fff',
        paddingTop:(Platform.OS === "ios")?30:10,
        paddingBottom:10,
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7'
    },
    back:{
        color:'#2676ff',
        paddingLeft:20,
        fontSize:25
    },
    middleText:{
        alignSelf:'center',
        color:'#2676ff',
        marginRight:42,
        fontSize:16
    },
    box: {
        flex: 1,
        backgroundColor: '#f7f8fa',
    },
    loadImage: {
        position: 'absolute',
        top: 250,
        alignSelf: 'center',
        zIndex:2
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
        top: 13,
        width: 75
    },
    backRightBtnLeft: {
        backgroundColor: '#cad6e6',
        right: 75
    },
    backRightBtnRight: {
        backgroundColor: '#2676ff',
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
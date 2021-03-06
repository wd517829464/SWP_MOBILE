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
    TouchableOpacity,
    RefreshControl,
    DeviceEventEmitter,
    StatusBar,
    PixelRatio,
    ScrollView,
    Platform,
} from 'react-native';

import MyScreenTop from './component/MyScreenTop';
import MyCount from './component/MyCount';
import MyCZItem from './component/MyCZItem';
import CFItem from './component/CFItem';
import NetUitl from './util/NetUitl';
import CFBuyScreen from './CFBuyScreen';
import MessageCount from './component/MessageCount';

var Dimensions = require('Dimensions');
var width_screen = Dimensions.get('window').width;
var height_screen = Dimensions.get('window').height;
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class EnterDetailItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: '',
            sysEnterpriseBase:{},
            size:0,
            isLoading:true
        };
    }
    //  componentWillMount(){
    //    this.loadData();
    // }

    async loadData(){
        NetUitl.ajax({
            url:'/personaluserservice/enterpriseInformation.htm',
            data:{
                ticketId: this.props.ticketId,
                wasteEntId:this.props.wasteEntId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if (responseData&&responseData.status==1) {
                    var data=responseData.data;
                    this.setState({
                        sysEnterpriseBase:data.sysEnterpriseBase,
                        size:data.size,
                        dataSource:ds.cloneWithRows(data.ablePlanitemListable.concat(data.planitemList)),
                        isLoading:false
                    });
                }
            }
        });
    }
    goback(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
    onPressItem(planitemReleaseId,rowID){
        if(rowID>=this.state.size){
            return;
        }
         var _this = this;
        const { navigator} = this.props;
        if (navigator) {
            // navigator.pop();
            navigator.push({
                name:'CFBuyScreen',
                component:CFBuyScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    planitemReleaseId:planitemReleaseId,
                    enterName:this.state.sysEnterpriseBase.entName,
                    distance:this.state.sysEnterpriseBase.distance
                }
            })
        }
    }
    onRefresh(){

    }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width*PixelRatio.get();
        var topHeight = 184;
        var entTypeStr='00';
        // const {sysEnterpriseBase,size}=this.state;
        return (
            <View>
                {
                    !this.state.dataSource?
                    <ListView
                        style={{flex:1,height:200}}
                        dataSource={ds.cloneWithRows(['123'])}
                        refreshControl={  
                            <RefreshControl  
                            onRefresh={this.onRefresh.bind(this)}  
                            refreshing={this.state.isLoading}  
                            colors={['#ff0000', '#00ff00', '#0000ff']}  
                            enabled={true}  
                            />  
                        }  
                        renderRow={(rowData,sectionID,rowID) => 
                        <View></View>
                        }
                    />:
                <ListView
                    dataSource={this.state.dataSource}
                    refreshControl={  
                        <RefreshControl  
                        onRefresh={this.onRefresh.bind(this)}  
                        refreshing={this.state.isLoading}  
                        colors={['#ff0000', '#00ff00', '#0000ff']}  
                        enabled={true}  
                        />  
                    }  
                    renderRow={(rowData,sectionID,rowID) => 
                        <TouchableOpacity onPress={this.onPressItem.bind(this,rowData.planitemReleaseId,rowID)}>
                        <View style={styles.CFItem} borderBottomWidth={0.5} width={widths}>
                            <View style={styles.cellTextBox} width={widths-30}>
                                <View style={styles.cellTextBox_left}>
                                    <Text style={[styles.cellText_wasteName,{color:rowID>=this.state.size?'#99a8bf':'#293f66'}]}>{rowData.wasteName}</Text>
                                    <Text style={[styles.cellText_telNumber,{color:rowID>=this.state.size?'#cad5e6':'#6b7c99'}]}>{rowData.wasteCode}</Text>
                                </View>
                                <View style={styles.cellTextBox_right}>
                                <Text style={[styles.cellButtonTitle_wasteWeight,styles.cellButtonTitle_wasteWeight_title,{color:rowID>=this.state.size?'#cad5e6':'#6b7c99'}]}>数量：</Text>
                                <Text style={[styles.cellButtonTitle_wasteWeight,{color:rowID>=this.state.size?'#99a8bf':'#293f66'}]}>{rowData.planQuantity+rowData.unitName}</Text>
                                </View> 
                            </View>
                        </View>
                    </TouchableOpacity>
                         }
                    />
                }
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
        height:20
    },
    mytop:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'#2676ff',
        paddingLeft:20,
        paddingRight:20,
        paddingTop:(Platform.OS === "ios")?30:10,
        paddingBottom:10,
        borderWidth:0,
        borderBottomColor:'#2676ff',
        zIndex:2
    },
     back_btn:{
        color:'#fff',
        fontSize:20
    },
    middleView:{
        flex:1,
        paddingLeft:9,
    },
    middleText:{
        textAlign:'center',
        color:'#fff',
        fontSize:16
    },
    information:{
        width:18,
        height:18
    },
    message:{
        width:20,
        height:20
    },
    titleandcount:{
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'center',
        height:21,
        width:width_screen,
        paddingLeft:20,
        paddingRight:20,
        borderBottomColor:'#e9edf7',
        borderBottomWidth:1,
        paddingTop:10,
        paddingBottom:10
    },
    title:{
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:10,
    },
    title_icon:{
        width:23,
        height:23,
        marginRight:4
    },
    title_text:{
        color:'#293f66'
    },
    count:{
        flexDirection:'row',
        alignItems:'center',
        paddingRight:10,
    },
    count_text:{
        color:'#99a8bf'
    },
    count_content:{
        backgroundColor:'#e6efff',
        color:'#196eff',
        width:30,
        height:20,
        textAlign:'center',
        lineHeight:20,
        marginRight:10,
        marginLeft:10,
        borderRadius:2
    },
    bg:{
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor:'transparent',
        borderWidth:0,
        marginTop:-1,
        paddingLeft:20,
        paddingRight:20,
    },
    enterlogo:{
        width:60,
        height:60,
        margin:10
    },
    enterType:{
        backgroundColor:'#18d0d8',
        marginTop:-17,
        paddingLeft:3,
        paddingRight:3,
        paddingTop:2,
        paddingBottom:2,
        borderRadius:2
    },
    enterTypeText:{
        color:'#fff',
        fontSize:9
    },
    enterNameText:{
        color:'#fff',
        fontWeight:'bold',
        marginTop:10,
    },
    enterCodeText:{
        color:'#fff',
        marginTop:8,
        marginBottom:4,
        fontSize:13
    },
    enterAddress:{
         flexDirection: 'row',
        alignItems: 'center',
    },
    enterAddressIcon:{
        width:14,
        height:14,
        marginRight:5
    },
    enterAddressText:{
        color:'#fff',
        marginRight:20,
        fontSize:14
    },
    enterAddressArrow:{
        color:'#fff',
        fontSize:16
    },
    enterSplitText:{
        color:'#fff',
        height:18
    },
    //item
    hasBuyed:{
        backgroundColor:'#ffcc00',
        marginLeft:-15,
        marginRight:15,
        color:'#fff',
        padding:2,
        fontSize:11
    },
    cellTextBox_left:{
        flexDirection:'column',
    },
    cellTextBox_right:{
        flexDirection:'row',
        alignItems:'flex-end',
    },
    cellTextBox:{
        flexDirection:'row',
        justifyContent: 'space-between',
        marginBottom:5,
    },
    cellText_wasteName:{
        marginTop:8,
        fontSize:14,
        color:'#293f6d',
    },
    cellText_telNumber:{
        marginTop:4,
        fontSize:12,
        color:'#5b709c'
    },
    cellButtonTitle_wasteWeight:{
        fontSize:14,
        color:'#293f6d',
        textAlign:'right',
    },
    cellButtonTitle_wasteWeight_title:{
        color:'#6b7c99'
    },
    CFItem:{
        paddingTop:3,
        paddingBottom:3,
       paddingLeft:20,
        paddingRight:20,
        borderColor:'#e9edf7'
    },
});
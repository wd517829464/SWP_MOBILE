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
    ScrollView,
    Text,
    View,
    Button,
    Alert,
    TouchableOpacity,
    RefreshControl,
    NativeModules,
    StatusBar,
    DeviceEventEmitter,
    BackHandler,
    Platform,
} from 'react-native';

import Login from '../Login';
import MyScreenTop from './component/MyScreenTop';
import MyCount from './component/MyCount';
import MyCZItem from './component/MyCZItem';
import MyMessageScreen from './MyMessageScreen';
import NetUitl from './util/NetUitl';
import LicenseBMScreen from './LicenseBMScreen';
import MessageCount from './component/MessageCount';
import InfoCenter from '../InfoCenter';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
var Dimensions = require('Dimensions');
export default class MyScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // dataSource:[],
            dataSource: '',
            licenceVo:{},//许可证基本信息
            sysEnterpriseBaseVo:{},//企业信息
            followEnterprisesCount:0,//我的关注
            myrelease:0,//我的资源单
            orderCount:0,//我的订单
            soldCount:0,
            isLoading:true,
            nodata:false
        };
    }
    componentWillMount(){
       this.loadData();
    }
    componentDidMount(){
     DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
      if(text=="me"){
        this.loadData();
      }
    });

  }
    async loadData(){
        NetUitl.ajax({
            url:'/personaluserservice/myHomePage.htm',
            data:{
                ticketId: this.props.ticketId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if (responseData&&responseData.status==1) {
                    var data=responseData.data;
                    console.log(responseData);
                    var nodata=data.operationLicenceItemVo.length==0;
                    this.setState({
                        dataSource:ds.cloneWithRows(data.operationLicenceItemVo),
                        licenceVo:data.licenceVo,//许可证基本信息
                        sysEnterpriseBaseVo:data.sysEnterpriseBaseVo,//企业信息
                        followEnterprisesCount:data.followEnterprisesCount,//我的关注
                        myrelease:data.myrelease,//我的资源单
                        orderCount:data.orderCount,//我的订单
                        soldCount:data.soldCount,
                        isLoading:false,
                        nodata:nodata
                    });
                }
            }
        });
    }
    onRefresh(){

    }
    goPersonMessage(){
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'MyMessageScreen',
                component:MyMessageScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                }
            })
        }
    }
    goLicenceBM(id){
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'LicenseBMScreen',
                component:LicenseBMScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    licenceId:id,
                    entName:this.state.sysEnterpriseBaseVo.entName
                }
            })
        }
    }
    gotoMessageList() {
        var { navigator } = this.props;
        if (navigator) {
            navigator.push({
                name: 'InfoCenter',
                component: InfoCenter,
                params: {
                    ticketId: this.props.ticketId
                }
            });
        }
    }
    render() {
        var start_date='',end_date='';
        if(this.state.licenceVo.start_date&&this.state.licenceVo.end_date){
            start_date=this.state.licenceVo.start_date.replace(/\-/g,'\/');
            end_date=this.state.licenceVo.end_date.replace(/\-/g,'\/');
        }
        
        var widths = Dimensions.get('window').width;
        return (
            <View style={{flex:1,backgroundColor:'#fff',paddingBottom:20}}>
                <StatusBar barStyle="light-content" />
                <View style={styles.mytop}>
                    <TouchableOpacity onPress={this.goPersonMessage.bind(this)}>
                        <Image style={styles.information} resizeMode={Image.resizeMode.contain} source={require('../images/mine/nav_icon_information.png')}/>
                        </TouchableOpacity>
                    <View style={styles.middleView}><Text style={styles.middleText}>我的主页</Text></View>

                <View style={{ paddingBottom: 10, }}>
                        <MessageCount navigator={this.props.navigator} />
                    </View>
                </View>
                <MyScreenTop navigator={this.props.navigator} ticketId={this.props.ticketId} sysEnterpriseBaseVo={this.state.sysEnterpriseBaseVo}/>
                <ScrollView>
                <MyCount navigator={this.props.navigator} ticketId={this.props.ticketId} followEnterprisesCount={this.state.followEnterprisesCount} myrelease={this.state.myrelease} boughtOrderCount={this.state.orderCount} soldOrderCount={this.state.soldCount}/>
                <View style={styles.splitView}></View>
                {this.state.nodata?
                    <Text style={styles.nodata}>暂无许可证信息</Text>:null
            }
            {
                !this.state.nodata?<TouchableOpacity onPress={this.goLicenceBM.bind(this,this.state.licenceVo.id)}>
                    <View style={styles.item1}>
                        <View style={styles.item1_left}>
                            <Image style={styles.item_logo} resizeMode={Image.resizeMode.contain} source={require('../images/mine/profile_icon_paper.png')}/>
                            <Text style={styles.item_code}>{this.state.licenceVo.licence_no}</Text>
                        </View>
                        <Text style={styles.item_time}>{start_date}至{end_date}</Text>
                    </View>
               </TouchableOpacity>:null
            }
                
                {
                    !this.state.dataSource?
                    <ListView
                        dataSource={ds.cloneWithRows(['123'])}
                        refreshControl={  
                            <RefreshControl  
                            onRefresh={this.onRefresh.bind(this)}  
                            refreshing={this.state.isLoading&&!this.state.nodata}  
                            colors={['#ff0000', '#00ff00', '#0000ff']}  
                            enabled={true}  
                            />  
                        }  
                        renderRow={(rowData,sectionID,rowID) => 
                        <View></View>
                        }
                    />
                    :
                    <ListView
                        dataSource={this.state.dataSource}
                        enableEmptySections={true}
                        refreshControl={  
                            <RefreshControl  
                            onRefresh={this.onRefresh.bind(this)}  
                            refreshing={this.state.isLoading&&!this.state.nodata}  
                            colors={['#ff0000', '#00ff00', '#0000ff']}  
                            enabled={true}  
                            />  
                        }  
                        renderRow={(rowData,sectionID,rowID) => 
                        <MyCZItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} 
                        ticketId={this.props.ticketId} sysEnterpriseBaseVo={this.state.sysEnterpriseBaseVo} licenceVo={this.state.licenceVo}/>
                        }
                    />
                }
                </ScrollView>
                
            </View>
        );
    }
     
}

const styles = StyleSheet.create({
    nodata:{
        color:'#8c9dbf',
        alignSelf:'center',
        marginTop:100
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
        zIndex:1
    },
    middleView:{
        flex:1,
        paddingRight:4,
    },
    middleText:{
        textAlign:'center',
        color:'#fff',
        fontSize:16,
        paddingLeft:24,
    },
    information:{
        width:18,
        height:18
    },
    message:{
        width:20,
        height:20
    },
    splitView:{
        height:10,
        backgroundColor:'#f7f8fa',
    },
    item1:{
         flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft:20,
        paddingRight:20,
        backgroundColor:'#fff',
        paddingTop:10,
        paddingBottom:10,
        borderBottomWidth:1,
        borderTopWidth:1,
        borderColor:'#e6ebf5',
        
    },
    item1_left:{
         flexDirection: 'row',
        alignItems: 'center',
    },
    item_logo:{
        width:16,
        height:16,
        marginRight:5
    },
    item_code:{
        color:'#2677fc'
    },
    item_time:{
        color:'#b2bacd',
        fontSize:13,
    },
    
});
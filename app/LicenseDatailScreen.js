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
    StatusBar,
    BackHandler,
    Platform,
} from 'react-native';
import MyScreenTop from './component/MyScreenTop';
import CodeItem from './component/CodeItem';
import NetUitl from './util/NetUitl';
import Constants from './util/Constants';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class LicenseDatailScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            dataSource:'',
            isLoading:true
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);
    }
     componentWillMount(){
       this.loadData();
    }

    async loadData(){
        NetUitl.ajax({
            url:'/licenceservice/licenceDetail.htm',
            data:{
                ticketId: this.props.ticketId,
                licenceId:this.props.licenceId,
                licenceItemId:this.props.itemId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if (responseData&&responseData.status==1) {
                    var licenceDetail=responseData.data.licenceDetail;
                    this.setState({
                        dataSource:ds.cloneWithRows(licenceDetail.listWasteTypeVo),
                        isLoading:false
                    });
                }
            }
        });
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressLD', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressLD',this.backKeyPressed);
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
    onRefresh(){

    }
    _onEndReached(){

    }
    render(){
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        // <Image style={styles.enterlogo} resizeMode={Image.resizeMode.contain} source={require('../images/mine/profile_icon_infor.png')}/>
        const {licenceDetail}=this.state;
        const {sysEnterpriseBaseVo,licenceVo,rowData}=this.props;
         var entTypeStr='';
        if(sysEnterpriseBaseVo&&sysEnterpriseBaseVo.entTypes&&sysEnterpriseBaseVo.entTypes.length>0){
            entTypeStr=sysEnterpriseBaseVo.entTypes[0].code='DISPOSITION';
        }
        var start_date='',end_date='';
        if(licenceVo.start_date&&licenceVo.end_date){
            start_date=licenceVo.start_date.replace(/\-/g,'\/');
            end_date=licenceVo.end_date.replace(/\-/g,'\/');
        }
        let head=require('../images/mine/profile_icon_infor.png');
        if(sysEnterpriseBaseVo.imgBusinessCode&&sysEnterpriseBaseVo.imgFileId){
            head={uri:Constants.IMG_SERVICE_URL+'&businessCode='+sysEnterpriseBaseVo.imgBusinessCode+'&fileID='+sysEnterpriseBaseVo.imgFileId};
        }
        return (
            <View style={{flex:1,backgroundColor:'#f7f8fa'}}>
                <StatusBar barStyle="light-content" />
                <View style={styles.mytop}>
                    <TouchableOpacity onPress={this.goback.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_back.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <View style={styles.middleView}><Text style={styles.middleText}>许可证详情</Text></View>
                    <Text></Text>
                </View>
                <View style={styles.licenseDatail}>
                    <View style={styles.headDetail}>
                        <View style={styles.logoandtype}>
                            <Image style={styles.enterlogo} resizeMode={Image.resizeMode.contain} source={head}/>
                            <View style={[styles.enterType,{backgroundColor:entTypeStr=='DISPOSITION'?'#18d0d8':'#99a8bf'}]}><Text style={styles.enterTypeText}>{entTypeStr=='DISPOSITION'?'处置企业':'产废企业'}</Text></View>
                        </View>
                        <View style={styles.item01}>
                            <View style={styles.item0}><Text style={styles.entName}>{sysEnterpriseBaseVo.entName}</Text></View>
                            <View style={styles.item1}>
                                <View style={styles.item1_left}>
                                    {/*<Image style={styles.item_logo} resizeMode={Image.resizeMode.contain} source={require('../../images/mine/profile_icon_paper.png')}/>*/}
                                    <Text style={styles.item_code}>{licenceVo.licence_no}</Text>
                                </View>
                                <Text style={styles.item_time}>{start_date}至{end_date}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.item2}><Text style={styles.item2_text}>{rowData.dispositionType}</Text></View>
                    <View style={styles.item3}> 
                        <View style={styles.item3_item}>
                            <Text style={styles.item3_title}>年许可总量：</Text>
                            <Text style={styles.item3_left_weight}>{rowData.approved_quantity}吨</Text>
                        </View>
                        <View style={styles.item3_item}>
                            <Text style={styles.item3_title}>年剩余量：</Text>
                            <Text style={styles.item3_right_weight}>{rowData.surplus_quantity}吨</Text>
                        </View>
                    </View>
                </View>
                    {
                        !this.state.dataSource?
                        <ListView
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
                      <CodeItem navigator={this.props.navigator} rowData={rowData} rowID={rowID} ticketId={this.props.ticketId}/>
                    }
                />
                    }
                    
            </View>
        )
    }

}
const styles = StyleSheet.create({
    headerLeftIconView:{
        paddingRight:15,
        paddingTop:8,
        paddingBottom:8
    },
    headerLeftIcon: {
        width: 12,
        height: 20,
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
    backbtn:{
        color:'#fff',
        fontSize:20
    },
    middleView:{
        flex:1,
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
    licenseDatail:{
        borderRadius:6,
        backgroundColor:'#fff',
    },
    headDetail:{
        backgroundColor:'transparent'
        // flexDirection:'column',
        // alignItems:'center',
        // paddingLeft:100
    },
    item01:{
        // paddingLeft:100
    },
    logoandtype:{
        position:'absolute',
        width:50,
        height:50,
        zIndex:2,
        left:15,
        marginTop:6
    },
    enterType:{
        backgroundColor:'#18d0d8',
        marginTop:-8,
        marginLeft:4,
        marginRight:4,
        paddingTop:2,
        paddingBottom:2,
        borderRadius:2
    },
    enterTypeText:{
        color:'#fff',
        fontSize:8,
        textAlign:'center'
    },
    enterlogo:{
        width:50,
        height:44,
    },
    item0:{
        backgroundColor:'#2676ff',
        paddingLeft:76
    },
    entName:{
        color:'#fff',
        lineHeight:30
    },
    item1:{
         flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom:10,
        paddingLeft:76,
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
        color:'#2677fc',
        lineHeight:30
    },
    item_time:{
        color:'#b2bacd',
        fontSize:13,
        lineHeight:30,
        marginRight:15
    },
    item2:{
        backgroundColor:'#f0f3fa',
        paddingTop:10,
        paddingBottom:10,
        borderRadius:4,
        marginLeft:15,
        marginRight:15
    },
    item2_text:{
        color:'#2b3f64',
        fontWeight:'bold',
        textAlign:'center',
        fontSize:14
    },
    item3:{
        flexDirection: 'row',
        alignItems: 'center',
         paddingTop:10,
        paddingBottom:10,
        marginLeft:15,
        marginRight:15
    },
    item3_item:{
        flex:1,
        paddingLeft:20
    },
    item3_title:{
        color:'#99a8bf',
        marginBottom:8
    },
    item3_left_weight:{
        color:'#293f66',
        fontWeight:'bold',
    },
    item3_right_weight:{
        color:'#16d2d9',
        fontWeight:'bold',
    },
    codeItem:{
        backgroundColor:'#fff',
        marginTop:15,
        borderBottomColor:'#dce4f2',
        borderTopColor:'#dce4f2',
        borderBottomWidth:1,
        borderTopWidth:1,
    },
    code_title:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        height:35,
        borderBottomColor:'#dce4f2',
        borderBottomWidth:1,
        paddingLeft:15,
        paddingRight:15,
    },
    code_title_text:{
        color:'#284173',
    },
    code_title_arrow:{
        color:'#c1cde4',
        fontSize:20
    },
    code_content:{
        flexDirection:'row',
        alignItems:'center',
        // justifyContent:'center',
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:15,
        // paddingRight:15,
        flexWrap:'wrap',
        // backgroundColor:'#ff0'
    },
    blueColor:{
        color:'#2676ff',
        lineHeight:20
    },
    grayColor:{
        color:'#99a8bf',
        lineHeight:20
    }
});
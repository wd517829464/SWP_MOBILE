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
    Navigator,
    DeviceEventEmitter,
    StatusBar,
    TextInput,
    RefreshControl,
    BackHandler,
    Platform,

} from 'react-native';

import BindEnterItem from './component/BindEnterItem';
import CreateEnterScreen from './CreateEnterScreen';
var Dimensions = require('Dimensions');
var width=Dimensions.get('window').width;
var height=Dimensions.get('window').height;
import NetUitl from './util/NetUitl';
import Toast, { DURATION } from 'react-native-easy-toast';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class BindEnterScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            enterName:'',
            dataSource:ds.cloneWithRows([]),
            isLoading:false,
            titleShow:false,
            list:[],
        }
        this.back = this.back.bind(this);
        
    }
 
    sendData(){
        this.refs.input.blur();
        if(!this.state.enterName){
            this.refs.toast.show('企业名称不能为空');
            return;
        }
        this.setState({isLoading:true,dataSource:ds.cloneWithRows([])});
        NetUitl.ajax({
            url:'/userservice/getCZEnterpriseList.htm',
            data:{
                enterpriseName:this.state.enterName,
                ticketId:this.props.ticketId
            },
            success:(data)=>{
                console.log(data);
                 if(data.status==1){
                    this.setState({
                        dataSource:ds.cloneWithRows(data.data['enterpriselist']),
                        isLoading:false,
                        titleShow:true,
                        list:data.data['enterpriselist']
                    });
                }
            }
        });
    }
    back(){
        this.goback();
        return true;
    }
    componentDidMount() {
        var st = this;
        DeviceEventEmitter.addListener('login',(text)=>{
            const { navigator} = this.props;
            if (navigator) {
                navigator.push({
                    name:'Login',
                    component:Login,
                    params:{
                        navigator:navigator
                    }
                })
            }
        });
        BackHandler.addEventListener('hardwareBackPressBind', this.back);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBind',this.back);
    }
    goback() {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    goCreateEnt(){
        var {navigator,ticketId}=this.props;
        if(navigator){
            navigator.push({
                name: 'CreateEnterScreen',
                component: CreateEnterScreen,
                params: {
                    ticketId:ticketId,
                    navigator:navigator
                }
            });
        }
    }
    render() {
        return (
            <View style={{flex:1,backgroundColor:'#f7f8fa'}}>
               <StatusBar barStyle="light-content" />
                <View style={styles.mytop}>
                    <TouchableOpacity onPress={this.goback.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_back.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <View style={styles.middleView}><Text style={styles.middleText}>绑定企业</Text></View>
                    <View style={{width:12}}></View>
                </View>
                <View style={{height:20}}></View>
                <View style={styles.info}>
                    <Text style={styles.info_title}>企业名称</Text>
                    <TextInput style={styles.input} ref="input" numberOfLines={1} placeholder="输入企业名称"
                    underlineColorAndroid={"transparent"} onChangeText={(text)=>{this.setState({enterName:text})}} />
                </View>
                <View style={[styles.nextBtn,styles.can]}><TouchableOpacity style={styles.nextBtn_click} onPress={this.sendData.bind(this)}><Text style={styles.nextBtn_text}>查询企业</Text></TouchableOpacity></View>
                <ListView
                     dataSource={this.state.dataSource}
                     enableEmptySections={true}
                     refreshControl={  
                        <RefreshControl  
                        refreshing={this.state.isLoading}  
                        colors={['#ff0000', '#00ff00', '#0000ff']}  
                        enabled={true}  
                        />  
                    }  
                    renderRow={(rowData,sectionID,rowID) => 
                        <BindEnterItem rowData={rowData} ticketId={this.props.ticketId} navigator={this.props.navigator}/>
                    }
                />
                {
                    this.state.titleShow?
                    <View style={styles.title}>
                        <Text style={styles.titleText}>系统中{this.state.list&&this.state.list.length>0?'如果':''}没有查询到你所在的公司，需要你手动创建。</Text>
                        <TouchableOpacity onPress={this.goCreateEnt.bind(this)} style={{borderColor:'#2d7cff',borderWidth:1,width:200,height:38,flexDirection:'column',justifyContent:'center',alignSelf:'center',marginTop:30,borderRadius:20}}>
                            <Text style={{color:'#2d7cff',alignSelf:'center',fontSize:15}}>创建企业</Text>
                        </TouchableOpacity>
                    </View>:null
                }
                <Toast ref="toast" />
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
    },
    middleText:{
        textAlign:'center',
        color:'#fff',
        fontSize:16
    },
    title:{
        flexDirection:'column',
        justifyContent:'center',
        paddingTop:15,
        paddingBottom:15,
        // width:width*0.8,
        alignSelf:'center'
    },
    line:{
        color:'#dfe3ed'
    },
    titleText:{
        color:'#99a8bf',
        marginLeft:10,
        marginRight:10,
        textAlign:'center',
        lineHeight:30
    },
    info:{
        flexDirection:'row',
        backgroundColor:'#fff',
        alignItems:'center',
        marginBottom:30
    },
    info_title:{
        marginLeft:20,
        fontSize:15,
        color:'#293f66',
        width:65,
        textAlign:'right'
    },
    input:{
        flex:1,
        paddingLeft:20,
        fontSize:15,
        height:50,
        lineHeight:50,
        color:'#293f66',
        paddingBottom:15,
        paddingTop:15,
    },
    nextBtn:{
        backgroundColor:'#b5d0ff',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:44,
        marginLeft:20,
        marginRight:20,
        borderRadius:4,
        marginBottom:20
    },
    nextBtn_click:{
        flex:1,
         flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    nextBtn_text:{
        color:'#fff',
        fontSize:17
    },
    can:{
        backgroundColor:'#2676ff'
    },
});
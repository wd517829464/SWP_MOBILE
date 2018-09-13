/**
 * Created by yuanguozheng on 16/1/19.
 */
'use strict';

import React, {
    Component,
} from 'react';

import {
    Image,
    ListView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    Platform,
    TextInput,
    BackHandler
} from 'react-native';

var Dimensions = require('Dimensions');
var width=Dimensions.get('window').width;
var height=Dimensions.get('window').height;
import NetUitl from './util/NetUitl';
import Toast, { DURATION } from 'react-native-easy-toast';
import AreaSelectScreen from './component/AreaSelectScreen';
import ProvinceSelect from './component/ProvinceSelect';
import BindStatusScreen from './BindStatusScreen';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
export default class CreateEnterScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            enterName:'',
            enterAddress:'',
            areaCode:'',
            areaName:'',
            showAreaSelect:false,
            showProvinceSelect:false,
            province:'',
            provinceName:'',
            entType:'DISPOSITION'
        }
        this.back = this.back.bind(this);
    }
 
    sendData(){
        if(!this.state.enterName){
            this.refs.toast.show('请填写企业名称');
            return;
        }
        if(!this.state.areaCode){
            this.refs.toast.show('请选择行政区划');
            return;
        }
        if(this.state.entType=='DIS_FACILITATOR'&&!this.state.province){
            this.refs.toast.show('请选择代理省份');
            return;
        }
        NetUitl.ajax({
            url:'/enterprise/saveAllEnterpriseInfo.htm',
            data:{
                enterprisename:this.state.enterName,
                enterprisecode:new Date().getTime(),
                enterpriseaddress:this.state.enterAddress,
                cantonCode:this.state.areaCode,
                responsibleArea:this.state.province,
                entType:this.state.entType,
                ticketId:this.props.ticketId
            },
            success:(data)=>{
                console.log(data);
                 if(data.status==1){
                    this.refs.toast.show('创建成功!');
                    var {navigator,ticketId}=this.props;
                    if(navigator){
                        navigator.push({
                            name: 'BindStatusScreen',
                            component: BindStatusScreen,
                            params: {
                                ticketId:ticketId,
                                navigator:navigator,
                                enterId:data.data,
                                userStatus:'SUBMIT',
                                enterStatus:'SUBMIT',
                                entType:this.state.entType
                            }
                        });
                    }
                }
            }
        });
    }
    back(){
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressBind', this.back);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBind',this.back);
    }
    render() {
        return (
            <View style={{flex:1,backgroundColor:'#f7f8fa'}}>
               <StatusBar barStyle="light-content" />
                <View style={styles.mytop}>
                    <TouchableOpacity onPress={this.back.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_back.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <View style={styles.middleView}><Text style={styles.middleText}>创建企业</Text></View>
                    <View style={{width:12}}></View>
                </View>
                <View style={styles.info}>
                    <Text style={styles.info_title}>企业名称</Text><Text style={{color:'#ff0000',marginLeft:4}}>*</Text>
                    <TextInput style={styles.input} numberOfLines={1} placeholder="输入企业名称" 
                    underlineColorAndroid={"transparent"} onChangeText={(text)=>{this.setState({enterName:text})}} />
                </View>
                <View style={[styles.info,{marginBottom:14}]}>
                    <Text style={styles.info_title}>行政区划</Text><Text style={{color:'#ff0000',marginLeft:4}}>*</Text>
                    <TouchableOpacity onPress={()=>{this.setState({showAreaSelect:true})}} style={[styles.btn,this.state.areaName?{backgroundColor:'#2d7cff'}:null]}>
                        <Text style={[{color:'#2d7cff',alignSelf:'center',fontSize:14},this.state.areaName?{color:'#fff'}:null]}>{this.state.areaName?this.state.areaName:'选择区域'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.info,this.state.entType=='DIS_FACILITATOR'?{marginBottom:14}:null]}>
                    <Text style={styles.info_title}>企业类型</Text><Text style={{color:'#ff0000',marginLeft:4}}>*</Text>
                    <TouchableOpacity onPress={()=>{this.setState({entType:'DISPOSITION'})}} style={[styles.btn,this.state.entType=='DISPOSITION'?{backgroundColor:'#2d7cff'}:null]}>
                        <Text style={[{color:'#2d7cff',alignSelf:'center',fontSize:14},this.state.entType=='DISPOSITION'?{color:'#fff'}:null]}>处置企业</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{this.setState({entType:'DIS_FACILITATOR'})}} style={[styles.btn,{marginLeft:10},this.state.entType=='DIS_FACILITATOR'?{backgroundColor:'#2d7cff'}:null]}>
                        <Text style={[{color:'#2d7cff',alignSelf:'center',fontSize:14},this.state.entType=='DIS_FACILITATOR'?{color:'#fff'}:null]}>处置代理商</Text>
                    </TouchableOpacity>
                </View>
                {this.state.entType=='DIS_FACILITATOR'?
                <View style={styles.info}>
                    <Text style={styles.info_title}>代理省份</Text><Text style={{color:'#ff0000',marginLeft:4}}>*</Text>
                    <TouchableOpacity onPress={()=>{this.setState({showProvinceSelect:true})}} style={[styles.btn,this.state.provinceName?{backgroundColor:'#2d7cff'}:null]}>
                        <Text style={[{color:'#2d7cff',alignSelf:'center',fontSize:14},this.state.provinceName?{color:'#fff'}:null]}>{this.state.provinceName?this.state.provinceName:'选择代理省份'}</Text>
                    </TouchableOpacity>
                </View>:null}
                <View style={styles.info}>
                    <Text style={styles.info_title}>详细地址</Text>
                    <TextInput style={[styles.input,{marginLeft:9}]} numberOfLines={1} placeholder="输入详细地址" 
                    underlineColorAndroid={"transparent"} onChangeText={(text)=>{this.setState({enterAddress:text})}} />
                </View>
                <TouchableOpacity onPress={this.sendData.bind(this)} 
                    style={{backgroundColor:'#2d7cff',width:width*0.9,height:40,flexDirection:'column',justifyContent:'center',alignSelf:'center',marginTop:20,borderRadius:4}}>
                    <Text style={{color:'#fff',alignSelf:'center',fontSize:16}}>提交</Text>
                </TouchableOpacity>
                {this.state.showAreaSelect?<AreaSelectScreen areaCode={this.state.areaCode} callbackParent={(text)=>{this.onChildChanged(text)}}/>:null}
                {this.state.showProvinceSelect?<ProvinceSelect province={this.state.province} callbackParent={(text)=>{this.onChildChanged2(text)}}/>:null}
                <Toast ref="toast" />
            </View>
        );
    }
    onChildChanged(obj){
        // alert(JSON.stringify(obj));
        if(obj.action=='cancel'){
            this.setState({
                showAreaSelect:false
            })
        }else{
            this.setState({
                showAreaSelect:false,
                areaCode:obj.param.areaCode,
                areaName:obj.param.areaName
            })
        }
    }
    onChildChanged2(obj){
        // alert(JSON.stringify(obj));
        if(obj.action=='cancel'){
            this.setState({
                showProvinceSelect:false
            })
        }else{
            this.setState({
                showProvinceSelect:false,
                province:obj.param.areaCode,
                provinceName:obj.param.areaName
            })
        }
    }
     
}

const styles = StyleSheet.create({
    btn:{
        borderColor:'#2d7cff',borderWidth:1,width:100,height:30,flexDirection:'column',justifyContent:'center',alignSelf:'center',marginLeft:20,borderRadius:4
    },
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
        marginBottom:5,
        marginTop:5
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
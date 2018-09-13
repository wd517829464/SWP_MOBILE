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
    ScrollView,
    Button,
    Alert,
    TextInput,
    TouchableOpacity,
    DeviceEventEmitter,
    Switch,
    NativeModules,
    BackHandler,
    Platform,
    DatePickerAndroid
} from 'react-native';
import Top from './component/Top';
import TagItem from './component/TagItem';
import NetUitl from './util/NetUitl';
import BaseScreen from './base';
import Constants from './util/Constants';
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
import Toast, { DURATION } from 'react-native-easy-toast';
var downTextWidth=widths-90;

const TYPE_OPTIONS = [];
const dispositionTypes=[];
const buyWasteResourcePageData={};
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
var TAGSTATUS={'TAGGING':'自由标记','SAMPLING':'取样中','SAMPLED':'已取样','DELIVERED_LAB':'已送实验室','QUALIFIED':'合格','UNQUALIFIED':'不合格','DRAFTCONTRACT':'合同已拟定','SIGNCONTRACT':'合同已签定','DELIVERYCONTRACT':'合同已寄出'};
export default class AddTagScreen extends Component {
    constructor(props) {
  super(props);
  this.state = {
    tagType:'TAGING',
    say:'',
    sampleDate:'',
    sampleName:'',
    sampleMobile:'',
    contractStatus:'',
    sampleStatus:''
  };
    this.backKeyPressed = this.backKeyPressed.bind(this);
}
componentWillMount(){
    this.sampleDate=new Date();
}

    componentDidMount(){
        
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressBuy',this.backKeyPressed);
    }
    backKeyPressed(){
        this.goBack();
        return true;
    }
    goBack(){
       const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
   }
   changeTagType(type){
    this.setState({
        tagType:type
    })
   }
   async showTime(){
    try {
        const {action, year, month, day} =await DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: this.sampleDate
        });
        if (action === DatePickerAndroid.dismissedAction) {
            // Alert.alert('关闭');
          } else {
            this.sampleDate = new Date(year,month,day);
            this.setState({
                sampleDate:this.sampleDate.Format("yyyy-MM-dd")
            })
            // Alert.alert(date.Format("yyyy-MM-dd"));
          }
      } catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
   }
    render() {
        // <SelectCFItem navigator={this.props.navigator} rowData={rowData} sectionID={sectionID} rowID={rowID} ticketId={this.props.ticketId}/>
        // <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"选择产废资源"}/>
        // {this.state.loading?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../images/base/load.gif')} />:null}
        return (
            <View style={{flex:1,paddingBottom:60,backgroundColor:'#fff'}}>
                <Top navigator={this.props.navigator} ticketId={this.props.ticketId} title={"标记"}/>
                <ScrollView>
                <View style={{paddingLeft:15,paddingRight:15,borderColor:'#cad5e7',borderBottomWidth:1,paddingBottom:14}}>
                    <Text style={styles.title}>选择要添加的标记类型</Text>
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <TouchableOpacity style={[styles.item,this.state.tagType=='TAGING'?styles.active:{}]} onPress={()=>{this.changeTagType('TAGING')}}>
                            {
                                this.state.tagType=='TAGING'?<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_ziyou_p.png')} />
                                :<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_ziyou_n.png')} />
                            }
                            <Text style={[styles.tagText,this.state.tagType=='TAGING'?styles.select:{}]}>自由标记</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.item,{marginLeft:10,marginRight:10},this.state.tagType=='SAMPLING'?styles.active:{}]}  onPress={()=>{this.changeTagType('SAMPLING')}}>
                            {
                                this.state.tagType=='SAMPLING'?<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_quyang_p.png')} />
                                :<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_quyang_n.png')} />
                            }
                            <Text style={[styles.tagText,this.state.tagType=='SAMPLING'?styles.select:{}]}>取样标记</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.item,{marginRight:10},this.state.tagType=='SAMPLE'?styles.active:{}]}  onPress={()=>{this.changeTagType('SAMPLE')}}>
                            {
                                this.state.tagType=='SAMPLE'?<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_yangpin_p.png')} />
                                :<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_yangpin_n.png')} />
                            }
                            <Text style={[styles.tagText,this.state.tagType=='SAMPLE'?styles.select:{}]}>样品标记</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.item,this.state.tagType=='CONTRACT'?styles.active:{}]}  onPress={()=>{this.changeTagType('CONTRACT')}}>
                            {
                                this.state.tagType=='CONTRACT'?<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_hetong_p.png')} />
                                :<Image style={styles.tagIcon} resizeMode={Image.resizeMode.contain} source={require('../images/tag/tag_hetong_n.png')} />
                            }
                            <Text style={[styles.tagText,this.state.tagType=='CONTRACT'?styles.select:{}]}>合同标记</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.tagType=='TAGING'?
                <View style={{paddingLeft:15,paddingRight:15}}>
                    <Text style={styles.title}>自由标记内容</Text>
                    <TextInput  underlineColorAndroid={"transparent"}
                        multiline={true}
                        numberOfLines={4}
                        maxLength={60}
                        onChangeText={(text) => this.setState({say:text})}
                        value={this.state.say}
                        style={styles.input}
                        placeholder='输入自由标记内容'
                        placeholderTextColor='#8f9fc1'
                    />
                </View>:null}
                {this.state.tagType=='SAMPLING'?
                <View style={{paddingLeft:15,paddingRight:15}}>
                    <Text style={styles.title}>取样时间</Text>
                    <TouchableOpacity onPress={this.showTime.bind(this)}>
                        <TextInput  underlineColorAndroid={"transparent"}
                            maxLength={60}
                            editable={false}
                            value={this.state.sampleDate}
                            style={styles.input}
                            placeholder='选择日期'
                            placeholderTextColor='#8f9fc1'
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>联系人姓名</Text>
                    <TextInput  underlineColorAndroid={"transparent"}
                        maxLength={60}
                        onChangeText={(text) => this.setState({sampleName:text})}
                        value={this.state.sampleName}
                        style={styles.input}
                        placeholder='输入联系人姓名'
                        placeholderTextColor='#8f9fc1'
                    />
                    <Text style={styles.title}>联系人电话</Text>
                    <TextInput  underlineColorAndroid={"transparent"}
                        maxLength={60}
                        onChangeText={(text) => this.setState({sampleMobile:text})}
                        value={this.state.sampleMobile}
                        keyboardType='numeric'
                        style={styles.input}
                        placeholder='输入联系人电话'
                        placeholderTextColor='#8f9fc1'
                    />
                </View>:null}
                {this.state.tagType=='SAMPLE'?
                <View style={{paddingLeft:15,paddingRight:15}}>
                    <Text style={styles.title}>选择样品标记</Text>
                    <TouchableOpacity style={[styles.optionTouch,this.state.sampleStatus=='SAMPLED'?styles.active:{}]} onPress={()=>{this.setState({sampleStatus:'SAMPLED'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='SAMPLED'?styles.select:{}]}>已取样</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionTouch,this.state.sampleStatus=='DELIVERED_LAB'?styles.active:{}]} onPress={()=>{this.setState({sampleStatus:'DELIVERED_LAB'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='DELIVERED_LAB'?styles.select:{}]}>已送实验室</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionTouch,this.state.sampleStatus=='QUALIFIED'?styles.active:{}]} onPress={()=>{this.setState({sampleStatus:'QUALIFIED'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='QUALIFIED'?styles.select:{}]}>合格</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionTouch,this.state.sampleStatus=='UNQUALIFIED'?styles.active:{}]} onPress={()=>{this.setState({sampleStatus:'UNQUALIFIED'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='UNQUALIFIED'?styles.select:{}]}>不合格</Text>
                    </TouchableOpacity>
                </View>:null}
                {this.state.tagType=='CONTRACT'?
                <View style={{paddingLeft:15,paddingRight:15}}>
                    <Text style={styles.title}>选择合同标记</Text>
                    <TouchableOpacity style={[styles.optionTouch,this.state.contractStatus=='DRAFTCONTRACT'?styles.active:{}]} onPress={()=>{this.setState({contractStatus:'DRAFTCONTRACT'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='DRAFTCONTRACT'?styles.select:{}]}>合同已拟定</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionTouch,this.state.contractStatus=='DELIVERYCONTRACT'?styles.active:{}]} onPress={()=>{this.setState({contractStatus:'DELIVERYCONTRACT'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='DELIVERYCONTRACT'?styles.select:{}]}>合同已寄出</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionTouch,this.state.contractStatus=='SIGNCONTRACT'?styles.active:{}]} onPress={()=>{this.setState({contractStatus:'SIGNCONTRACT'})}}>
                        <Text style={[styles.optionText,this.state.contractStatus=='SIGNCONTRACT'?styles.select:{}]}>合同已签定</Text>
                    </TouchableOpacity>
                </View>:null}
                </ScrollView>
                <View style={styles.btn_view}>
                    <TouchableOpacity style={styles.btn_touch} onPress={this.saveTag.bind(this)}>
                        <Text style={styles.chat_title}>保存标记</Text>
                    </TouchableOpacity>
                </View>
                <Toast ref="toast"/>
             </View>
        );
    }

   goCart(){
         const { navigator } = this.props;
         navigator.push({
            name: 'BaseScreen',
            component: BaseScreen,
            params: {
                navigator:navigator,
                ticketId:this.props.ticketId,
                selectedTab:'cart'
            }
        });
    }
    getParamInfo(){
        var param={
            releaseId:this.props.releaseId,
            tagType:this.state.tagType
        }
        switch (this.state.tagType){
            case 'TAGING':
                if(this.state.say==''){
                    this.refs.toast.show('请输入自由评论内容'); 
                    return false;
                }
                param.comments=this.state.say;
                param.tagStatus='TAGGING';
                break;
            case 'SAMPLING':
                if(this.state.sampleDate==''){
                    this.refs.toast.show('请选择取样日期'); 
                    return false;
                }
                if(this.state.sampleName==''){
                    this.refs.toast.show('请输入联系人姓名'); 
                    return false;
                }
                if(this.state.sampleMobile==''){
                    this.refs.toast.show('请输入联系人电话'); 
                    return false;
                }
                param.sampleDate=this.sampleDate;
                param.contacts=this.state.sampleName;
                param.contactsTel=this.state.sampleMobile;
                param.tagStatus='SAMPLING';
                break;
            case 'SAMPLE':
                if(this.state.sampleStatus==''){
                    this.refs.toast.show('请选择样品状态'); 
                    return false;
                }
                param.tagStatus=this.state.sampleStatus;
                break;
            case 'CONTRACT':
                if(this.state.contractStatus==''){
                    this.refs.toast.show('请选择合同状态'); 
                    return false;
                }
                param.tagStatus=this.state.contractStatus;
                break;
        }
        return param;
    }
    saveTag(){
        var _this=this;
        var param=this.getParamInfo();
        if(!param){
            return;
        }
        NetUitl.jsonAjax({
            url:'/discussTag/saveDiscussTag.htm?ticketId='+this.props.ticketId,
            data:param,
            success:(result)=>{
                if(result.status&&result.data){
                    DeviceEventEmitter.emit('addTagSuccess',true);
                    this.goBack();
                }
            }
        });
    }
}

const styles = StyleSheet.create({
    input:{
        borderColor:'#cad5e7',borderWidth:1,
        paddingLeft:10,
        paddingRight:10,
        paddingTop:5,
        paddingBottom:5,
        borderRadius:4,
        color:'#6b7c98'
    },
    optionTouch:{
        borderColor:'#cad5e7',
        borderWidth:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        height:50,
        marginBottom:10,
        borderRadius:4,
        backgroundColor:'#fff'
    },
    optionText:{
        alignSelf:'center',
        fontSize:15,
        color:'#6b7c98'
    },
    item:{
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#f7f8fa',
        paddingTop:14,
        paddingBottom:12,
        borderRadius:4,
        borderColor:'#f8f8fa',
        borderWidth:1
    },
    active:{
        borderColor:'#2676ff',
        backgroundColor:'#f2f6ff'
    },
    title:{
        color:'#6a7e99',
        marginTop:14,
        marginBottom:12
    },
    select:{
        color:'#347ffe'
    },
    tagIcon:{
        width:30,height:30,
        marginBottom:10
    },
    tagText:{
        color:'#6d7c99'
    },
    btn_view: {
        flexDirection: 'row',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: Dimensions.get('window').width,
        bottom: 0,
        borderTopWidth:1,
        borderColor:'#e7ebf6'
    },
    chat_title: {
        color: '#fff',
        fontSize:16,
    },
    btn_touch: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'#2676ff',
        height:60,
    }
});
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
    ScrollView,
    BackHandler,
    Platform,
} from 'react-native';
import NetUitl from './util/NetUitl'; 
export default class LicenseBMScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            licence:{}
        }
        this.backKeyPressed = this.backKeyPressed.bind(this);

    }
    componentWillMount(){
       this.loadData();
    }
    async loadData(){
        NetUitl.ajax({
            url:'/licenceservice/licence.htm',
            data:{
                ticketId: this.props.ticketId,
                licenceId:this.props.licenceId
            },
            success:(responseJson)=>{
                var responseData = responseJson;
                if (responseData&&responseData.status==1) {
                    var data=responseData.data;
                    
                    this.setState({
                        licence:data.licence
                    });
                }
            }
        });
    }
    componentDidMount() {
        var st = this;
        BackHandler.addEventListener('hardwareBackPressLBM', this.backKeyPressed);
    }
    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPressLBM',this.backKeyPressed);
    }
    backKeyPressed(){
        this.back();
        return true;
    }
    back(){
        const { navigator } = this.props;
        if(navigator){
            navigator.pop();
        }
    }
    render() {
        var {licence}=this.state;
        var start_date_str=licence.start_date+'';
        var end_date_str=licence.end_date+'';
        var start_date=licence.start_date&&start_date_str.length>10?start_date_str.substring(0,10):'';
        var end_date=licence.end_date&&end_date_str.length>10?end_date_str.substring(0,10):'';
        return (
            <View style={{flex:1,paddingBottom:30}}>
                <StatusBar barStyle="default" />
                <View style={styles.top}>
                    <TouchableOpacity onPress={this.back.bind(this)} style={styles.headerLeftIconView}>
                        <Image source={require('../images/navigator/nav_icon_backblue.png')} style={styles.headerLeftIcon} />
                    </TouchableOpacity>
                    <Text style={styles.middleText}>许可证基本信息</Text>
                    <Text></Text>
                </View>
                <ScrollView style={styles.whiteBg}>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>许可证编号</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.licence_no}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>发证机关</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.licence_org}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>发证日期</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.licence_date}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>初次发证日期</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.initiallic_date}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>许可证有效期</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{start_date+'至'+end_date}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>经营单位</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{this.props.entName}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>法定代表人</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.corporate}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>注册地址</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.register_addr}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>经营设施地址</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.machine_addr}</Text></View>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.info_left}><Text style={styles.info_left_text}>经营核准方式</Text></View>
                        <View style={styles.info_right}><Text style={styles.info_right_text}>{licence.operationMode}</Text></View>
                    </View>
                    
                </ScrollView>
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
        marginRight:20,
        fontSize:16
    },
    whiteBg:{
        backgroundColor:'#fff',
    },
    title:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft:20,
        paddingRight:20,
        borderTopWidth:1,
        borderTopColor:'#e9edf7',
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7',
        paddingTop:10,
        paddingBottom:10
    },
    title_left:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    enterIcon:{
        width:18,
        height:18,
        marginRight:10
    },
    title_text:{
        color:'#293f66',
        fontSize:15
    },
    title_btn:{
        color:'#293f66',
        fontSize:14
    },
    info:{
        paddingLeft:20,
        paddingRight:20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor:'#fff',
        paddingTop:15,
        paddingBottom:15,
        borderBottomWidth:1,
        borderBottomColor:'#e9edf7',
    },
    info_left:{
        flex:2,
    },
    info_right:{
        flex:3
    },
    info_left_text:{
        color:'#99a8bf',
        alignSelf:'flex-end',
        paddingRight:30
    },
    info_right_text:{
        color:'#293f66',
    },
    btn:{
        backgroundColor:'#2676ff',
        width:300,
        alignSelf:'center',
        borderRadius:4,
        padding:10,
        marginTop:30
    },
    btn_text:{
        color:'#fff',
        alignSelf:'center'
    }
    
});
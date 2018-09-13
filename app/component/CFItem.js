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
    DeviceEventEmitter
} from 'react-native';

// import CFBuyScreen from '../CFBuyScreen';
import CFSelectScreen from '../CFSelectScreen';
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
export default class CFItem extends Component {
    constructor(props) {
        super(props);
        this.state={
            entType:this.props.entType
        }
    }
    componentWillMount(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.setState({
                entType:ret.entType
            })
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    goInquiry(){
        this.props.callbackParent();
    }
    render() {
        
        const {rowData,rowID,sectionID,planitemReleaseId,headData}=this.props;
        // this.state.entType=='DISPOSITION'&&!rowData.disposable
        // <TouchableOpacity onPress={this.goInquiry.bind(this)}></TouchableOpacity>
        if(rowID==0){
            return (
                <View style={[styles.CFItem,{paddingLeft:10,marginLeft:6,width:widths*0.24,paddingRight:0}]}>
                    <Text style={{backgroundColor:'#2676ff',width:widths*0.08,textAlign:'center',color:'#fff',paddingTop:2,paddingBottom:2,borderRadius:3,fontSize:12}}>总计</Text>
                    <View style={{flexDirection:'row',marginBottom:10,marginTop:10}}><Text style={{color:'#2676ff',fontSize:15,fontWeight:'bold'}}>{this.props.headData.totalWasteCount}</Text><Text style={{color:'#293f66',fontSize:15,fontWeight:'bold'}}>种危废</Text></View>
                    <Text style={{color:'#2676ff',fontSize:15,fontWeight:'bold'}}>{this.props.headData.totalWasteAmountDesc}</Text>
                    <View style={styles.itemSplit}></View>
                </View>
            )
        }else{
            return (
                <TouchableOpacity onPress={this.goInquiry.bind(this)}>
                    <View style={[styles.CFItem,rowID==headData.releaseWasteDetails.length-1?{borderRightWidth:0}:null]}>
                        <Text numberOfLines={1} style={[styles.wasteName]}>{rowData.wasteName}</Text>
                        <Text style={[styles.wasteCode]}>{rowData.wasteCode}</Text>
                        <Text numberOfLines={1} style={[styles.qty]}>{rowData.wasteAmount}{rowData.unitValue}</Text>
                        {rowID<headData.releaseWasteDetails.length-1?<View style={styles.itemSplit}></View>:null}
                        {this.state.entType=='DISPOSITION'&&!rowData.disposable?<Image style={[styles.btn]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/out.png')} />:null}
                    </View>
                </TouchableOpacity>
            );
        }
    }
}

const styles = StyleSheet.create({
    CFItem:{
        backgroundColor:'#fff',
        paddingTop:8,
        paddingBottom:8,
        // paddingRight:14,
        paddingLeft:widths*0.03,
        width:widths*0.27,
        // marginLeft:8,
        // borderColor:'#e7ebf6',
        // borderRightWidth:1,
        // borderRadius:4,
        marginTop:10,
        marginBottom:10,
        // height:70,
        // paddingLeft:16,
        // paddingRight:16,
        flexDirection:'column',
        justifyContent: 'center',
        overflow:'visible'
        // alignItems:'center'
    },
    itemSplit:{
        backgroundColor:'#e7ebf6',width:1,position:'absolute',right:1,height:70,zIndex:10
    },
    wasteName:{
        color:'#293e69',
        height:18,
        fontSize:15,
        fontWeight:'bold',
        width:widths*0.22
    },
    wasteCode:{
        color:'#6c7d99',
        marginTop:12,
        marginBottom:12,
        fontSize:15
        // paddingBottom:10,
        // borderColor:'#e6efff',
        // borderBottomWidth:1
    },
    qty:{
        color:'#1171d1',
        fontWeight:'bold',
        fontSize:15
    },
    grey:{
        backgroundColor:'#f7f8fa',
    },
    greyText:{
        color:'#bcc4d9'
    },
    btn:{
        width:64,
        height:64,
        position:'absolute',
        right:10,
        bottom:0
    },
});
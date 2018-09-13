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
    PixelRatio,
} from 'react-native';

import Constants from '../util/Constants';

var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width * PixelRatio.get();

export default class MyScreenTop extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        
        const {sysEnterpriseBaseVo}=this.props;
        // const sysEnterpriseBaseVo=sysEnterpriseBaseVo1?sysEnterpriseBaseVo1:{};
        var entTypeStr='';
        if(sysEnterpriseBaseVo&&sysEnterpriseBaseVo.entTypes&&sysEnterpriseBaseVo.entTypes.length>0){
            entTypeStr=sysEnterpriseBaseVo.entTypes[0].code;//
        }
        let head=require('../../images/mine/profile_icon_infor.png');
        if(sysEnterpriseBaseVo.imgBusinessCode&&sysEnterpriseBaseVo.imgFileId){
            head={uri:Constants.IMG_SERVICE_URL+'&businessCode='+sysEnterpriseBaseVo.imgBusinessCode+'&fileID='+sysEnterpriseBaseVo.imgFileId};
        }
        return (
            <View style={{backgroundColor:'#2676ff',alignContent:"center",alignItems:"center"}}>
                <View style={styles.bg}  width={widths}  source={require('../../images/mine/profile_bg.png')}>
                    <Image style={styles.enterlogo} resizeMode={Image.resizeMode.contain} source={head}/>
                    <View style={[styles.enterType,{backgroundColor:entTypeStr=='DISPOSITION'?'#18d0d8':'#99a8bf'}]}><Text style={styles.enterTypeText}>{entTypeStr=='DISPOSITION'?'处置企业':'产废企业'}</Text></View>
                    <View style={styles.enterName}><Text style={styles.enterNameText}>{sysEnterpriseBaseVo.entName}</Text></View>
                    <View style={styles.enterCode}><Text style={styles.enterCodeText}>企业代码：{sysEnterpriseBaseVo.entCode}</Text></View>
                    <View style={styles.enterSplit}><Text style={styles.enterSplitText}>---------------------------------------------------------------</Text></View>
                    <View style={styles.enterAddress}>
                        <Image style={styles.enterAddressIcon} resizeMode={Image.resizeMode.contain} source={require('../../images/mine/profile_icon_location.png')}/>
                        <Text style={styles.enterAddressText}>{sysEnterpriseBaseVo.entAddress}  {sysEnterpriseBaseVo.distance}</Text>
                    </View>
                </View>
                
            </View>
            
        );
    }
     
}

const styles = StyleSheet.create({
    bg:{
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor:'transparent',
        borderWidth:0,
        marginTop:-1,
        paddingLeft:20,
        paddingRight:20,
        paddingTop:12,//android only
        paddingBottom:12,
    },
    enterlogo:{
        width:60,
        height:60,
        margin:10,
        marginTop:0,
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
        paddingBottom:10,
    },
    enterAddressIcon:{
        width:14,
        height:14,
        marginRight:5
    },
    enterAddressText:{
        color:'#fff',
        marginRight:20,
        fontSize:14,
        maxWidth:Dimensions.get('window').width-80
    },
    enterAddressArrow:{
        color:'#fff',
        fontSize:16
    },
    enterSplitText:{
        color:'#fff',
        height:18
    }
});
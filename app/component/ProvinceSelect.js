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
    TextInput,
    Platform,
    Text,
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import ChinaCity from '../util/ChinaCity';
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var top=(Platform.OS === "ios")?110:0;
var provinceList=['110000','120000','310000','810000','820000','710000'];
export default class ProvinceSelect extends Component {
    constructor(props) {
        super(props);
        this.state={
            provinceCode:this.props.province,
        }
    }
    callbackParent(type){
        if(type=='confirm'){
            var cityName=ChinaCity.provinces[this.state.provinceCode];
            this.props.callbackParent({
                action:'confirm',
                param:{areaCode:this.state.provinceCode,areaName:cityName}
            });
        }else{
            this.props.callbackParent({
                action:'cancel',
            });
        }
    }
    changeProvince(code){
        this.setState({provinceCode:code})
    }
    getProvinceListView(){
        var provinces=ChinaCity['provinces'];
        let arr=[];
        for(var code in provinces){
            var name=provinces[code];
            arr.push(
                <View style={[styles.province_item,this.state.provinceCode==code?{borderColor:'#2676ff',borderWidth:1}:null]} key={code}>
                    <TouchableOpacity style={[styles.provinceItem_click]} onPress={this.changeProvince.bind(this,code)}>
                        <Text style={[styles.province_item_text,{color:this.state.provinceCode==code?'#2676ff':'#293f66'}]}>{name}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        return arr;
    }
    render() {
        let provinceListView=this.getProvinceListView();
        return (
        <View style={styles.Dialog} width={widths} height={heights} top={0}>
            <View style={styles.mytop}>
                <View></View>
                <View style={styles.middleView}><Text style={styles.middleText}>选择代理省份</Text></View>
                <View></View>
            </View>
            <View style={styles.province_list} width={widths}>
                    {provinceListView}
            </View>
            <View style={styles.btn}>
                <View style={styles.cancle_btn}>
                 <TouchableOpacity style={styles.btn_click} onPress={this.callbackParent.bind(this,'cancel')}><Text style={styles.cancle_btn_text}>取消</Text></TouchableOpacity>
                </View>
                <View style={styles.confirm_btn}>
                  <TouchableOpacity style={styles.btn_click} onPress={this.callbackParent.bind(this,'confirm')}><Text style={styles.confirm_btn_text}>确认</Text></TouchableOpacity>
                </View>
            </View>

         </View>  
            
        )
    }
    
}

const styles = StyleSheet.create({
    mytop:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'#2676ff',
        paddingLeft:20,
        paddingRight:20,
        paddingTop:(Platform.OS === "ios")?35:15,
        paddingBottom:15,
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
        paddingTop:20,
        paddingBottom:20,
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
        lineHeight:40
    },
   Dialog:{
       position: 'absolute',
       backgroundColor:'rgba(0,0,0,.4)',
       zIndex:100,
       flexDirection:'column',
       flex:1,
       alignSelf:'flex-end',
    //    borderRadius: 10, 
   },
   cityTabView:{
      backgroundColor:'#ffffff',
      height:50,
      flexDirection:'row',
      alignItems:'center',
      borderColor:'#e6ebf5',
      borderBottomWidth:1
   },
   cityTab:{
       flex:1,
       flexDirection:'row',
       justifyContent:'center',
       alignItems:'center',
   },
   touchableArea:{
        // flex:1,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'center',
        height:34,
        borderColor:'#2676ff',
        borderRadius:8,
        width:150,
        paddingLeft:5,
        paddingRight:5,
    },
    tab_text:{
        fontSize:13
    },
    dropdown_icon_arow:{
        width:10,
        height:10
    },
    province_list:{
        backgroundColor:'#fff',
        paddingTop:0,
        paddingBottom:0,
        height:(Dimensions.get('window').height-300),
        flexDirection:'row',
        flexWrap:'wrap',
        overflow:'scroll'
    },
    province_item:{
        backgroundColor:'#f0f3fa',
        justifyContent:'center',
        alignItems:'center',
        width:(Dimensions.get('window').width-120)/4,
        height:30,
        marginLeft:15,
        marginRight:15,
        marginTop:5,
        marginBottom:5,
        paddingLeft:2,
        paddingRight:2,
        borderRadius:4,
    },
    province_item_text:{
        color:'#293f66',
    },
    provinceItem_click:{
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        // backgroundColor:'#ff0',
        width:(Dimensions.get('window').width-120)/4,
    },
    citylist:{
        flex:1
    },
    countrylist:{
        flex:1
    },
    cityItem:{
        backgroundColor:'#f0f3fa',
        borderColor:'#E6EDF5',
        borderTopWidth:1,
        borderBottomWidth:1,
    },
    countryItem:{
        backgroundColor:'#fff',
        borderColor:'#E6EDF5',
        borderTopWidth:1,
        borderBottomWidth:1,
    },
    cityItem_text:{
        color:'#293f66',
        alignSelf:'center'
    },
    countryItem_text:{
        color:'#293f66',
        alignSelf:'center'
    },
    cityItem_click:{
        flex:1,
        height:40,
        flexDirection:'column',
        justifyContent:'center'
    },
    btn:{
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#fff',
    },
    btn_click:{
        flex:1,
        height:40,
        flexDirection:'column',
        justifyContent:'center'
    },
    cancle_btn:{
        flex:1,
        backgroundColor:'#e6ebf5',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        height:40
    },
    cancle_btn_text:{
        color:'#8c9dbf',
        alignSelf:'center',
        fontSize:15
    },
    confirm_btn:{
        flex:1,
        backgroundColor:'#2676ff',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        height:40
    },
    confirm_btn_text:{
        color:'#fff',
        alignSelf:'center',
        fontSize:15
    }
});
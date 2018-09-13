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
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var top=(Platform.OS === "ios")?110:90;
import WasteInfoList from '../util/WasteInfo';
export default class RemoveScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            code:'',
            codeIndex:0,
            wasteCode:'',
            codeList:this.props.codeList||{},
            currentHWCode:'HW01'
        }
    }
    changeCity(code,index){
        var codeList=this.state.codeList;
        if(codeList[code]==undefined){
            codeList[code]=index;
        }
        this.setState({
            codeList:codeList,
            currentHWCode:code,
            codeIndex:index
        });
    }
    changeCountry(code,i){
        var codeList=this.state.codeList;
        var currentHWCode=this.state.currentHWCode;
        if(typeof codeList[currentHWCode]=='number'||typeof codeList[currentHWCode]=='string'){
            codeList[currentHWCode]=[code];
        }else{
            var index;
            if(codeList[currentHWCode]){
                index=codeList[currentHWCode].indexOf(code);
            }else{
                index=-1;
                codeList[currentHWCode]=[];
            }
            if(index>-1){
                codeList[currentHWCode].splice(index,1);
                if(codeList[currentHWCode].length==0){
                    delete codeList[currentHWCode];
                }
            }else{
                codeList[currentHWCode].push(code);
            }
        }
        this.setState({
            codeList:codeList
        });
    }
    selectAllCountry(){
        var codeList=this.state.codeList;
        var currentHWCode=this.state.currentHWCode;
        if(codeList[currentHWCode]){
            delete codeList[currentHWCode];
        }else{
            codeList[currentHWCode]=this.state.codeIndex;
        }
        this.setState({
            codeList:codeList
        });
    }
    unSelectCountry(){
        var codeList=this.state.codeList;
        var currentHWCode=this.state.currentHWCode;
        delete codeList[currentHWCode];
        this.setState({
            codeList:codeList
        });
    }
    getCityItem(){
        var arr=[];
        for(var i in WasteInfoList){
            var code=WasteInfoList[i]['code'];
            arr.push(
                <View style={[styles.cityItem,{backgroundColor:this.state.currentHWCode==code?'#fff':'#f0f3fa'}]} key={code}>
                    <TouchableOpacity style={styles.cityItem_click} onPress={this.changeCity.bind(this,code,i)}>
                         <Text style={styles.cityItem_text}>{code}</Text>
                         <Text style={[styles.cityItem_text,{'color':'#1171d1',width:50,marginLeft:10}]}>
                         {this.state.codeList[code]!=undefined?
                         (typeof this.state.codeList[code]=='string'||typeof this.state.codeList[code]=='number'?'(全选)':
                         ('(已选'+this.state.codeList[code].length+')')):''
                        }
                         </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return arr;
    }
    getCountryItem(codeIndex){
        var countrys=WasteInfoList[codeIndex]['wasteList'];
        var arr=[];
        arr.push(
            <View style={styles.countryItem}  key={-1}>
                <TouchableOpacity style={styles.cityItem_click} onPress={this.selectAllCountry.bind(this)}>
                    <Text style={[styles.countryItem_text,{color:typeof this.state.codeList[this.state.currentHWCode]=='string'||typeof this.state.codeList[this.state.currentHWCode]=='number'?'#2676ff':'#293f66'}]}>
                    全选
                    </Text>
                </TouchableOpacity>
            </View>
        );
        for(var i in countrys){
            var code=countrys[i]['code'];
            arr.push(
                <View style={styles.countryItem} key={code}>
                    <TouchableOpacity style={styles.cityItem_click} onPress={this.changeCountry.bind(this,code,i)}>
                        <Text style={[styles.countryItem_text,{color:this.state.codeList[this.state.currentHWCode]&&this.state.codeList[this.state.currentHWCode].indexOf(code)>-1?'#2676ff':'#293f66'}]}>{code}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return arr;
    }
    closeAreaDialog(){
        DeviceEventEmitter.emit('removeSelect',{});
        DeviceEventEmitter.emit('closeDialog','');
    }
    confirmArea(){
        DeviceEventEmitter.emit('removeSelect',this.state.codeList);
        DeviceEventEmitter.emit('closeDialog','');
    }
    render() {
        let cityListView=this.getCityItem();
        let countryListView=this.getCountryItem(this.state.codeIndex);
        return (
        <View style={styles.Dialog} width={widths} height={heights-top} top={top}>
            <View style={styles.province_list} width={widths}>
                <ScrollView style={styles.citylist}>
                    {cityListView}
                </ScrollView>
                <ScrollView style={styles.countrylist}>
                    {countryListView}
                </ScrollView>
            </View>
            <View style={styles.btn}>
                <View style={styles.cancle_btn}>
                <TouchableOpacity style={styles.btn_click} onPress={this.closeAreaDialog.bind(this)}><Text style={styles.cancle_btn_text}>重置</Text></TouchableOpacity>
                </View>
                <View style={styles.confirm_btn}>
                <TouchableOpacity style={styles.btn_click} onPress={this.confirmArea.bind(this)}><Text style={styles.confirm_btn_text}>确认</Text></TouchableOpacity>
                </View>
            </View>
         </View>  
            
        )
    }
    
}

const styles = StyleSheet.create({
   Dialog:{
       position: 'absolute',
       backgroundColor:'rgba(0,0,0,.4)',
       zIndex:1,
       flexDirection:'column',
       flex:1,
       alignSelf:'center',
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
        height:(Dimensions.get('window').height-280),
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
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
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
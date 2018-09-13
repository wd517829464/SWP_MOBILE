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
var top=(Platform.OS === "ios")?110:90;
var provinceList=['110000','120000','310000','810000','820000','710000'];
export default class AreaScreen extends Component {
    constructor(props) {
        super(props);
        console.log('this.props.areaCode=='+this.props.areaCode);
        var areaCodeObj=this.getCityDataByCode(this.props.areaCode+'');
        this.state={
            tabIndex:0,
            provinceCode:areaCodeObj.provinceCode,
            cityCode:areaCodeObj.cityCode,
            countryCode:areaCodeObj.countryCode,
            provinceName:areaCodeObj.provinceName,
            cityName:areaCodeObj.cityName,
            countryName:areaCodeObj.countryName
        }
    }
    getCityDataByCode(areaCode){
        var obj={};
        if(!areaCode||areaCode.length<6){
            return {provinceCode:'',cityCode:'',countryCode:'',provinceName:'省份/直辖市',cityName:'城市',countryName:''};
        }
        if(areaCode.substring(2,6)=='0000'){//省
            obj={
                provinceCode:areaCode,
                cityCode:'',
                countryCode:'',
                provinceName:ChinaCity.provinces[areaCode],
                cityName:'城市',
                countryName:''
            }
        }else if(areaCode.substring(4,6)=='00'){//市
            var provinceCode=areaCode.substring(0,2)+'0000';
            // obj.cityCode=areaCode;
            // obj.countryCode='';
            obj={
                provinceCode:provinceCode,
                cityCode:areaCode,
                countryCode:'',
                provinceName:ChinaCity.provinces[provinceCode],
                cityName:ChinaCity[provinceCode][areaCode],
                countryName:''
            }
        }else{//区
            var provinceCode=areaCode.substring(0,2)+'0000';
            var cityCode=areaCode.substring(0,4)+'00';
            obj={
                provinceCode:provinceCode,
                cityCode:cityCode,
                countryCode:areaCode,
                provinceName:ChinaCity.provinces[provinceCode],
                cityName:ChinaCity[provinceCode][cityCode],
                countryName:'/'+ChinaCity[cityCode][areaCode]
            }
        }
        return obj;
    }
    closeAreaDialog(){
        DeviceEventEmitter.emit('areaSelect','close');
    }
    confirmArea(){
        var code=this.state.countryCode?this.state.countryCode:(this.state.cityCode?this.state.cityCode:this.state.provinceCode);
        DeviceEventEmitter.emit('areaSelect',code);
        DeviceEventEmitter.emit('closeDialog','');
        var cityName=this.state.cityName=='城市'||this.state.cityName=='全区'||this.state.cityName==this.state.provinceName?'':('/'+this.state.cityName);
        DeviceEventEmitter.emit('areaName',this.state.provinceName+cityName+this.state.countryName);
    }
    changeTab(tabIndex){
        this.setState({tabIndex:tabIndex});
    }
    changeProvince(code,name){
        if(!code){
            this.setState({
                provinceCode:'',
                cityCode:'',
                countryCode:'',
                provinceName:'全区',
                cityName:'城市',
                countryName:''
            });
            return;
        }
        // alert(code+'name='+name);
        if(code!=this.state.provinceCode){
            this.setState({
                provinceCode:code,
                cityCode:'',
                countryCode:'',
                tabIndex:1,
                provinceName:name,
                cityName:'城市',
                countryName:''
            });
        }
    }
    changeCity(code,name){
        if(!code){
            this.setState({cityCode:'',countryCode:'',cityName:'全区',countryName:''});
            return;
        }
        if(code!=this.state.cityCode){
            this.setState({cityCode:code,countryCode:'',cityName:name,countryName:''});
        }
    }
    changeCountry(code,name){
        if(!code){
            this.setState({countryCode:'',countryName:''});
            return;
        }
        this.setState({countryCode:code,countryName:'/'+name});
    }
    getProvinceListView(){
        var provinces=ChinaCity['provinces'];
        let arr=[];
        arr.push(
            <View style={styles.province_item} key={-1}>
                <TouchableOpacity style={styles.provinceItem_click} onPress={this.changeProvince.bind(this,'','')}>
                    <Text style={[styles.province_item_text,,{color:this.state.provinceCode==''?'#2676ff':'#293f66'}]}>全区</Text>
                </TouchableOpacity>
            </View>
        );
        for(var code in provinces){
            var name=provinces[code];
            arr.push(
                <View style={styles.province_item} key={code}>
                    <TouchableOpacity style={styles.provinceItem_click} onPress={this.changeProvince.bind(this,code,name)}>
                        <Text style={[styles.province_item_text,{color:this.state.provinceCode==code?'#2676ff':'#293f66'}]}>{name}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return arr;
    }
    getCityItem(provinceCode){
        var citys=ChinaCity[provinceCode];
        var currentCode='';
        var arr=[];
        console.log(provinceCode);
        // if(provinceList.indexOf(provinceCode)==-1){
            arr.push(
                <View style={[styles.cityItem]} key={-1}>
                    <TouchableOpacity style={styles.cityItem_click} onPress={this.changeCity.bind(this,'','')}>
                            <Text style={[styles.cityItem_text,{color:this.state.cityCode==''?'#2676ff':'#293f66'}]}>全区</Text>
                    </TouchableOpacity>
                </View>
            );
        // }
        for(var code in citys){
            var name=citys[code];
            currentCode=code;
            arr.push(
                <View style={[styles.cityItem,{backgroundColor:this.state.cityCode==code?'#fff':'#f0f3fa'}]} key={code}>
                    <TouchableOpacity style={styles.cityItem_click} onPress={this.changeCity.bind(this,code,name)}>
                         <Text style={styles.cityItem_text}>{name}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return arr;
    }
    getCountryItem(cityCode){
        var countrys=ChinaCity[cityCode];
        var arr=[];
        arr.push(
            <View style={styles.countryItem} key={-1}>
                <TouchableOpacity style={styles.cityItem_click} onPress={this.changeCountry.bind(this,'','')}>
                    <Text style={[styles.countryItem_text,{color:this.state.countryCode==''?'#2676ff':'#293f66'}]}>全区</Text>
                </TouchableOpacity>
            </View>
        );
        for(var code in countrys){
            var name=countrys[code];
            arr.push(
                <View style={styles.countryItem} key={code}>
                    <TouchableOpacity style={styles.cityItem_click} onPress={this.changeCountry.bind(this,code,name)}>
                        <Text style={[styles.countryItem_text,{color:this.state.countryCode==code?'#2676ff':'#293f66'}]}>{name}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return arr;
    }
    render() {
        let type=this.props.type||'success';
        let content=this.props.title;
        let provinceListView=this.getProvinceListView();
        let cityListView=this.state.provinceCode?this.getCityItem(this.state.provinceCode):[];
        let countryListView=this.state.cityCode?this.getCountryItem(this.state.cityCode):[];
        return (
        <View style={styles.Dialog} width={widths} height={heights-top} top={top}>
            <View style={styles.cityTabView} width={widths}>
                <View style={styles.cityTab}>
                    <TouchableOpacity style={[styles.touchableArea,{borderWidth:this.state.tabIndex==0?1:0,backgroundColor:this.state.tabIndex==0?'#fff':'#f0f3fa'}]} onPress={this.changeTab.bind(this,0)}>
                        <Text style={[styles.tab_text,{color:this.state.tabIndex==0?'#2676ff':'#6b7c99'}]}>{this.state.provinceName}</Text>
                        {this.state.tabIndex==0?
                                    <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                    <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                    </TouchableOpacity>
                </View>
                <View style={styles.cityTab}>
                    <TouchableOpacity style={[styles.touchableArea,{borderWidth:this.state.tabIndex==1?1:0,backgroundColor:this.state.tabIndex==1?'#fff':'#f0f3fa'}]} onPress={this.changeTab.bind(this,1)}>
                    <Text style={[styles.tab_text,{color:this.state.tabIndex==1?'#2676ff':'#6b7c99'}]}>{this.state.cityName+this.state.countryName}</Text>
                    {this.state.tabIndex==1?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.province_list} width={widths}>
                {this.state.tabIndex==0?
                    provinceListView:
                    <View style={styles.province_list} width={widths}>
                        <ScrollView style={styles.citylist}>
                            {cityListView}
                        </ScrollView>
                        <ScrollView style={styles.countrylist}>
                            {countryListView}
                        </ScrollView>
                    </View>
            }
            </View>
            <View style={styles.btn}>
                <View style={styles.cancle_btn}>
                 <TouchableOpacity style={styles.btn_click} onPress={this.closeAreaDialog.bind(this)}><Text style={styles.cancle_btn_text}>取消</Text></TouchableOpacity>
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
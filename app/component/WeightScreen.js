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
var top=(Platform.OS === "ios")?110:92;
import weightList from '../util/WeightList';
export default class WeightScreen extends Component {
    constructor(props) {
        super(props);
        this.state={
            weight:this.props.weight||''
        }
    }
    changeWeight(value){
        this.setState({weight:value});
        DeviceEventEmitter.emit('weightSelect',value);
    }
    getWeightListView(){
        let arr=[];
        arr.push(
            <View style={[styles.province_item,this.state.weight==-1?styles.active:{}]} key={-1} width={widths-30}>
                <TouchableOpacity style={[styles.provinceItem_click,{width:widths-24}]} onPress={this.changeWeight.bind(this,-1)}>
                    <Text style={[styles.province_item_text,{color:this.state.weight==-1?'#2676ff':'#293f66'}]}>不限</Text>
                </TouchableOpacity>
            </View>
        );
        for(var i in weightList){
            var name=weightList[i]['name'];
            var value=weightList[i]['value'];
            arr.push(
                <View style={[styles.province_item,this.state.weight==i?styles.active:{}]} key={i}>
                    <TouchableOpacity style={styles.provinceItem_click} onPress={this.changeWeight.bind(this,i)}>
                        <Text style={[styles.province_item_text,{color:this.state.weight==i?'#2676ff':'#293f66'}]}>{name}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return arr;
    }
    render() {
        var weightList=this.getWeightListView();
        return (
        <View style={styles.Dialog} width={widths} height={150} top={top}>
            <View style={styles.province_list} width={widths}>
                {weightList}
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
        width:(Dimensions.get('window').width-75)/4,
        height:30,
        marginLeft:15,
        marginTop:5,
        marginBottom:10,
        paddingLeft:2,
        paddingRight:2,
        borderRadius:4,
    },
    province_item_text:{
        color:'#293f66',
        fontSize:12
    },
    active:{
        borderColor:'#2676ff',
        borderWidth:1,
        backgroundColor:'#fff'
    },
    provinceItem_click:{
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        // backgroundColor:'#ff0',
        // width:(Dimensions.get('window').width-40)/4,
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
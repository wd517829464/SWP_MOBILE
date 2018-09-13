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
// import CFSelectScreen from '../CFSelectScreen';

export default class InquiryItem extends Component {
    constructor(props) {
        super(props);
    }
    // goInquiry(){
    //     var _this = this;
    //     const { navigator} = this.props;
    //     if (navigator) {
    //         navigator.push({
    //             name:'CFSelectScreen',
    //             component:CFSelectScreen,
    //             params:{
    //                 navigator:navigator,
    //                 ticketId:this.props.ticketId,
    //                 headData:this.props.headData
    //             }
    //         })
    //     }
    // }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        const {rowData,rowID,sectionID,headData}=this.props;
        // <TouchableOpacity onPress={this.goInquiry.bind(this)}></TouchableOpacity>
        if(headData.quotedType==0){//打包报价
            return (
                <View style={[styles.CFItem]}>
                    <Text numberOfLines={2} style={[styles.wasteName]}>{rowData.wasteName}</Text>
                    <Text style={[styles.wasteCode]}>{rowData.wasteCode}</Text>
                    <Text numberOfLines={1} style={[styles.qty]}>{parseFloat(rowData.amount)}{rowData.unitValue}</Text>
                </View>
            );
        }else{//单独报价
            return (
                <View style={[styles.CFItem]}>
                    <Text numberOfLines={2} style={[styles.wasteName]}>{rowData.wasteName}</Text>
                    <Text style={[styles.wasteCode,{paddingBottom:0,borderBottomWidth:0}]}>{rowData.wasteCode}</Text>
                    <Text numberOfLines={1} style={[styles.qty]}>{parseFloat(rowData.amount)}{rowData.unitValue}</Text>
                    <View style={styles.priceView}><Text style={{fontSize:20,color:'#293e69'}}>×</Text><Text numberOfLines={1} style={[styles.price]}>{parseFloat(rowData.priceStr)}元</Text></View>
                    <Text numberOfLines={1} style={[styles.totalPrice]}>￥{(rowData.amount*rowData.priceStr).toFixed(2)}</Text>
                </View>
            );
        }
        
    }
}

const styles = StyleSheet.create({
    CFItem:{
        backgroundColor:'#f2f6ff',
        padding:10,
        width:110,
        marginLeft:10,
        borderWidth:1,
        borderColor:'#e6efff',
        borderRadius:4,
        marginTop:10,
        marginBottom:10
    },
    wasteName:{
        color:'#293e69',
    },
    wasteCode:{
        color:'#6c7d99',
        marginTop:5,
        marginBottom:5,
        paddingBottom:5,
        borderColor:'#e6efff',
        borderBottomWidth:1
    },
    qty:{
        color:'#1171d1'
    },
    priceView:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:5,
        marginBottom:5,
        paddingBottom:5,
        borderColor:'#e6efff',
        borderBottomWidth:1,
    },
    price:{
        color:'#293e69',
        // alignSelf:'flex-end'
        // textAlign:'right'
    },
    totalPrice:{
        color:'#ff464b'
    }
});
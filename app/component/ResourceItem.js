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
    StatusBar,
    View,
    Platform,
    Button,
    TextInput,
    Alert,
    TimerMixin,
    TouchableHighlight,
    TouchableOpacity,
    ToastAndroid,
    Dimensions,
    DeviceEventEmitter,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Header from './Header';
import NetUtil from '../util/NetUitl';
import Toast, { DURATION } from 'react-native-easy-toast';

export default class ResourceItem extends Component {
    constructor(props) {
        super(props);
    }
   

    render() {
        const {rowData,rowID}=this.props;
        return (
            <View style={styles.resourceItem}>
                {/*<View style={styles.splitView}></View>*/}
                <View style={styles.enterMessage}>
                    <View style={styles.enterName}>
                        <Image style={styles.enterlogo} resizeMode={Image.resizeMode.contain} source={require('../../images/orderlist/common_icon_resources.png')}/>
                        <Text style={styles.enterName_text}>{rowData.responseEntName}</Text>
                    </View>
                    <Text style={styles.enterTime}>{rowData.responseDate.substr(0,10)}</Text>
                </View>
                <View style={styles.wasteMessage}>
                    <View style={styles.wasteNameAndType}>
                        <Text numberOfLines={3} style={styles.wasteName}>{rowData.wasteName}</Text>
                        <Text numberOfLines={3} style={styles.wasteType}>{rowData.dispositionType}</Text>
                    </View>
                    <Text style={styles.wasteCode}>{rowData.wasteCode}</Text>
                </View>
                <View style={styles.priceAndQty}>
                    <View style={styles.price}>
                        <Text style={styles.price_title}>单价:</Text>
                        <View style={styles.priceAndTip}>
                            <Text style={styles.price_text}>￥{parseFloat(rowData.responsePrice).toFixed(3)}</Text>
                            <Text style={styles.price_tip}>{rowData.operatingPartyPayment==1?'经营方支付':'产废方支付'}</Text>
                        </View>
                    </View>
                    <View style={styles.qty}>
                         <Text style={styles.qty_title}>数量:</Text>
                         <Text style={styles.qty_text}>{parseFloat(rowData.responseQuantity).toFixed(3)+" "+rowData.unitName}</Text>
                    </View>
                </View>
                <View style={styles.totalPrice}>
                    <Text></Text>
                    <View style={styles.totalPrice_content}>
                        <Text style={styles.totalPrice_title}>总额：</Text>
                        <View style={styles.totalPriceAndTip}>
                            <Text style={styles.totalPrice_text}>￥{parseFloat(rowData.responseAmount).toFixed(3)}</Text>
                            <Text style={styles.totalPrice_tip}>{rowData.isCfr=="1"?'包含运费':'不含运费'}</Text>
                        </View>
                    </View>
                </View>
                 
            </View>
        );
    }
}

const styles = StyleSheet.create({
    resourceItem:{
        backgroundColor:'#fff',
        marginTop:13,
    },
    enterMessage:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop:8,
        paddingBottom:8,
        paddingLeft:15,
        paddingRight:15,
        borderColor:'#e6ebf5',
        // borderTopWidth:1,
        borderBottomWidth:1
    },
    enterName:{
        flexDirection: 'row',
        alignItems: 'center',
        flex:7,
    },
    enterName_text:{
        color:'#293f66',
        fontSize:14
    },
    enterlogo:{
        width:25,
        height:25,
        marginRight:5,
    },
    enterTime:{
        color:'#99a8bf',
        flex:4,
        textAlign:'right',
    },
    wasteMessage:{
        marginLeft:15,
        marginRight:15,
        borderColor:'#e6ebf5',
        // borderTopWidth:1,
        borderBottomWidth:1,
        paddingTop:6,
        paddingBottom:6
    },
    wasteNameAndType:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom:5
    },
    wasteName:{
        color:'#293f66',
        flex:4,
    },
    wasteType:{
        color:'#6b7c99',
        flex:7,
        textAlign:'right',
    },
    wasteCode:{
        color:'#6b7c99'
    },
    priceAndQty:{
        paddingLeft:15,
        paddingRight:15,
         flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop:10,
        paddingBottom:10,
         borderColor:'#e6ebf5',
        borderBottomWidth:1,
    },
    price:{
        flexDirection:'row',
         alignItems: 'center',
    },
    qty:{
         flexDirection:'row',
         alignItems: 'center',
    },
    totalPrice:{
        flexDirection:'row',
         alignItems: 'center',
         justifyContent: 'space-between',
         paddingRight:15,
         paddingTop:8,
         paddingBottom:8
    },
    totalPrice_content:{
         flexDirection:'row',
         alignItems: 'center',
    },
    price_title:{
        color:'#6b7c99',
        marginRight:8
    },
    price_text:{
        color:'#ff4060',
        marginBottom:5
    },
    price_tip:{
        color:'#99a8bf',
        marginLeft:2
    },
    qty_title:{
        color:'#6b7c99',
        marginRight:8
    },
    qty_text:{
        color:'#293f66'
    },
    totalPrice_title:{
        color:'#293f66'
    },
    totalPrice_text:{
        color:'#ff4060',
        marginBottom:5
    },
    totalPrice_tip:{
        color:'#99a8bf',
         marginLeft:2
    },
    splitView:{
        backgroundColor:'#f7f8fa',
        height:15,
        borderTopColor:'#dce4f2',
        borderBottomColor:'#e9edf7',
        borderTopWidth:0,
        borderBottomWidth:1
    }
});
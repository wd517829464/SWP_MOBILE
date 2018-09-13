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
    TouchableWithoutFeedback,
    DeviceEventEmitter,
    TextInput
} from 'react-native';


export default class InquiryCFItem extends Component {
    constructor(props) {
        super(props);
        this.state={
            total:false,
            inquiryType:false,
            price:0
        }
    }
    componentDidMount() {
        DeviceEventEmitter.addListener('changeInquiryType',(text)=>{
            this.setState({
                inquiryType:text
            })
        });
    }
    goInquiry(){
        this.props.rowData.total=!this.state.total;
        DeviceEventEmitter.emit('wasteSelect',this.props.rowData);
        this.setState({
            total:!this.state.total
        });
    }
    changePrice(text){
        text=text||0;
        this.props.rowData.price=text;
        this.props.rowData.totalPrice=this.props.rowData.wasteAmount*text;
        DeviceEventEmitter.emit('changeChooseItem',this.props.rowData);
        this.setState({
            price:text
        })
    }
    edit(){
        DeviceEventEmitter.emit('changeChooseItem',this.props.rowData);
    }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        const {rowData,rowID,sectionID,planitemReleaseId}=this.props;
        // <Image style={[styles.edit_icon]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/common_icon_price.png')}/>
        // <TextInput style={styles.price} underlineColorAndroid="transparent" placeholder="请填写单价" value={this.state.price} numberOfLines={1} onChangeText={(text)=>{this.changePrice(text)}}/>
        if(this.state.inquiryType){
            return (
                <View style={styles.row}>
                    <View style={[styles.CFItem]}>
                        <Text numberOfLines={1} style={styles.wasteName}>{rowData.wasteName}</Text>
                        <View style={[styles.cfItem2,{marginTop:8}]}>
                            <Text style={styles.wasteCode}>{rowData.wasteCode}</Text>
                            <View style={styles.cfItem3}><Text style={styles.wasteCode}>数量：</Text><Text style={styles.wasteName}>{rowData.wasteAmount}{rowData.unitValue}</Text></View>
                        </View>
                    </View>
                </View>
            );
        }else{
            return (
                <View style={styles.row}>
                    <View style={[styles.CFItem]}>
                        <View style={[styles.cfItem2,{width:widths-24}]}>
                            <View style={{flex:1}}>
                                <Text numberOfLines={1} style={[styles.wasteName,{marginBottom:8}]}>{rowData.wasteName}</Text>
                                <Text style={styles.wasteCode}>{rowData.wasteCode}</Text>
                            </View>
                            <View style={styles.cfItem5}>
                                <Text style={styles.wasteCode}>单价：</Text>
                                <TouchableOpacity onPress={this.edit.bind(this)} style={{flexDirection:'row'}}>
                                    <Text style={[styles.wasteCodeText,{textDecorationLine:'none'}]}>￥</Text>
                                    <Text style={[styles.wasteCodeText,{fontSize:18,lineHeight:18}]}>{rowData.price==0?'0.00':rowData.price}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.cfItem2,{marginTop:8}]}>
                            <View style={styles.cfItem3}><Text style={styles.wasteCode}>数量：</Text><Text style={styles.wasteName}>{rowData.wasteAmount}{rowData.unitValue}</Text></View>
                            <View style={styles.cfItem3}><Text style={styles.wasteCode}>小计：</Text><Text style={[styles.wasteName,{color:'#ff405f',fontWeight:'bold'}]}>￥{rowData.totalPrice.toFixed(2)}</Text></View>
                        </View>
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    row:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
        padding:12,
        borderTopWidth:1,
        borderColor:'#dce3f3',
    },
    circle:{
        width:20,
        height:20,
        // borderWidth:1,
        // borderColor:'#dce3f3',
        // borderRadius:10,
        marginRight:12
    },
    CFItem:{
        flex:1,
        flexDirection: 'column',
    },
    cfItem2:{
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cfItem3:{
        flexDirection: 'row',
        alignItems:'center'
    },
    cfItem5:{
        flexDirection: 'row',
        alignItems:'center',
    },
    wasteName:{
        color:'#293e69',
    },
    wasteCode:{
        color:'#6c7d99',
    },
    wasteCodeText:{
        color:'#ff405f',
        textDecorationLine:'underline',
        fontSize:16,
        fontWeight:'bold'
    },
    edit_icon:{
        width:25,
        height:25,
        marginLeft:10
    },
    grey:{
        backgroundColor:'#f7f8fa',
    },
    greyText:{
        color:'#bcc4d9'
    },
    price:{
        flex:1,
        paddingTop:4,
        paddingBottom:4,
        paddingLeft:10,
        paddingRight:10,
        borderWidth:1,
        borderColor:'#cad5e6',
        borderRadius:3,
        marginTop:10,
        marginBottom:10,
    }
});
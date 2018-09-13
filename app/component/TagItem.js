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
var TAGSTATUS={'TAGGING':'自由标记','SAMPLING':'取样中','DELIVERED_LAB':'已送实验室','QUALIFIED':'合格','UNQUALIFIED':'不合格','DRAFTCONTRACT':'合同已拟定','SIGNCONTRACT':'合同已签定','DELIVERYCONTRACT':'合同已寄出'};
// import CFBuyScreen from '../CFBuyScreen';
export default class TagItem extends Component {
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
        const {rowData,rowID,sectionID}=this.props;
        // <TouchableOpacity onPress={this.goInquiry.bind(this)}></TouchableOpacity>
        let content=null;
        switch(rowData.tagType){
            case 'TAGING':
                content=<Text style={styles.text}>{rowData.comments}</Text>;
                break;
            case 'SAMPLING':
                content=<View>
                        <Text style={styles.text}>取样时间：{rowData.sampleDate?rowData.sampleDate.substring(0,10):''}</Text>
                        <Text style={styles.text}>联系人：{rowData.contacts}</Text>
                        <Text style={styles.text}>联系电话：{rowData.contactsTel}</Text>
                    </View>
                break;
            case 'SAMPLE':
                content=<Text style={styles.text}>{rowData.comments}</Text>;
                break;
            case 'CONTRACT':
                content=<Text style={styles.text}>{TAGSTATUS[rowData.busiStatus]}</Text>;
                break;
        }
        return (
            <View style={styles.item}>
                <Image style={{width:20,height:20,marginRight:10,marginTop:2}} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/sign.png')} />
                <View style={{flexDirection:'column'}}>
                    {content}
                    <View style={{flexDirection:'row',marginTop:10}}>
                        <Text style={{color:'#99a8bd',marginRight:25}}>{rowData.createTime.substring(0,16)}</Text>
                        <Text style={{color:'#99a8bd'}}>{rowData.createBy}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    item:{
        flexDirection:'row',paddingTop:20,paddingBottom:20,paddingLeft:15,paddingRight:15,borderColor:'#e9edf6',borderBottomWidth:0.5,
        backgroundColor:'#fff'
    },
    text:{
        color:'#2b3e66',marginBottom:5,fontSize:14
    },
    CFItem:{
        backgroundColor:'#f2f6ff',
        padding:10,
        width:100,
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
        marginTop:10,
        marginBottom:10,
        paddingBottom:10,
        borderColor:'#e6efff',
        borderBottomWidth:1
    },
    qty:{
        color:'#1171d1'
    },
    grey:{
        backgroundColor:'#f7f8fa',
    },
    greyText:{
        color:'#bcc4d9'
    },
});
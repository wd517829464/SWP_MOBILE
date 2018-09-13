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
    Platform,
    TouchableOpacity,
    Navigator,
    ProgressViewIOS,
    ProgressBarAndroid
} from 'react-native';

import LicenseDatailScreen from '../LicenseDatailScreen';
export default class MyCZItem extends Component {
    constructor(props) {
        super(props);
    }
    goDetail(){
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'LicenseDatailScreen',
                component:LicenseDatailScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    licenceId:this.props.rowData.licenceId,
                    itemId:this.props.rowData.itemId,
                    rowData:this.props.rowData,
                    sysEnterpriseBaseVo:this.props.sysEnterpriseBaseVo,
                    licenceVo:this.props.licenceVo
                }
            })
        }
    }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        const {rowData,rowID}=this.props;
        // <ProgressViewIOS style={styles.progressView} trackTintColor='#16d2d9' progressTintColor='#e8ebf2' progress={1-rowData.surplus_percentage/100}/>
        return (
            <TouchableOpacity onPress={this.goDetail.bind(this)}>
            <View style={styles.item}>
               <View style={styles.item2}><Text style={styles.item2_text}>{rowData.dispositionType}</Text><Text style={styles.item2_text_arrow}>&gt;</Text></View>
               <View style={styles.item3}> 
                 <View style={styles.item3_item}>
                    <Text style={styles.item3_title}>年许可总量：</Text>
                    <Text style={styles.item3_left_weight}>{rowData.approved_quantity}吨</Text>
                 </View>
                 <View style={styles.item3_item}>
                    <Text style={styles.item3_title}>年剩余量：</Text>
                    <Text style={styles.item3_right_weight}>{rowData.surplus_quantity}吨</Text>
                 </View>
               </View>
               <View style={styles.item4}>
               {
                   Platform.OS === 'ios'?
                   <ProgressViewIOS style={styles.progressView} trackTintColor='#16d2d9' progressTintColor='#e8ebf2' progress={1-rowData.surplus_percentage/100}/>:
                   <ProgressBarAndroid color="#16d2d9" styleAttr='Horizontal' progress={1-rowData.surplus_percentage/100} indeterminate={false} style={{marginTop:10}}/>
               }
                    <View style={styles.item4_message}>
                        <Text style={styles.item4_text}>使用</Text>
                        <Image style={styles.item_paper} resizeMode={Image.resizeMode.contain} source={require('../../images/mine/profile_bg_paper.png')}>
                         <Text style={styles.item_paper_text}>{rowData.surplus_percentage}%</Text>                            
                        </Image>
                        <Text style={[styles.item4_text,{color:'#16d2d9'}]}>剩余</Text>
                    </View>
               </View>
            </View>
            </TouchableOpacity>
        );
    }
     
}

const styles = StyleSheet.create({
    item:{
        borderRadius:6,
        backgroundColor:'#fff',
        // height:200,
        paddingBottom:10,
        marginTop:10,
        marginLeft:20,
        marginRight:20,
        borderColor:'#e6ebf5',
        borderWidth:1
        // padding:20
    },
    item2:{
        backgroundColor:'#f0f3fa',
        paddingTop:10,
        paddingBottom:10,
        borderRadius:4,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
    },
    item2_text:{
        color:'#2b3f64',
        fontWeight:'bold',
        textAlign:'center',
        fontSize:14,
        alignSelf:'center',
    },
    item2_text_arrow:{
        position:'absolute',
        right:20,
        color:'#c1ccde',
        fontSize:20,
        top:4,
        // fontWeight:'bold'
        // alignSelf:'flex-end'
    },
    item3:{
        flexDirection: 'row',
        alignItems: 'center',
         paddingTop:10,
        paddingBottom:10,
    },
    item3_item:{
        flex:1,
        paddingLeft:20
    },
    item3_title:{
        color:'#99a8bf',
        marginBottom:8
    },
    item3_left_weight:{
        color:'#293f66',
        fontWeight:'bold',
    },
    item3_right_weight:{
        color:'#16d2d9',
        fontWeight:'bold',
    },
    item4:{
        paddingLeft:10,
        paddingRight:10
    },
    item4_message:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressView:{
        paddingTop:10,
    },
    item4_text:{
        color:'#99a8bf'
    },
    item_paper:{
        width:46,
        height:18.5,
        paddingTop:3,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    item_paper_text:{
        color:'#fff',
        fontSize:12,
        backgroundColor:'transparent'
    }
    
});
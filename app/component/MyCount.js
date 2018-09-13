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
    Navigator
} from 'react-native';

import UserOrderList from '../../UserOrderList';
import MyResourceScreen from '../MyResourceScreen';

export default class MyCount extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        const {myrelease,followEnterprisesCount,boughtOrderCount,soldOrderCount}=this.props;
        //  <View style={[styles.item,styles.middleItem]}>
        //             <TouchableOpacity onPress={()=>Alert.alert('功能开发中')}>
        //                 <View>
        //                     <Text style={styles.item_count}>{followEnterprisesCount}</Text>
        //                      <Text style={styles.item_name}>我的关注</Text>
        //                  </View>
        //             </TouchableOpacity>
        //         </View>
        return (
            <View style={styles.myCount}>
                <View style={[styles.item,{borderRightWidth:1,borderColor:'#e6ebf5'}]}>
                    <TouchableOpacity onPress={this.goResource.bind(this)}>
                        <View>
                             <Text style={styles.item_count}>{myrelease}</Text>
                            <Text style={styles.item_name}>我的发布</Text>
                         </View>
                    </TouchableOpacity>
                </View>
                <View style={[styles.item,{borderRightWidth:1,borderColor:'#e6ebf5'}]}>
                    <TouchableOpacity onPress={() => this.goOrder(0)}>
                        <View>
                            <Text style={styles.item_count}>{boughtOrderCount}</Text>
                              <Text style={styles.item_name}>我购买的订单</Text>
                         </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.item}>
                    <TouchableOpacity onPress={() => this.goOrder(1)}>
                        <View>
                            <Text style={styles.item_count}>{soldOrderCount}</Text>
                              <Text style={styles.item_name}>我卖出的订单</Text>
                         </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    goResource(){
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'MyResourceScreen',
                component:MyResourceScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId
                }
            })
        }
    }
    goOrder(idx){
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'UserOrderList',
                component:UserOrderList,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    pagerIdx:idx,
                }
            })
        }
    }
     
}

const styles = StyleSheet.create({
    myCount:{
         flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'#fff',
        paddingLeft:20,
        paddingRight:20,
        paddingTop:12,
        paddingBottom:12,
        borderBottomWidth:1,
        borderColor:'#e6ebf5'
    },
    item:{
        flex:1,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop:5,
        paddingBottom:5
    },
    middleItem:{
        borderLeftWidth:1,
        borderRightWidth:1,
        borderColor:'#e6ebf5'
    },
    item_count:{
        textAlign:'center',
        marginBottom:8,
        color:'#2676ff',
        fontWeight:'bold',
        fontSize:16
    },
    item_name:{
        textAlign:'center',
        color:'#99a8bf'
    }
});
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
    RefreshControl
} from 'react-native';

export default class CodeItem extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={
            dataSource:ds.cloneWithRows(['123','234','2345']),
            isLoading:false
        }
    }
    render(){
        const {rowData,rowID}=this.props;
        // Alert.alert('rowData',JSON.stringify(rowData));
        let str='';
        let wastestr=rowData.listWasteVo[0];
        var arr=wastestr.split(';');
        for(var i=0;i<arr.length;i++){
            str+=arr[i].split(':')[0]+', ';
        }
        str=str.substring(0,str.length-2);
        // var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        // var dataSource=ds.cloneWithRows(arr);
        return (
            <View style={styles.codeItem}>
                <View style={styles.code_title}>
                    <Text style={styles.code_title_text}>{rowData.wasteTypeCode+'-'+rowData.wasteTypeValue}</Text>
                    <Text style={styles.code_title_arrow}>&gt;</Text>
                </View>
                <View style={styles.code_content}>
                      <Text style={styles.blueColor}>{str}</Text>
                </View>
            </View>
        )
    }

}
const styles = StyleSheet.create({
    codeItem:{
        backgroundColor:'#fff',
        marginTop:15,
        borderBottomColor:'#dce4f2',
        borderTopColor:'#dce4f2',
        borderBottomWidth:1,
        borderTopWidth:1,
    },
    code_title:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        height:35,
        borderBottomColor:'#dce4f2',
        borderBottomWidth:1,
        paddingLeft:15,
        paddingRight:15,
    },
    code_title_text:{
        color:'#284173',
    },
    code_title_arrow:{
        color:'#c1cde4',
        fontSize:20
    },
    code_content:{
        flexDirection:'row',
        alignItems:'center',
        // justifyContent:'center',
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:15,
        paddingRight:1,
        flexWrap:'wrap',
        // backgroundColor:'#ff0'
    },
    blueColor:{
        color:'#2676ff',
        lineHeight:20
    },
    grayColor:{
        color:'#99a8bf',
        lineHeight:20
    }
});
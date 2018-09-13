/**
 * Created by zl on 17/07/12.
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
    Alert,
    TouchableHighlight
} from 'react-native';

var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var dialogHeight=180;
export default class LeaveMessage extends Component {
    constructor(props) {
        super(props);
        this.state={
            show:this.props.show
        }
    }
    componentDidMount(){
      
    }
    render() {
        let top=(heights-dialogHeight)/2;
        let type=this.props.type||'success';
        let content=this.props.content;
        top=this.props.top?this.props.top:top;
        return (
        <View style={styles.Dialog} width={widths/1.5} height={dialogHeight} top={top}>
            <View style={styles.iconView} width={widths/1.5}>
                <Text style={{height:20,color:'black', margin:12,fontWeight:'bold',}}>对方不在线，请留言 :</Text>
            </View>
            <View style={{width:100,height:1,backgroundColor:'black',}} width={widths/1.5}>
               
            </View>
            <View style={[styles.textView,]} height={dialogHeight - 48 - 32}>
                <TextInput 
                 underlineColorAndroid={"transparent"} numberOfLines={4} multiline={true} style={styles.dialogText}  width={widths/1.5-24} >{this.props.tip}</TextInput>
               
            </View>
             <View style={{width:100,height:1,backgroundColor:'black',}} width={widths/1.5}></View>
            <View style={{flexDirection:'row',height:28,}}>
                
                    <TouchableHighlight activeOpacity={0.6} style={{flex:1,height:28,}} width={widths/3} underlayColor={'transparent'}>
                    <Text style={{textAlign:'center',lineHeight:22,}}>取消</Text></TouchableHighlight>

                    <Text style={{width:1,backgroundColor:'black',height:28,}}></Text>
                
                    <TouchableHighlight activeOpacity={0.6} style={{flex:1,height:28,}} width={widths/3} underlayColor={'transparent'}>
                    <Text style={{textAlign:'center',paddingRight:12,color:'#2676ff',lineHeight:22,}}>提交留言</Text></TouchableHighlight>
                
            </View>
         </View>  
            
        )
    }
    
}

const styles = StyleSheet.create({
   Dialog:{
       position: 'absolute',
       backgroundColor:'white',
       zIndex:1,
       flexDirection:'column',
       flex:1,
       alignSelf:'center',
       borderRadius: 10, 
       borderWidth:1,
   },
   iconView:{
       justifyContent:'center',
      
   },
   icon:{
       width:25,
       height:25,
       alignSelf:'center',
       marginTop:8
   },
   textView:{
        flex:1,
        flexDirection:'column',
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,

   },
   dialogText:{
        marginLeft:12,
        marginRight:12,
        textAlignVertical: 'top',
        color:'brown',
      
        
   }
});
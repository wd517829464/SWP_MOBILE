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
    Alert,
    TouchableHighlight
} from 'react-native';

var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var dialogHeight=120;
export default class Dialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            show:this.props.show
        }
    }
    componentDidMount(){
        if(this.props.show){
            this.interval=setInterval(()=>{
                if(this.state.seconds<=0){
                    clearInterval(this.interval);
                    return;
                }
                this.setState({show:false});
            },3000);
        }
    }
    render() {
        let top=(heights-dialogHeight)/2;
        let type=this.props.type||'success';
        let content=this.props.title;
        return (
        <View style={styles.Dialog} width={widths/1.5} height={dialogHeight} top={top}>
            <View style={styles.iconView} width={widths/1.5}>
                <Image style={[styles.icon]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/tooltips_icon_success.png')} /> 
            </View>
            <View style={styles.textView}>
                <Text style={styles.dialogText}>{this.props.title},{'\n'}{this.props.tip}</Text>
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
       borderRadius: 10, 
   },
   iconView:{
       justifyContent:'center',
       flex:1.4,
   },
   icon:{
       width:25,
       height:25,
       alignSelf:'center',
       marginTop:8
   },
   textView:{
        flex:2
   },
   dialogText:{
        alignSelf:'center',
        flex:1,
        color:'#fff',
        textAlign:'center',
        lineHeight:25
   }
});
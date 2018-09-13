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
var top=(Platform.OS === "ios")?110:90;

export default class OrderScreen extends Component {
    constructor(props) {
        super(props);
        // console.log("sysInfo-this.props.tabIndex = "+this.props.tabIndex);
        this.state={
            tabIndex:0
        }
        this.tabIndex = this.props.tabIndex?this.props.tabIndex:0;
    }
    componentDidMount(){
        var st = this;
        DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
            st.tabIndex = 0;
            // console.log("sysInfo-inChangeHomeTab-this.tabIndex = "+st.tabIndex);
            st.setState({tabIndex:1-st.state.tabIndex});
        });
    }
    changeOrderIndex(tabIndex){
        var st = this;
        this.tabIndex = tabIndex;
        this.setState({tabIndex:1-st.state.tabIndex});
        console.log("sysInfo-this.tabIndex = "+this.tabIndex);

        DeviceEventEmitter.emit('orderSelect',tabIndex);
        DeviceEventEmitter.emit('closeDialog','');
    }
    render() {
        // console.log("sysInfo-inRender-this.tabIndex = "+this.tabIndex);
        return (
        <View style={styles.Dialog} width={widths} height={heights-top} top={top} >
            <TouchableOpacity activeOpacity={1} onPress={_=>{DeviceEventEmitter.emit('orderSelect',this.tabIndex);}} width={widths} height={heights-top} style = {{flex:1,}}>
            <View style={styles.btn}>
                <View style={[styles.cancle_btn,{backgroundColor:this.tabIndex==0?'#fff':'#f0f3fa',borderColor:this.tabIndex==0?'#2676ff':'#f0f3fa'}]}>
                    <TouchableOpacity style={styles.btn_click} onPress={this.changeOrderIndex.bind(this,0)}>
                    <Text style={[styles.cancle_btn_text,{color:this.tabIndex==0?'#2676ff':'#6b7c99'}]}>按时间最新</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.cancle_btn,{backgroundColor:this.tabIndex==1?'#fff':'#f0f3fa',borderColor:this.tabIndex==1?'#2676ff':'#f0f3fa'}]}>
                 <TouchableOpacity style={styles.btn_click} onPress={this.changeOrderIndex.bind(this,1)}>
                    <Text style={[styles.cancle_btn_text,{color:this.tabIndex==1?'#2676ff':'#6b7c99'}]}>按距离最近</Text>
                 </TouchableOpacity>
                </View>
            </View>
             </TouchableOpacity>
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
    btn:{
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#fff',
    },
    btn_click:{
        flex:1,
        height:30,
        flexDirection:'column',
        justifyContent:'center'
    },
    cancle_btn:{
        flex:1,
        backgroundColor:'#e6ebf5',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        height:30,
        margin:10,
        borderWidth:1,
        borderRadius:5
    },
    cancle_btn_text:{
        color:'#8c9dbf',
        alignSelf:'center',
        fontSize:13
    }
});
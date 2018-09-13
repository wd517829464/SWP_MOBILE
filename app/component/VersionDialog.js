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
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import Constants from '../util/Constants';
import {NativeModules} from 'react-native';
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
var heights = Dimensions.get('window').height;
var dialogHeight=120;
export default class VersionDialog extends Component {
    constructor(props) {
        super(props);
        this.state={
            // show:this.props.show
        }
    }
    getContentArr(description){
        var arr=description.split('%');
        let elementArr=[];
        for(var i=0;i<arr.length;i++){
            elementArr.push(<Text style={styles.contentText} key={i}>- -   {arr[i]}</Text>);
        }
        return elementArr;
    }
    render() {
        let top=(heights-dialogHeight)/2;
        let type=this.props.type||'success';
        let content=this.props.title;
        var {version}=this.props;
        let contentArr=this.getContentArr(version.description);
        return (
        <View style={styles.Dialog} width={widths} height={heights}>
            <View>
                <View style={styles.whiteBg}></View>
                <Image style={styles.iconView}  source={require('../../images/base/version_header.png')}>
                    <Text style={{color:'#263f67',fontSize:20,fontWeight:'bold',marginBottom:5,marginTop:30}}>发现新版本</Text>
                    <Text style={{color:'#263f67',fontSize:13}}>版本：{version.versionCode}</Text>
                    <View style={styles.contentView}>
                        <Text style={styles.title}>更新内容</Text>
                        <View>{contentArr}</View>
                    </View>
                    <View style={{backgroundColor:'#fff',width:widths-40,borderBottomLeftRadius:5,borderBottomRightRadius:5,overflow:'visible'}}>
                        <View style={styles.btnView}>
                            <TouchableOpacity style={styles.btnClick} onPress={this.cancel.bind(this)}><Text style={[styles.btnText,{color:'#9ba7bd'}]}>下次再说</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btnClick,{backgroundColor:'#2676ff'}]}  onPress={this.confirm.bind(this)}><Text style={[styles.btnText,{color:'#fff'}]}>立即更新！</Text></TouchableOpacity>
                        </View>
                    </View>
                </Image>
            </View>
            
            
         </View>  
            
        )
    }
    cancel(){
        var {version}=this.props;
        var versionCodeConfirm=version.versionCodeConfirm;
            versionCodeConfirm.push(version.versionCode);
            storage.save({
              key: 'versionCodeConfirm',  // 注意:请不要在key中使用_下划线符号!
              rawData: versionCodeConfirm
            });
            DeviceEventEmitter.emit('closeVersionDialog',true);
      }
      confirm(){
        var {version}=this.props;
        var downloadUrl=Constants.IMG_SERVICE_DEMAIN+'/service/sys/file/upload/download?fileID='+version.fileId;
        DeviceEventEmitter.emit('closeVersionDialog',true);
        // Alert.alert('已确认,开始更新APK...',downloadUrl);
        NativeModules.DownloadApk.downloading(downloadUrl,"yifeiwang.apk");
      }
    
}

const styles = StyleSheet.create({
    whiteBg:{
        position:'absolute',
        backgroundColor:'#fff',
        height:(widths-40)*441*0.7/591,
        width:widths-40,
        // marginLeft:(202-widths)/2,
        // top:(widths-40)*441*0.01/591,
        borderTopLeftRadius:5,
        borderTopRightRadius:5,
        marginTop:60
    },
   Dialog:{
       position: 'absolute',
       backgroundColor:'rgba(0,0,0,.4)',
       zIndex:1,
       flexDirection:'column',
       alignItems:'center',
       flex:1,
       alignSelf:'center',
       borderRadius: 10, 
       paddingTop:100
   },
   iconView:{
       width:widths-40,
        flexDirection:'column',
        alignItems:'center',
    //    backgroundColor:'#fff',
       height:(widths-40)*441/591,
    //    borderColor:'#ff0',
    //    borderBottomWidth:1,
       paddingTop:(widths-40)*441*0.42/591,
       paddingBottom:50,
    //    borderRadius:5,
    overflow:'visible',
   },
   contentView:{
        width:widths-40,
        backgroundColor:'#fff',
        alignSelf:'center',
        paddingBottom:10,
        paddingTop:10,
        paddingLeft:20,
        paddingRight:20
   },
   title:{
       color:'#2a3d65',
       fontSize:16,
       marginBottom:8
   },
   contentText:{
       color:'#293f66',
       fontSize:14,
       marginBottom:5
   },
   btnView:{
    flexDirection:'row',
    height:50,
    backgroundColor:'#e7ebf6',
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
   },
   btnClick:{
       flex:1,
       flexDirection:'column',
       alignItems:'center',
       justifyContent:'center',
   },
   btnText:{
       fontSize:16
   }
});
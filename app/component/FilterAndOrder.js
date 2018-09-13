import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
   Alert,
   DeviceEventEmitter
} from 'react-native';
import weightList from '../util/WeightList';
import ChinaCity from '../util/ChinaCity';
export default class FilterAndOrder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex:-1,
            areaName:this.props.areaCode?ChinaCity.provinces[this.props.areaCode]:'所在地区',
            weight:-1,
            wasteCode:''
        };
    }
    componentWillMount() {
        storage.load({
            key: 'loginState',
          }).then(ret => {
              this.areaCode=ret.cantonCode.length>2?(ret.cantonCode.substring(0,2)+'0000'):'';
              this.setState({
                  areaName:this.areaCode?ChinaCity.provinces[this.areaCode]:'所在地区'
              })
          }).catch(err => {
              // alert('当前登录用户凭证已超时，请重新登录。');
          })
    }
    componentDidMount() {
        this.closeListener=DeviceEventEmitter.addListener('closeDialog',(text)=>{
            this.setState({tabIndex:-1});
        });
        this.areaNameListener=DeviceEventEmitter.addListener('areaName',(text)=>{
            this.setState({areaName:text});
        });
        this.areaListener=DeviceEventEmitter.addListener('areaSelect',(text)=>{
            if(text=='close'){
                if(this.state.tabIndex==0){
                    this.setState({tabIndex:-1});
                }
            }
        });
        this.weightListener= DeviceEventEmitter.addListener('weightSelect',(text)=>{
            if(text!='open'&&text!='close'){
                if(text>-1){
                    this.weightIndex=text;
                    this.setState({weight:weightList[text]['name'],tabIndex:-1});
                }else{
                    this.setState({weight:'不限',tabIndex:-1});
                }
            }else if(text=='close'){
                if(this.state.tabIndex==1){
                    this.setState({tabIndex:-1});
                }
            }else if(text=='open'){
                this.setState({tabIndex:1});
            }
          });
          this.removeListener=DeviceEventEmitter.addListener('removeSelect',(text)=>{
            if(text!='open'&&text!='close'){
                var str='';
                for(var key in text){
                    str+=key+',';
                }
                str=str?str.substring(0,str.length-1):'';
                if(str.length>9){
                    str=str.substring(0,9)+'...';
                }
                this.setState({
                    wasteCode:str
                })
            }else if(text=='close'){
                if(this.state.tabIndex==2){
                    this.setState({tabIndex:-1});
                }
            }else if(text=='open'){
                this.setState({tabIndex:2});
            }
          });
          this.tabChangeListener=DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
            if(text=='home'){
                this.setState({weight:-1,tabIndex:-1,areaName:'所在地区',});
            }
        });
    }
    componentWillUnmount(){
        this.closeListener.remove();
        this.areaNameListener.remove();
        this.areaListener.remove();
        this.weightListener.remove();
        this.removeListener.remove();
        this.tabChangeListener.remove();
    }
    changeTab(tabIndex){
        if(tabIndex==this.state.tabIndex){
            this.setState({tabIndex:-1});
            DeviceEventEmitter.emit('areaSelect','close');
            DeviceEventEmitter.emit('weightSelect','close');
            DeviceEventEmitter.emit('removeSelect','close');
        }else{
            this.setState({tabIndex:tabIndex});
            if(tabIndex==0){
                DeviceEventEmitter.emit('areaSelect','open');
                DeviceEventEmitter.emit('weightSelect','close');
                DeviceEventEmitter.emit('removeSelect','close');
            }else if(tabIndex==1){
                DeviceEventEmitter.emit('areaSelect','close');
                DeviceEventEmitter.emit('weightSelect','open');
                DeviceEventEmitter.emit('removeSelect','close');
            }else{
                DeviceEventEmitter.emit('areaSelect','close');
                DeviceEventEmitter.emit('weightSelect','close');
                DeviceEventEmitter.emit('removeSelect','open');
            }
        }
    }
    getNameByCode(areaCode){
        if(areaCode.substring(2,6)=='0000'){//省
            return ChinaCity.provinces[areaCode];
        }else if(areaCode.substring(4,6)=='00'){//市
            var provinceCode=areaCode.substring(0,2)+'0000';
            return ChinaCity.provinces[provinceCode]+'/'+ChinaCity[provinceCode][areaCode]
        }else{//区
            var provinceCode=areaCode.substring(0,2)+'0000';
            var cityCode=areaCode.substring(0,4)+'00';
            return ChinaCity.provinces[provinceCode]+'/'+ChinaCity[provinceCode][cityCode]+ChinaCity[cityCode][areaCode]
        }
    }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        var heights = Dimensions.get('window').height;
        var areaName=this.props.areaCode?this.getNameByCode(this.props.areaCode):(this.state.areaName=='省份/直辖市'?'所在地区':this.state.areaName);
        var weightText=this.props.weight&&this.props.weight>-1?weightList[this.props.weight]['name']:(this.state.weight==-1?'处置量':this.state.weight);
        return(
            <View style={{}}>
                <View style={styles.tabSelect}>
                    <View style={[styles.tab]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==2?2:0}]} onPress={this.changeTab.bind(this,2)}>
                            <Text style={[styles.tab_text,{color:this.state.tabIndex==2?'#2676ff':'#6b7c99'}]}>{this.state.wasteCode||'危废代码'}</Text>
                            {this.state.tabIndex==2?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.tab]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==0?2:0}]} onPress={this.changeTab.bind(this,0)}>
                            <Text style={[styles.tab_text,{color:this.state.tabIndex==0?'#2676ff':'#6b7c99'}]}>{areaName}</Text>
                            {this.state.tabIndex==0?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.tab]}>
                        <TouchableOpacity style={[styles.touchableArea,{borderBottomWidth:this.state.tabIndex==1?2:0}]} onPress={this.changeTab.bind(this,1)}>
                            <Text style={[styles.tab_text,{color:this.state.tabIndex==1?'#2676ff':'#6b7c99'}]}>{weightText}</Text>
                            {this.state.tabIndex==1?
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowBlue.png')}/>:
                                <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/common_icon_DownArrowGrey.png')}/>}
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    dropdown_icon_arow:{
        width:10,
        height:10
    },
    tabSelect:{
        flexDirection: 'row',
        alignItems:'center',
        borderColor:'#e6ebf5',
        borderBottomWidth:1
    },
    touchableArea:{
        flex:1,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'center',
        height:40,
        borderColor:'#2676ff',
        paddingLeft:5,
        paddingRight:5,
        backgroundColor:'#fff'
    },
    tab:{
        flex:1,
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'center',
        height:46
    },
    tab_text:{
        color:'#6b7c99',
        fontWeight:'bold',
        marginRight:4,
        fontSize:14.5
    },
});
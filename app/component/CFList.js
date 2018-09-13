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
    ScrollView,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import NetUtil from '../util/NetUitl';
import CFBuyScreen from '../CFBuyScreen'
import CFItem from './CFItem'
import EnterDetailScreen from '../EnterDetailScreen';
import Constants from '../util/Constants';
import CFSelectScreen from '../CFSelectScreen';
var Dimensions = require('Dimensions');
export default class CFList extends Component {
    constructor(props) {
    super(props);
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
        dataSource: ds.cloneWithRows(['row 1', 'row 2', 'row 3']),
        favorited:this.props.rowData.favorited,
        entType:''
    };
}
    componentWillMount(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.setState({
                entType:ret.entType
            })
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    componentDidMount() {
        DeviceEventEmitter.addListener('favorite',(text)=>{
          if(text==this.props.rowID){
            this.setState({favorited:!this.state.favorited});
          }
        });
    }
    goInquiry(){
        var rowData=this.props.rowData;
        if(rowData.entBindStatus=='1'){
            if(this.state.entType=='DIS_FACILITATOR'){
                rowData['index']=this.props.rowID;
                DeviceEventEmitter.emit('checkHasCompany',rowData);
                return;
            }
            const { navigator} = this.props;
            if (navigator) {
                navigator.push({
                    name:'CFSelectScreen',
                    component:CFSelectScreen,
                    params:{
                        navigator:navigator,
                        ticketId:this.props.ticketId,
                        headData:rowData,
                        index:this.props.rowID
                    }
                })
            }
        }else{
            rowData['index']=this.props.rowID;
            this.props.callbackParent(rowData);
        }
    }
    favorite(){
        var {rowData,rowID}=this.props;
        rowData['index']=rowID;
        rowData['action']='favorite';
        this.props.callbackParent(rowData);
    }
    contact(){
        var {rowData,rowID}=this.props;
        rowData['index']=rowID;
        rowData['action']='contact';
        this.props.callbackParent(rowData);
    }
    render() {
        var widths = Dimensions.get('window').width;
        const {rowData}=this.props;
         var itemReleaseList=this.props.rowData.releaseWasteDetails;
         let cfList=(<View></View>);
         if(itemReleaseList&&itemReleaseList.length>0){
            var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
            if(itemReleaseList[0]!==1){
                itemReleaseList.unshift(1);
            }
            var dataSource=ds.cloneWithRows(itemReleaseList);
            cfList=( <ScrollView>
                <ListView
                    horizontal={true} 
                    dataSource={dataSource}
                    renderRow={(rowData,sectionID,rowID) => 
                         <CFItem navigator={this.props.navigator} callbackParent={(text)=>{this.goInquiry()}} entType={this.state.entType} rowData={rowData} rowID={rowID} sectionID={sectionID}
                          ticketId={this.props.ticketId} headData={this.props.rowData}/>
                         }
                    /></ScrollView>);
         }
        return (
                <View style={[styles.listBox,{paddingTop:0,paddingBottom:0}]} key={this.props.sectionID}>
                    <View style={[styles.cellBox]}>
                        <TouchableOpacity style={{flex:1}} onPress={this.goInquiry.bind(this)}>
                            <View style={{paddingTop:10,paddingBottom:6,marginLeft:15,marginRight:15}}>
                                <View style={styles.cellBox_first} borderBottomWidth={rowData.itemReleaseList&&rowData.itemReleaseList.length>0?0.5:0}>
                                    <Text style={[styles.cellText_Ent]}>{rowData.entName||'--'}</Text> 
                                    <Text style={[styles.cellText_time]}>{rowData.releaseDate.substr(0,10)||'--'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={{flexDirection:'row'}}>
                            {cfList}
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:10,paddingBottom:10,paddingLeft:14,paddingRight:14}}>
                           {rowData['entAddress']?
                        <TouchableOpacity onPress={this.goInquiry.bind(this)} style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <Image style={[styles.cellText_icon]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/address.png')} />
                            <Text style={{color:'#9ba4ba',fontSize:15,width:widths*0.6}}>{rowData['entAddress']}</Text>
                           </TouchableOpacity>:<View></View>}
                           <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                             <TouchableOpacity onPress={this.contact.bind(this)}>
                               <Image style={[styles.btn,{marginLeft:0}]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/contact.png')} />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={this.goInquiry.bind(this)}>
                             {rowData.inquiryStatus==1?
                                <Image style={[styles.btn]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/carted.png')} />
                                :<Image style={[styles.btn]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/cart.png')} />
                            }
                            </TouchableOpacity>
                           </View>
                        </View>
                    </View>
                    <View style={styles.splitLine} width={widths}></View>
                </View>
            
        );
    }
  onPressEnter(enterId){
      const { navigator} = this.props;
      if (navigator) {
            navigator.push({
                name:'EnterDetailScreen',
                component:EnterDetailScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    wasteEntId:enterId
                }
            })
        }
  }
}

const styles = StyleSheet.create({
    listBox:{
        paddingBottom:10,
        // paddingTop:10,
        flexDirection:'column',
        backgroundColor:'#fff'
    },
    cellBox:{
        // flexDirection:'column',
    },
    cellBox_first:{
        flexDirection:'row',
        justifyContent: 'center',
        borderBottomWidth:0.5,
        borderBottomColor:'lightgrey',
        paddingBottom:5,
        alignItems:'center'
    },
    cellText_icon:{
        width:18,
        height:18,
        marginRight:4,
        borderRadius:9.5,
        marginTop:1
    },
    btn:{
        width:21,
        height:21,
        marginLeft:25,
    },
    cellText_distance:{
        fontSize:12,
        color:'#16d2d9',
        flex:3
    },
    cellText_Ent:{
        fontSize:16,
        color:'#293f66',
        textAlign:'left',
        flex:1,
        fontWeight:'bold'
    },
    cellText_time:{
        color:'#8c9fbe',
        fontSize:13,
        textAlign:'right',
    },
    splitLine:{
        height:20,
        backgroundColor:'#f7f8fa',
        // borderBottomWidth:0.5,
        // borderBottomColor:'#dcedf7',
        // borderTopWidth:0.5,
        // borderTopColor:'#e9edf7',
    },
    totalCount:{
        flexDirection:'row',
        alignItems:'center',
        paddingTop:10,
        paddingBottom:0,
        paddingLeft:15,
        paddingRight:1,
        flexWrap:'wrap',
    },
    totalTitle:{
        color:'#fff',
        backgroundColor:'#5292fe',
        marginRight:10,
        borderRadius:2,
        height:20,
        width:30,
        lineHeight:19,
        fontSize:12,
        textAlign:'center'
    },
    totalContent:{
        flexDirection:'row',
        flexWrap:'wrap',
        flex:1,
    },
    text1:{
        color:'#6b7c98',
        lineHeight:20
    },
    text2:{
        color:'#1171d1',
        lineHeight:20
    }

});
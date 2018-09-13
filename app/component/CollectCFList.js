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

import CFBuyScreen from '../CFBuyScreen'
import CFItem from './CFItem'
import EnterDetailScreen from '../EnterDetailScreen';
import Constants from '../util/Constants';
import CFSelectScreen from '../CFSelectScreen';
import TagScreen from '../TagScreen';
var Dimensions = require('Dimensions');
export default class CollectCFList extends Component {
    constructor(props) {
    super(props);
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
        dataSource: ds.cloneWithRows(['row 1', 'row 2', 'row 3']),
        favorited:this.props.rowData.favorited,
        tagInfo:this.props.rowData.tagInfo
    };
}
    componentWillMount(){
    }
    componentDidMount() {
        this.tagChangeListener=DeviceEventEmitter.addListener('tagChange',(text)=>{
            if(text.releaseId==this.props.rowData.releaseId){
                this.setState({
                    tagInfo:text
                })
            }
        });
        this.favoriteListener=DeviceEventEmitter.addListener('favorite',(text)=>{
          if(text==this.props.rowID){
            this.setState({favorited:!this.state.favorited});
          }
        });
    }
    componentWillUnmount(){
        this.tagChangeListener.remove();
        this.favoriteListener.remove();
    }
    goInquiry(){
        var _this = this;
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'CFSelectScreen',
                component:CFSelectScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    headData:this.props.rowData,
                    index:this.props.rowID
                }
            })
        }
    }
    render() {
        var widths = Dimensions.get('window').width;
        const {rowData}=this.props;
         var itemReleaseList=this.props.rowData.releaseWasteDetails;
         let cfList=(<View></View>);
         if(itemReleaseList&&itemReleaseList.length>0){
            var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
            var dataSource=ds.cloneWithRows(itemReleaseList);
            cfList=( <ScrollView><ListView
                    horizontal={true} 
                    dataSource={dataSource}
                    renderRow={(rowData,sectionID,rowID) => 
                         <CFItem navigator={this.props.navigator}  rowData={rowData} rowID={rowID} sectionID={sectionID}
                          ticketId={this.props.ticketId} headData={this.props.rowData}/>
                         }
                    /></ScrollView>);
         }
        let head=require('../../images/home/commom_icon_logo.png');
        if(rowData.fileId){
            head={uri:Constants.IMG_SERVICE_URL+'&fileID='+rowData.fileId};
        }
        // <TouchableOpacity style={{flex:1}} onPress={this.goInquiry.bind(this)}></TouchableOpacity>
        // {rowData.entAddress?
        //     <View style={{flexDirection:'row',alignItems:'center',paddingLeft:30,paddingRight:15}}>
        //         <Image style={{width:14,height:14,marginRight:4}} resizeMode={Image.resizeMode.contain} source={require('../../images/mine/publisharea.png')} />
        //         <Text style={{color:'#6b7c98',paddingRight:15}}>{rowData.entAddress||'--'}</Text>
        //     </View>:null}
        return (
                <View style={[styles.listBox,{paddingTop:0,paddingBottom:0}]} key={this.props.sectionID}>
                    <View style={[styles.cellBox]}>
                        <TouchableOpacity style={{flex:1}} onPress={this.goInquiry.bind(this)}>
                            <View style={{paddingTop:10,paddingBottom:10,marginLeft:15,marginRight:15,borderStyle:'dotted',borderColor:'#eeeefa',borderBottomWidth:1}}>
                                <View style={styles.cellBox_first} borderBottomWidth={rowData.itemReleaseList&&rowData.itemReleaseList.length>0?0.5:0}>
                                    <Image style={[styles.cellText_icon]} resizeMode={Image.resizeMode.contain} source={head} />
                                    <Text style={[styles.cellText_Ent]}>{rowData.entName||'--'}</Text> 
                                    <Text style={[styles.cellText_time]}>{rowData.releaseDate.substr(0,10)||'--'}</Text>
                                    {this.state.favorited?<Image style={[styles.cellText_icon,{width:14,height:14,marginRight:0,marginLeft:10}]} resizeMode={Image.resizeMode.contain} source={require('../../images/home/nav_icon_favouriteyellow.png')} />:null}
                                </View>
                            </View>
                            <View style={styles.totalCount}>
                                <Text style={styles.totalTitle}>总计</Text>
                                <View style={styles.totalContent}>
                                    <Text style={styles.text1}>{rowData.totalWasteCount}种危废，{rowData.totalWasteAmountDesc}，其中你可处置的有：</Text>
                                    <Text style={styles.text2}>{rowData.disposalWasteCount||0}种危废，{rowData.disposalWasteAmount||'0吨'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={{flexDirection:'row'}}>
                            {cfList}
                        </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',paddingBottom:10}}>
                            <Text></Text>
                            <TouchableOpacity onPress={this.goTag.bind(this)}>
                            <View style={{flexDirection:'row',alignItems:'center',marginRight:10}}>
                                <Image style={[styles.cellText_icon1]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/sign.png')} />
                                <Text style={{color:'#6b7c98'}}>{this.state.tagInfo&&this.state.tagInfo.tagStatus?this.state.tagInfo.tagStatus:'标记'}</Text>
                                <Text style={{color:'#6b7c98'}}>({this.state.tagInfo?this.state.tagInfo.count:0})</Text>
                                <Text style={{color:'#bac5d9',fontSize:26,marginLeft:3,position:'relative',top:-2}}>›</Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.splitLine} width={widths}></View>
                </View>
            
        );
    }
    goTag(){
        var _this = this;
        const { navigator} = this.props;
        if (navigator) {
            navigator.push({
                name:'TagScreen',
                component:TagScreen,
                params:{
                    navigator:navigator,
                    ticketId:this.props.ticketId,
                    releaseId:this.props.rowData.releaseId,
                    tagInfo:this.state.tagInfo
                }
            })
        }
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
    cellText_icon1:{
        width:18,
        height:18,
        marginRight:5,
        position:'relative',
        top:1
    },
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
        width:19,
        height:19,
        marginRight:10,
        borderRadius:9.5
    },
    cellText_distance:{
        fontSize:12,
        color:'#16d2d9',
        flex:3
    },
    cellText_Ent:{
        fontSize:13,
        color:'#293f66',
        textAlign:'left',
        flex:1
    },
    cellText_time:{
        color:'#8c9fbe',
        fontSize:11,
        textAlign:'right',
    },
    splitLine:{
        height:12,
        backgroundColor:'#f1f2f7',
        borderBottomWidth:0.5,
        borderBottomColor:'#dcedf7',
        borderTopWidth:0.5,
        borderTopColor:'#e9edf7',
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
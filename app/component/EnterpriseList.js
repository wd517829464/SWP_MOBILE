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
    TouchableHighlight,
    RefreshControl,
    DeviceEventEmitter
} from 'react-native';

import CFList from './CFList';
import NetUtil from '../util/NetUitl';
import weightList from '../util/WeightList';
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
export default class EnterpriseList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: ds,
            isLoading:true,
            isLoadingTail:false,
            loadComplete:false,
            noData:false,
            ticketId:''
        };
    }
    componentWillMount(){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.areaCode=ret.cantonCode&&ret.cantonCode.length>2?(ret.cantonCode.substring(0,2)+'0000'):'';
            this.ticketId=ret.ticketId;
            this.setState({
                ticketId:this.ticketId,
                areaCode:this.areaCode
            })
            this.cantonCodeList=[this.areaCode];
            this.amountIntervalStr=[];
            this.wasteCodeList=[];
            this.onRefresh();
        }).catch(err => {
            // alert('当前登录用户凭证已超时，请重新登录。');
        })
    }
    loading(){
        this.setState({
            isLoading:true,
            isLoadingTail:false,
            dataSource:ds.cloneWithRows([]),
            loadComplete:false,
            noData:false
         });
    }
    //componentDidUpdate
    componentDidMount() {
    
    this.areaListener=DeviceEventEmitter.addListener('areaSelect',(text)=>{
      if(text!='close'&&text!='open'){
          this._messages = [];
          if(text){
            this.cantonCodeList=[text];
          }else{
            this.cantonCodeList=[];
          }
          this.search();
      }
       
    });
    this.weightListener=DeviceEventEmitter.addListener('weightSelect',(text)=>{
        if(text!='open'&&text!='close'){
            if(text>-1){
                this.amountIntervalStr=[weightList[text]['value']];
                this.setState({weight:weightList[text]['name'],tabIndex:-1});
            }else{
                this.amountIntervalStr=[];
            }
            this.search();
        }
    });
    this.removeListener=DeviceEventEmitter.addListener('removeSelect',(text)=>{
        if(text!='open'&&text!='close'){
            this.wasteCodeList=this.getWasteCodeList(text);
            this.search();
        }
    });
    //changeHomeTab
    this.tabChangeListener=DeviceEventEmitter.addListener('changeHomeTab',(text)=>{
      if(text=="home"){
        storage.load({
            key: 'loginState',
        }).then(ret => {
            this.ticketId=ret.ticketId;
            this.setState({
                ticketId:this.ticketId
            })
            this.onRefresh();
        }).catch(err => {
        })
      }
    });
    this.favoriteListener=DeviceEventEmitter.addListener('favorite',(text)=>{
        if(text){
          this._messages[text]['favorited']=!this._messages[text]['favorited'];
          this.setState({
            dataSource: ds.cloneWithRows(this._messages)
          });
        }
      });
    
  }
  componentWillUnmount(){
    this.areaListener.remove();
    this.weightListener.remove();
    this.removeListener.remove();
    this.tabChangeListener.remove();
    this.favoriteListener.remove();
}
  getWasteCodeList(wasteCode) {
    var arr=[];
    for(var key in wasteCode){
        var value=wasteCode[key];
        if(typeof value=='number'||typeof value=='string'){
            arr.push(key.substring(2,4));
        }else{
            for(var j in value){
                arr.push(value[j]);
            }
        }
    }
    return arr;
}
  search(){
    this.pageIndex=1;
    this._messages=[];
    this.loading();
    this.loadData();
  }
    onRefresh(){
        this._messages = [];
        this.sortByDistance=0;
        this.searchCondition='';
        this.pageIndex=1;
        this.pageSize=5,
        this.loading();
        this.loadData();
    }
    getDataSource(messages){
        if(messages.length<this.state.pageSize){
            this.setState({loadComplete:true,isLoadingTail:false});
        }
      if(!this.state.dataSource||this.pageIndex==1){
        this.state.dataSource=new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this._messages = [].concat(messages);
      }else{
        this._messages =this._messages.concat(messages);
      }
      return this.state.dataSource.cloneWithRows(this._messages);
  }
    _onEndReached() {
        if (!this.state||this.state.isLoadingTail) {
            return;
        }
        this.setState({
            isLoadingTail: true
        });
        this.loadData();
    }
    async loadData(){
        if(this.state.loadComplete){
            this.setState({
                isLoadingTail: false,
                isLoading:false,
            });
            return;
        }
        var param={
        }
        if(this.cantonCodeList.length>0){
            param.cantonCodeList=this.cantonCodeList;
        }
        if(this.amountIntervalStr.length>0){
            param.amountIntervalStr=this.amountIntervalStr;
        }
        if(this.wasteCodeList.length>0){
            param.wasteCodeList=this.wasteCodeList;
        }
        if(this.props.favorite){
            param.favorited=true;
            // param.cantonCodeList=[];
        }
        NetUtil.jsonAjax({
            url:'/entRelease/listWasteEntRelease.htm?ticketId='+this.ticketId+'&pageIndex='+(this.pageIndex++)+'&pageSize='+this.pageSize,
            data:param,
            success:(responseJson)=>{
                console.log(responseJson);
                var responseData = responseJson;
                var noData=this._messages.length==0&&(!responseData.data||responseData.data.length==0);
                if (responseData) {
                     this.setState ({
                        noData:noData,
                        dataSource: responseData.data?this.getDataSource(responseData.data):ds,
                        isLoading:false,
                        isLoadingTail:false,
                    });
                }else{
                     this.setState ({
                        noData:noData,
                        dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
                        isLoading:false,
                        isLoadingTail:false,
                    });
                }
            },
            error:(error)=>{
                this.setState ({
                        noData:[],
                        dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
                        isLoading:false,
                        isLoadingTail:false,
                    });
            }
        });

    }
    childMethod(obj,index){
        var item=this._messages[index];
        item.entName = obj.entName;
        item.entAddress =obj.entAddress;
        item.entBindStatus = '1';
        this._messages[index]=item;
        this.setState({
            dataSource:ds.cloneWithRows(this._messages)
        })
    }
    childMethodFavorite(index){
        var item=this._messages[index];
        item.favorited=!item.favorited;
        this._messages[index]=item;
        this.setState({
            dataSource:ds.cloneWithRows(this._messages)
        })
    }
    render() {
        if(!this.state.dataSource){
            if(this.state.noData&&!this.state.isLoading&&!this.state.isLoadingTail){
                return (<Text style={styles.nodata}>暂无相关信息</Text>);
            }
            return (
                <ListView
                     dataSource={ds}
                     enableEmptySections={true}
                     refreshControl={  
                        <RefreshControl  
                        // onRefresh={this.onRefresh.bind(this)}  
                        refreshing={this.state.isLoading}  
                        colors={['#ff0000', '#00ff00', '#0000ff']}  
                        enabled={true}  
                        />  
                    }  
                    renderRow={(rowData,sectionID,rowID) => 
                        <View></View>
                    }
                />
            )
        }
        return (
                <View style={{flex:1,flexDirection:'column'}}>

                    {this.state.noData&&!this.state.isLoading&&!this.state.isLoadingTail?<Text style={styles.nodata}>暂无相关信息</Text>:null}
                    <ListView
                     dataSource={this.state.dataSource}
                     enableEmptySections={true}
                     refreshControl={  
                        <RefreshControl  
                        onRefresh={this.onRefresh.bind(this)}  
                        refreshing={this.state.isLoading}  
                        colors={['#ff0000', '#00ff00', '#0000ff']}  
                        enabled={true}  
                        />  
                    }  
                      renderRow={(rowData,sectionID,rowID) => 
                      <CFList navigator={this.props.navigator} rowData={rowData}  callbackParent={(text)=>{this.props.callbackParent(text)}} sectionID={sectionID} rowID={rowID} ticketId={this.props.ticketId}/>
                    }
                    onEndReachedThreshold={10}
                     onEndReached={this._onEndReached.bind(this)}
                />
                
                
                {(this.state.isLoadingTail&&!this.state.isLoading)?<Image style={styles.loadImage}  resizeMode={Image.resizeMode.contain} source={require('../../images/base/load.gif')} />:null}
            </View>
                
        );
    }
    
}

const styles = StyleSheet.create({
     loadImage:{
         width:25,
         height:25,
        alignSelf:'center',
    },
    nodata:{
        color:'#8c9dbf',
        alignSelf:'center',
        marginTop:100
    },
});
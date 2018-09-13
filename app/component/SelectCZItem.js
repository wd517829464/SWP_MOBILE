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
    TouchableWithoutFeedback,
    DeviceEventEmitter
} from 'react-native';


export default class SelectCZItem extends Component {
    constructor(props) {
        super(props);
        this.state={
            choosed:false
        }
    }
    goInquiry(){
        if(!this.state.choosed){
            this.setState({
                choosed:true
            });
            DeviceEventEmitter.emit('wasteSelect',this.props.rowData.customerId);
        }
    }
    componentDidMount() {
        //注意addListener的key和emit的key保持一致
        this.msgListener = DeviceEventEmitter.addListener('wasteSelect',(customerId) => {
            if(customerId!=this.props.rowData.customerId){
                this.setState({
                    choosed:false
                });
            }
        });
    }
    componentWillUnmount() {
        //此生命周期内，去掉监听
        this.msgListener&&this.msgListener.remove();
    }
    setChoosed(flag){
        this.setState({
            choosed:flag
        })
    }
    render() {
        var Dimensions = require('Dimensions');
        var widths = Dimensions.get('window').width;
        const {rowData,rowID,sectionID,planitemReleaseId}=this.props;
        
        return (
            <TouchableWithoutFeedback onPress={this.goInquiry.bind(this)}>
                <View style={styles.row}>
                    <View style={[styles.CFItem]}>
                        <Text  style={styles.wasteName}>{rowData.customerName}</Text>
                    </View>
                    {this.state.choosed?
                        <Image style={[styles.circle]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/common_icon_choosed.png')} />:
                        <Image style={[styles.circle]} resizeMode={Image.resizeMode.contain} source={require('../../images/shopcart/common_icon_unchoosed.png')} />
                    }
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    row:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
        paddingTop:18,
        paddingBottom:18,
        paddingLeft:12,
        paddingRight:12,
        borderTopWidth:0.7,
        borderColor:'#dce3f3',
    },
    circle:{
        width:20,
        height:20,
        marginLeft:12
    },
    CFItem:{
        flex:1,
        flexDirection: 'column',
    },
    cfItem2:{
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cfItem3:{
        flexDirection: 'row',
    },
    wasteName:{
        color:'#293e69',
    },
    wasteCode:{
        color:'#6c7d99',
    },
    grey:{
        backgroundColor:'#f7f8fa',
    },
    greyText:{
        color:'#bcc4d9'
    },
});
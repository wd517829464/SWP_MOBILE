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


export default class SelectCFItem extends Component {
    constructor(props) {
        super(props);
        this.state={
            choosed:false
        }
    }
    goInquiry(){
        this.props.rowData.choosed=!this.state.choosed;
        // DeviceEventEmitter.emit('wasteSelect',this.props.rowData);
        this.setState({
            choosed:!this.state.choosed
        });
        this.props.callbackParent(this.props.rowData);
    }
    componentDidMount() {
        //注意addListener的key和emit的key保持一致
        this.msgListener = DeviceEventEmitter.addListener('allSelect',(choosed) => {
            this.setState({
                choosed:choosed,
            })
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
                        <Text numberOfLines={1} style={styles.wasteName}>{rowData.wasteName}</Text>
                        <View style={styles.cfItem2}>
                            <Text style={styles.wasteCode}>{rowData.wasteCode}</Text>
                            <View style={styles.cfItem3}><Text style={styles.wasteCode}>数量：</Text><Text style={styles.wasteName}>{rowData.wasteAmount}{rowData.unitValue}</Text></View>
                        </View>
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
        padding:12,
        borderTopWidth:1,
        borderColor:'#dce3f3',
    },
    circle:{
        width:20,
        height:20,
        // borderWidth:1,
        // borderColor:'#dce3f3',
        // borderRadius:10,
        marginLeft:20
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
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
} from 'react-native';

import ModalDropdown from 'react-native-modal-dropdown';
//import ModalDropdown from './ModalDropdown';

const DEMO_OPTIONS_1 = ['园区', '吴中区', '姑苏区', '相城区', '吴江区', '高新区', '昆山', '太仓', '张家港','常熟'];
const DEMO_OPTIONS_2 = ['距离由近到远', '可处置', '可关注'];
 
var Dimensions = require('Dimensions');
var widths = Dimensions.get('window').width;
export default class DropDown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  render() {
    let dropdown_6_icon = this.state.dropdown_6_icon_heart ? require('../../images/dropdown/heart.png') : require('../../images/dropdown/flower.png');
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.cell} width={widths/2}>
            <ModalDropdown style={styles.dropdown} width={widths/2}
                           textStyle={styles.dropdown_text}
                           defaultValue='区域'
                           dropdownStyle={styles.dropdown_dropdown}
                           options={DEMO_OPTIONS_1}
                           onSelect={(idx)=>this.dropdownSelect(idx)}
                           renderRow={this._dropdown_2_renderRow.bind(this)}
                           renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
            />
            <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/dropdown_icon_arow.png')}/>
          </View>
          <View style={styles.cell} width={widths/2}>
            <ModalDropdown style={styles.dropdown} width={widths/2}
                           textStyle={styles.dropdown_text}
                           defaultValue='排序'
                           dropdownStyle={styles.dropdown_dropdown}
                           options={DEMO_OPTIONS_2}
                           onSelect={(idx)=>this.dropdownSelect(idx)}
                           renderRow={this._dropdown_2_renderRow.bind(this)}
                           renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
            />
            <Image style={styles.dropdown_icon_arow} resizeMode={Image.resizeMode.contain}  source={require('../../images/dropdown/dropdown_icon_arow.png')}/>
          </View>
        </View>
        <View style={styles.splitLine_dropdown}></View>
      </View>
    );
  }
   dropdownSelect(idx) {
     console.log(idx);
    // var value = this.props.defaultValue;
    // if (idx == null || this.props.options == null || idx >= this.props.options.length) {
    //   idx = this.props.defaultIndex;
    // }

    if (idx >= 0) {
      value = DEMO_OPTIONS_2[idx].toString();
    }

    // this._nextValue = value;
    // this._nextIndex = idx;

    this.setState({
      buttonText: value,
      selectedIndex: idx,
    });
  }
 _dropdown_2_renderRow(rowData, rowID, highlighted) {
    let icon = highlighted ? require('../../images/dropdown/heart.png') : require('../../images/dropdown/flower.png');
    let evenRow = rowID % 2;
    return (
      <TouchableHighlight underlayColor='cornflowerblue'>
        <View style={[styles.dropdown_2_row, {backgroundColor: evenRow ? '#e0e4eb' : 'white'}]} width={widths/2}>
          {// <Image style={styles.dropdown_2_image}
          //        mode='stretch'
          //        source={icon}
          // />
        }
          <Text style={[styles.dropdown_2_row_text, highlighted && {color: 'mediumaquamarine'}]}>
            {`${rowData}`}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  _dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    if (rowID == DEMO_OPTIONS_1.length - 1) return;
    let key = `spr_${rowID}`;
    return (<View style={styles.dropdown_2_separator} key={key}/>);
  }

 
}

const styles = StyleSheet.create({
  container: {
    height:50
  },
  dropdown_icon_arow:{
    width:10,
    height:10,
    position: 'absolute',
    right:20,
    top:12
  },
  cell:{
    borderRightColor:'#eaeef1',
    borderRightWidth:0.5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  dropdown: {
    alignSelf: 'center',
    //width: 100,
    borderWidth: 0,
    borderRadius: 3,
    // backgroundColor:'#ff0',
  },
  dropdown_text: {
    marginVertical: 10,
    marginHorizontal: 6,
    fontSize: 14,
    color:'#6b7c99',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight:'bold'
  },
  dropdown_dropdown: {
    //width: 150,
    borderColor: '#f7f8fa',
    borderWidth: 1,
    borderRadius: 3,
    height:200
  },
  dropdown_2_row: {
    flex:1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dropdown_2_image: {
    marginLeft: 4,
    width: 30,
    height: 30,
  },
  dropdown_2_row_text: {
    flex:1,
    marginHorizontal: 4,
    fontSize: 16,
    color: '#909bb0',
    textAlignVertical: 'center',
    textAlign:'center'
  },
  dropdown_2_separator: {
    // height: 1,
    // backgroundColor: 'cornflowerblue',
  },
  splitLine_dropdown:{
    height:15,
    backgroundColor:'#f7f8fa',
    borderBottomWidth:0.5,
    borderBottomColor:'#dcedf7',
    borderTopWidth:0.5,
    borderTopColor:'#e9edf7',
  }
});



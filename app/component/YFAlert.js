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
    Modal,
    TouchableHighlight,
     Dimensions,
} from 'react-native';
var { width, height, scale } = Dimensions.get('window');

export default class YFAlert extends Component {
    constructor(props) {
    super(props);
        this.state={
            searchContent:'',
            show:false,  

        }
    }
            
        
  _leftButtonClick() {  
  
  }  
  _rightButtonClick() {  
    //  
    console.log('右侧按钮点击了');  
    this._setModalVisible();  
  }  
  
  // 显示/隐藏 modal  
  _setModalVisible() {
      
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  
    render() {
        const {show} = this.props;
        // 
        return (
        <View style={styles.container}>
          

         </View>  
            
        )
    }
    
}

const styles = StyleSheet.create({
    container:{  
        flex:1,  
        backgroundColor: '#ECECF0',  
    },  
    // modal上子View的样式  
  subView:{  
    marginLeft:60,  
    marginRight:60,  
    backgroundColor:'#fff',  
    alignSelf: 'stretch',  
    justifyContent:'center',  
    borderRadius: 10,  
    borderWidth: 0.5,  
    borderColor:'#ccc',  
  },  
  // 标题  
  titleText:{  
    marginTop:10,  
    marginBottom:5,  
    fontSize:16,  
    fontWeight:'bold',  
    textAlign:'center',  
  },  
  // 内容  
  contentText:{  
    margin:8,  
    fontSize:14,  
    textAlign:'center',  
  },  
  // 水平的分割线  
  horizontalLine:{  
    marginTop:5,  
    height:0.5,  
    backgroundColor:'#ccc',  
  },  
  // 按钮  
  buttonView:{  
    flexDirection: 'row',  
    alignItems: 'center',  
  },  
  buttonStyle:{  
    flex:1,  
    height:44,  
    alignItems: 'center',  
    justifyContent:'center',  
  },  
  // 竖直的分割线  
  verticalLine:{  
    width:0.5,  
    height:44,  
    backgroundColor:'#ccc',  
  },  
  buttonText:{  
    fontSize:16,  
    color:'#3393F2',  
    textAlign:'center',  
  },  
});
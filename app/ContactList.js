/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 
 * 企业联系人列表，用于当企业有多个联系人的时候，如果用户开启聊天功能，就展示联系人列表供用户选择
 */

import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  ListView,
  BackHandler,
  StatusBar,
  Platform
} from "react-native";
import Item from "./component/ContactListItem";
import Top from './component/Top';

const { width, height } = Dimensions.get("window");

export default class ContactList extends Component {
  constructor(props) {
    super(props);
    var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    console.log("联系人列表页面获取到的联系人数据" + this.props.data);
    const { data,navigator,ticketId ,enterName} = this.props;
    console.log("联系人列表页面获取到的联系人数据" + data);
    this.state = {
      dataSource: ds.cloneWithRows(data)
    };

    this.back = this.back.bind(this);
  }

  back() {
    this.goback();
    return true;
  }
  componentDidMount() {
    var st = this;
    BackHandler.addEventListener("hardwareBackPressBind", this.back);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPressBind", this.back);
  }

  goback() {
    const { navigator } = this.props;
    if (navigator) {
      navigator.pop();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />
        <Top
          navigator={this.props.navigator}
          ticketId={this.props.ticketId}
          title={"选择咨询联系人"}
        />

        <View style={{ height: 1, width: width, backgroundColor: "#dfe3ed" }} />
        <View
          style={{
            height: 28,
            width: width,
            backgroundColor: "#f7f8fa",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center"
          }}
        >
          <View style={{ height: 1, width: 40, backgroundColor: "#dfe3ed" }} />
          <Text
            style={{
              color: "#99a8bf",
              fontSize: 12,
              marginRight: 5,
              marginLeft: 5
            }}
          >
            该企业共{this.props.data.length||0}名联系人
          </Text>
          <View style={{ height: 1, width: 40, backgroundColor: "#dfe3ed" }} />
        </View>

        <View style={{ height: 1, width: width, backgroundColor: "#dfe3ed" }} />


        <ListView
        style={{backgroundColor:'#f7f8fa'}}
          dataSource={this.state.dataSource}
          renderRow={rowData =>
            <Item
              name={rowData.chineseName}
              phoneNum={rowData.phoneNum}
              enterName={this.props.enterName}
              navigator={this.props.navigator}
            />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
  },
  item: {
    height: 50,
    backgroundColor: "#C6C6C6",
    justifyContent: "center", //垂直居中
    alignItems: "center" //水平居中
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  image: {
    width: 150,
    height: 215,
    marginTop: 30
  },

  moviewName: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "red"
  },
  instructions: {
    textAlign: "center",
    marginBottom: 5
  }
});

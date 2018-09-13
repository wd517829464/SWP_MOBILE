/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ToastAndroid,
  TouchableOpacity,
  NativeModules
} from "react-native";

const { NimModule } = NativeModules;

const { width, height } = Dimensions.get("window");

const thirdWidth = width / 3;
const imageWidth = thirdWidth - 10 * 2;

const ContactListItem = props => {
  const { phoneNum, name, navigator,enterName } = props;
  return (
    <TouchableOpacity
    style={styles.container}
    onPress={() => {
      this.openChat(phoneNum);
    }}
    >
    <View style={styles.root}>
      <Image
        style={styles.imageStyle}
        source={require("../../images/shopcart/commom_icon_logo.png")}
      />
      <View style={styles.accountRoot}>
        <View style={styles.accoubtRoot2}>
          <Text style={styles.accountName_online}>{enterName}{':'}{name}</Text>
          <Text style={styles.presenceInformation_online}> 在线</Text>
        </View>

        <Text >云信号码：{phoneNum}</Text>
      </View>
    </View>

    <View
      style={{ height: 1, width: width, backgroundColor: "rgb(224,230,243)" }}
    />
    {/* <Text numberOfLines={1} style={styles.name}>
      {name}
    </Text> */}
    </TouchableOpacity>
  );
};

export default ContactListItem;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: width,
    backgroundColor: "#fff",
    height: 60,
    flexDirection: "column",
    justifyContent: "center", //垂直居中
    // alignItems: 'center', //水平居中
    marginRight: 15
  },

  root: {
    height: 59,
    width: width,
    flexDirection: "row",
    alignItems: "center"
  },

  accountRoot: {
    flexDirection: "column"
  },

  accoubtRoot2: {
    flexDirection: "row"
  },

  accountName_online: {
    color: "#293f66",
    fontSize: 14
  },

  accountName_offline: {
    color: "#99a8bf",
    marginLeft: 5,
    fontSize: 14
  },

  accountIM: {
    color: "#99a8bf",
    marginLeft: 5,
    fontSize: 12
  },

  presenceInformation_online: {
    borderWidth: 1,
    borderColor: "#2676ff",
    borderRadius: 3,
    paddingBottom:2,
    paddingLeft:2,
    paddingRight:2,
    paddingTop:3,
    // padding: 3,
    alignItems: "center",
    justifyContent: "center", 
    color: "#2676ff",
    marginLeft: 5,
    fontSize: 11
  },

  presenceInformation_offline: {
    borderWidth: 1,
    borderColor: "#99a8bf",
    borderRadius: 3,
    paddingBottom:2,
    paddingLeft:2,
    paddingRight:2,
    paddingTop:3,
    // padding: 3,
    alignItems: "center",
    justifyContent: "center", 
    color: "#99a8bf",
    marginLeft: 5,
    fontSize: 11
  },

  imageStyle: {
    height: 36,
    width: 36,
    alignItems: "center",
    marginLeft: 12,
    marginRight: 12,
    justifyContent: "center" //垂直居中
  },

  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  image: {
    width: imageWidth,
    height: width / 3,
    alignItems: "center",
    marginTop: 20
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    paddingLeft: 20,
    marginTop: 5,
    color: "#313131"
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});

openChat = (phoneNum, navigator) => {
  // ToastAndroid.show("条目携带的电话号码为" + phoneNum, ToastAndroid.SHORT);
  NimModule.ChatWith(phoneNum,()=>{}) ;
  if (navigator) {
    navigator.pop();
    // navigator.replace({
    //   name: "chatScreen",
    //   component: chatScreen,
    //   params: {
    //     navigator: navigator,
    //     phoneNum: phoneNum,
    //   }
    // });
  }
};



import React from 'react';
import {
     DeviceEventEmitter
  } from 'react-native';
import Constants from './Constants';
// var domain='http://121.40.113.7:80/swp';
// var domain='http://www.yifeiwang.com/swp';
// var domain='http://192.168.253.153:8082/solid_waste';
// var domain='http://192.168.253.153:8083/solid_waste';
// var domain = 'http://192.168.253.162:18080/swp';

//192.168.253.224:8080/solid_waste  192.168.252.33:8080/swp
//http://121.40.113.7:80/swp http://192.168.253.153:8082/solid_waste
export default class NetUitl extends React.Component {
    static endWith(str,endStr){
        var d=str.length-endStr.length;
        return (d>=0&&str.lastIndexOf(endStr)==d)
    }
    static ajax(data) {
        if(!NetUitl.endWith(data['url'],'.htm')){
            data['url']+='.htm';
        }
        fetch(Constants.demain + data['url'], {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: NetUitl.toQueryString(data['data'])
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.status==-1){
                    DeviceEventEmitter.emit('login','');
                    return;
                }
                data['success'](responseJson)
            })
            .catch((error) => {
                data['error'] && data['error'](error);
            })
    }
    static collectingUserBehavior(ticketId,eventCode,remark,eventValue) {
        var param={
            eventCode:eventCode,
            ticketId:ticketId
        };
        if(remark){
            param.remark=remark;
        }
        if(eventValue){
            param.eventValue=eventValue;
        }
        NetUitl.ajax({
            url:'/userAction/saveUserAction',
            data:param,
            success: (result)=> {

            }
        })
    }
    static jsonAjax(data) {
        fetch(Constants.demain+data['url'], {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.data)
          })
          .then((response) => response.json())
          .then((responseJson) => {
            if(responseJson.status==-1){
                DeviceEventEmitter.emit('login','');
                return;
            }
            data['success'](responseJson)
          })
          .catch((error) => {
            data['error'] && data['error'](error);
          });
    }
    static toQueryString(obj) {
        return obj ? Object.keys(obj).sort().map(function(key) {
            var val = obj[key];
            if (Array.isArray(val)) {
                return val.sort().map(function(val2) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }
            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    }
}
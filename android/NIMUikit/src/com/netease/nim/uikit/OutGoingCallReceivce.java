package com.netease.nim.uikit;

/**
 * Created by wudang on 2018/9/7.
 */

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

/**
 * 作者：Jacky
 * 邮箱：550997728@qq.com
 * 时间：2016/2/12 15:22
 */
public class OutGoingCallReceivce extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {

        SharedPreferences sp = context.getSharedPreferences("config",1);
        String number = sp.getString("number", "0");
        //拿到拨打的号码
        String currentNumber = getResultData();
        //判断是否为长途
        if (currentNumber.startsWith("0")) {
            //修改拨打的号码
            setResultData(number+currentNumber);
        }

    }
}
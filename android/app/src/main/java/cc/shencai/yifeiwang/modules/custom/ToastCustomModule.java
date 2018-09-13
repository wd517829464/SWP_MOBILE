package cc.shencai.yifeiwang.modules.custom;

import android.content.Intent;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.netease.nim.uikit.NimUIKit;
import com.netease.nim.uikit.common.util.log.LogUtils;
import com.netease.nim.uikit.session.SessionCustomization;
import com.netease.nim.uikit.session.activity.P2PMessageActivity;
import com.netease.nimlib.sdk.AbortableFuture;
import com.netease.nimlib.sdk.RequestCallback;
import com.netease.nimlib.sdk.auth.LoginInfo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by mlscmbp on 2017/6/17.
 */

public class ToastCustomModule extends ReactContextBaseJavaModule {
	private static final String DURATION_SHORT = "SHORT";
	private static final String DURATION_LONG = "LONG";
	private final String TAG = "login";
	private AbortableFuture<LoginInfo> loginRequest;

	public ToastCustomModule(ReactApplicationContext reactContext) {
		super(reactContext);
	}

	@Override
	public String getName() {
		return "ToastCustomAndroid";
	}

	@Nullable
	@Override
	public Map<String, Object> getConstants() {
		final Map<String, Object> constants = new HashMap<>();
		constants.put(DURATION_SHORT, Toast.LENGTH_SHORT);
		constants.put(DURATION_LONG, Toast.LENGTH_LONG);
		return constants;
	}

	@ReactMethod
	public void show(String message, int duration) {
		Toast.makeText(getReactApplicationContext(), message, duration).show();
		Toast.makeText(getReactApplicationContext(), message, Toast.LENGTH_SHORT);
	}

	@ReactMethod
	public void testCallback(int testNum, Promise promise) {
		int sum = 0;
		try {
			WritableMap map = Arguments.createMap();
			sum = 2 * testNum;
			map.putInt("sum", sum);
			promise.resolve(map);
		} catch (IllegalViewOperationException e) {
			promise.reject("0", e.getMessage());
		}
	}

	/**
	 * js页面跳转到activity 并传数据
	 *
	 * @param name
	 */
	@ReactMethod
	public void startActivityByClassname(String name) {
//		getCurrentActivity().startActivity(new Intent(getCurrentActivity(),P2PMessageActivity.class));
		P2PMessageActivity.start(getCurrentActivity(), NimUIKit.getAccount(), new SessionCustomization(), null);
//		try{
//			Activity currentActivity = getCurrentActivity();
//			if(null!=currentActivity){
//				Class aimActivity = Class.forName(name);
//				Intent intent = new Intent(currentActivity,aimActivity);
//				currentActivity.startActivity(intent);
//			}

//		}catch(Exception e){
//			throw new JSApplicationIllegalArgumentException(
//					"无法打开activity页面: "+e.getMessage());
//		}
	}


	@ReactMethod
	public void login() {
		LogUtils.d(TAG, "login: 登录方法被调用");

		LoginInfo loginInfo = new LoginInfo("18100000004", "aca3b3cfb69329c097007aeea467eb01");
		NimUIKit.doLogin(loginInfo, new RequestCallback<LoginInfo>() {
			@Override
			public void onSuccess(LoginInfo loginInfo) {
				Toast.makeText(getReactApplicationContext(), "成功", Toast.LENGTH_SHORT);
				LogUtils.d(TAG, "onSuccess: 登录成功,account = " + loginInfo.getAccount() +
						",AppKey=" + loginInfo.getAppKey() +
						",Token=" + loginInfo.getToken());
			}

			@Override
			public void onFailed(int i) {
				Toast.makeText(getReactApplicationContext(), "失败" + i, Toast.LENGTH_SHORT);
				LogUtils.d(TAG, "onFailed: 失败"+i);
			}

			@Override
			public void onException(Throwable throwable) {
				Toast.makeText(getReactApplicationContext(), "出错" + throwable.toString(), Toast.LENGTH_SHORT);
				LogUtils.d(TAG, "onException: 出错"+throwable.toString());
			}
		});

	}
}

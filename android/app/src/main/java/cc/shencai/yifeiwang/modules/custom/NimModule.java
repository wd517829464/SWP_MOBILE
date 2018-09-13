package cc.shencai.yifeiwang.modules.custom;

import android.app.Activity;
import android.content.Intent;
import android.support.annotation.Nullable;
import android.text.TextUtils;
import android.util.Log;
import android.view.animation.TranslateAnimation;
import android.widget.Toast;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.netease.nim.uikit.NimUIKit;
import com.netease.nim.uikit.common.ui.dialog.DialogMaker;
import com.netease.nim.uikit.common.util.log.LogUtils;
import com.netease.nim.uikit.common.util.sys.NetworkUtil;
import com.netease.nim.uikit.custom.DefalutP2PSessionCustomization;
import com.netease.nim.uikit.uinfo.UserInfoHelper;
import com.netease.nimlib.sdk.NIMClient;
import com.netease.nimlib.sdk.Observer;
import com.netease.nimlib.sdk.RequestCallback;
import com.netease.nimlib.sdk.RequestCallbackWrapper;
import com.netease.nimlib.sdk.ResponseCode;
import com.netease.nimlib.sdk.StatusBarNotificationConfig;
import com.netease.nimlib.sdk.auth.AuthService;
import com.netease.nimlib.sdk.auth.LoginInfo;
import com.netease.nimlib.sdk.avchat.AVChatCallback;
import com.netease.nimlib.sdk.friend.FriendService;
import com.netease.nimlib.sdk.friend.constant.VerifyType;
import com.netease.nimlib.sdk.friend.model.AddFriendData;
import com.netease.nimlib.sdk.msg.MessageBuilder;
import com.netease.nimlib.sdk.msg.MsgService;
import com.netease.nimlib.sdk.msg.MsgServiceObserve;
import com.netease.nimlib.sdk.msg.constant.SessionTypeEnum;
import com.netease.nimlib.sdk.msg.model.IMMessage;
import com.netease.nimlib.sdk.msg.model.RecentContact;
import com.netease.nimlib.sdk.uinfo.UserService;
import com.netease.nimlib.sdk.uinfo.model.NimUserInfo;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cc.shencai.yifeiwang.MainActivity;
import cc.shencai.yifeiwang.R;
import cc.shencai.yifeiwang.modules.custom.login.LogoutHelper;
import cc.shencai.yifeiwang.modules.custom.preference.Preferences;
import cc.shencai.yifeiwang.modules.custom.preference.UserPreferences;
import cc.shencai.yifeiwang.modules.custom.session.SessionHelper;
import cc.shencai.yifeiwang.modules.custom.session.bean.RecentContactsItemBean;
import cn.jpush.android.api.JPushInterface;

/**
 * Created by woshi on 2017-06-26.
 */

public class NimModule extends ReactContextBaseJavaModule {

	private static final String MODULE_NAME = "NimModule";

	private final String TAG = "login";
	private static final String MAIN_ACTIVITY_CLASSNAME = "cc.shencai.yifeiwang.MainActivity";

	public NimModule(ReactApplicationContext reactContext) {
		super(reactContext);
		// 注册消息监听事件
		this.registerReceiveMessage(reactContext, true);
	}

	@Override
	public String getName() {
		return MODULE_NAME;
	}

	/**
	 * 注册/注销 观察者事件
	 *
	 * @param reactContext React 上下文对象
	 * @param isRegister   true 为注册，false 为注销
	 */
	private void registerReceiveMessage(final ReactApplicationContext reactContext, boolean isRegister) {
		// 创建观察中
		Observer<List<RecentContact>> messageObserver = new Observer<List<RecentContact>>() {
			@Override
			public void onEvent(List<RecentContact> recentContactList) {
				WritableMap params = Arguments.createMap();
				int count = NIMClient.getService(MsgService.class).getTotalUnreadCount();
				params.putInt("unreadCount", count);
				sendEvent(reactContext, "receiveMessage", params);
			}
		};
		NIMClient.getService(MsgServiceObserve.class).observeRecentContact(messageObserver, isRegister);
	}

	/**
	 * 发送事件给 js 端
	 *
	 * @param reactContext
	 * @param eventName
	 * @param params
	 */
	private void sendEvent(ReactApplicationContext reactContext, String eventName, @Nullable WritableMap params) {
		if (reactContext != null) {
			reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
		}
	}

	/**
	 * IM 登录
	 *
	 * @param account  登录账号
	 * @param password 登录密码
	 */
	@ReactMethod
	public void login(final String account, final String password,final Callback sCallback,final Callback errCallback) {
		LogUtils.d(TAG, "login: 登录马上开始");
		LoginInfo loginInfo = new LoginInfo(account, password);
		RequestCallback<LoginInfo> callback = new RequestCallback<LoginInfo>() {
			@Override
			public void onSuccess(LoginInfo loginInfo) {
				LogUtils.d(TAG, "onSuccess: 成功");
				// 缓存账号
				DemoCache.setAccount(account);
				Preferences.saveUserAccount(account);
				Preferences.saveUserToken(password);

				// 初始化消息提醒配置
				initNotificationConfig();

				// 初始化消息提醒
//				NIMClient.toggleNotification(UserPreferences.getNoticeContentToggle());
                NIMClient.toggleNotification(true);


                // 构建缓存
				// DataCacheManager.buildDataCacheAsync();

				JSONObject json = new JSONObject();
				try {
					int unreadCount = NIMClient.getService(MsgService.class).getTotalUnreadCount();
					json.put("code", 200);
					json.put("unreadCount", unreadCount);
				} catch (Exception e) {
//					promise.reject(e);
					errCallback.invoke(e);
				}
//				promise.resolve(json.toJSONString());
				sCallback.invoke(json.toJSONString());
//				toP2PMessageActivity();
//				toP2PChat("2123");
			}

			@Override
			public void onFailed(int code) {
				LogUtils.d(TAG, "onFailed: 失败");
				JSONObject json = new JSONObject();
				// { code: 302 }
				json.put("code", code);
				if (code == 302 || code == 404) {
					json.put("message", "登录失败");
				}
				LogUtils.d(TAG, "onFailed: 登录失败" + json.toString());
//				promise.resolve(json.toJSONString());
				sCallback.invoke(json.toJSONString());
			}

			@Override
			public void onException(Throwable throwable) {
				LogUtils.d(TAG, "onException: 出错");
//				promise.reject(throwable);
				sCallback.invoke(throwable);
			}
		};
		NIMClient.getService(AuthService.class).login(loginInfo).setCallback(callback);
	}

	/**
	 * 初始化消息提醒
	 */
	private void initNotificationConfig() {
		NIMClient.toggleNotification(UserPreferences.getNoticeContentToggle());

		// 加载状态栏配置
		StatusBarNotificationConfig statusBarNotificationConfig = UserPreferences.getStatusConfig();

		if (statusBarNotificationConfig == null) {
			statusBarNotificationConfig = DemoCache.getNotificationConfig();
			UserPreferences.setStatusConfig(statusBarNotificationConfig);
		}

		// 更新配置
		NIMClient.updateStatusBarNotificationConfig(statusBarNotificationConfig);
	}

	/**
	 * IM 登出
	 */
	@ReactMethod
	public void logout() {
		System.out.println("java后台    IM 注销");
		Preferences.saveUserToken("");
		NIMClient.getService(AuthService.class).logout();
		// 清理缓存&注销监听
		LogoutHelper.logout();
	}

	/**
	 * 测试接口
	 * 跳转到IM页
	 */
	@ReactMethod
	public void toYunXinIM() {
		try {
			Activity currentActivity = getCurrentActivity();

			if (null != currentActivity) {
				currentActivity.startActivity(new Intent(currentActivity, Class.forName(MAIN_ACTIVITY_CLASSNAME)));
			}
		} catch (Exception e) {
			Toast.makeText(new MainActivity(), "跳转失败: " + e.getMessage(), Toast.LENGTH_SHORT).show();
		}
	}

	/**
	 * 测试接口
	 * 咨询客服
	 *
	 * @param userId  用户id
	 * @param textMsg 提醒内容
	 */
	@ReactMethod
	public void chatWithCS(String userId, String textMsg) {
		IMMessage message = MessageBuilder.createTextMessage(userId, SessionTypeEnum.P2P, textMsg);
		// 第二个参数表示发送失败后重发，false为不重发
		NIMClient.getService(MsgService.class).sendMessage(message, true);
	}


	/**
	 * 测试接口
	 * 发送tip给指定用户
	 *
	 * @param userId  用户id
	 * @param textMsg 提醒内容
	 */
	@ReactMethod
	public void p2pTipMsg(String userId, String textMsg) {
		IMMessage message = MessageBuilder.createTipMessage(userId, SessionTypeEnum.P2P);
		message.setContent(textMsg);
		// 第二个参数表示发送失败后重发，false为不重发
		NIMClient.getService(MsgService.class).sendMessage(message, false);
	}


	/**
	 * 测试接口
	 * 发起p2p聊天窗
	 *
	 * @param userId 对方id
	 */
	@ReactMethod
	public void toP2PChat(String userId) {
		try {
			SessionHelper.startP2PSession(getCurrentActivity(), userId);
		} catch (Exception e) {
			System.out.println("发起p2p聊天失败: " + e.getMessage());
			e.printStackTrace();
		}
	}

	/**
	 * 测试接口
	 * 跳转到指定页
	 *
	 * @param activityClassName
	 */
	@ReactMethod
	public void toActivity(String activityClassName) {
		try {
			Activity currentActivity = getCurrentActivity();

			if (null != currentActivity) {
				Class clazz = Class.forName(activityClassName);
				Intent intent = new Intent(currentActivity, clazz);
				currentActivity.startActivity(intent);
			}
		} catch (Exception e) {
			Toast.makeText(new MainActivity(), "跳转失败: " + e.getMessage(), Toast.LENGTH_SHORT).show();
		}
	}

	/**
	 * 测试接口
	 * 测试开启聊天界面
	 */
	@ReactMethod
	public void toP2PMessageActivity(String account) {
		// 初始化消息提醒配置
		initNotificationConfig();

		// 初始化消息提醒
		NIMClient.toggleNotification(UserPreferences.getNoticeContentToggle());
		NimUIKit.startChatting(getCurrentActivity(), account, SessionTypeEnum.P2P, new DefalutP2PSessionCustomization(), null);
	}

	/**
	 * 开启聊天界面，群组聊天和个人聊天都使用这个
	 * @param sessionType 聊天类型，分为P2P和TEAM
	 * @param contactId 联系人id或者叫做群组id
	 */
	@ReactMethod
	public void toChatActivity(String sessionType,String contactId){
		switch (sessionType) {
			case "P2P":
				SessionHelper.startP2PSession(getCurrentActivity(), contactId);
				break;
			case "TEAM":
				SessionHelper.startTeamSession(getCurrentActivity(), contactId);
				break;
			default:
				break;
		}
	}

	/**
	 * 获取最近联系人数据
	 */
	@ReactMethod
	public void requestRecentContacts(final String arg1,final Callback sCallback) {

		NIMClient.getService(MsgService.class).queryRecentContacts().setCallback(new RequestCallbackWrapper<List<RecentContact>>() {
			@Override
			public void onResult(int code, List<RecentContact> recents, Throwable throwable) {
				if (code != ResponseCode.RES_SUCCESS || recents == null) {
					return;
				}

				ArrayList<RecentContactsItemBean> list = new ArrayList<>();
				WritableNativeArray array = new WritableNativeArray();
				for (RecentContact loadedRecent : recents) {
					RecentContactsItemBean itemBean = new RecentContactsItemBean();
					WritableNativeMap map = new WritableNativeMap();
					if (loadedRecent.getSessionType() == SessionTypeEnum.Team) {
//						updateOfflineContactAited(loadedRecent);
					}
					itemBean.setContactId(loadedRecent.getContactId());
					map.putString("contactId",loadedRecent.getContactId());

					itemBean.setContent(loadedRecent.getContent());
					map.putString("content",loadedRecent.getContent());

					itemBean.setFromAccount(loadedRecent.getFromAccount());
					map.putString("fromAccount",loadedRecent.getFromAccount());

					itemBean.setFromNick(loadedRecent.getFromNick());
					map.putString("fromNick",loadedRecent.getFromNick());

					itemBean.setMsgStatus(loadedRecent.getMsgStatus());
					map.putString("msgStatus",loadedRecent.getMsgStatus().toString());

					itemBean.setMsgType(loadedRecent.getMsgType());
					map.putString("msgType",loadedRecent.getMsgType().toString());

					itemBean.setRecentMessageId(loadedRecent.getRecentMessageId());
					map.putString("recentMessageId",loadedRecent.getRecentMessageId());

					itemBean.setSessionType(loadedRecent.getSessionType());
					map.putString("sessionType",loadedRecent.getSessionType().toString());

					itemBean.setTag(loadedRecent.getTag());
					map.putDouble("tag",loadedRecent.getTag());

					itemBean.setTime(loadedRecent.getTime());
					map.putDouble("time",loadedRecent.getTime());

					itemBean.setUnreadCount(loadedRecent.getUnreadCount());
					map.putInt("unreadCount",loadedRecent.getUnreadCount());

					//以下是按照React Native补充的字段
					String formattedTime;
					SimpleDateFormat sdf = new SimpleDateFormat("MM/dd HH:mm");
					long lt = new Long(loadedRecent.getTime());
					Date d = new Date(lt);
					formattedTime = sdf.format(d);
					itemBean.setCreateTime(loadedRecent.getTime());//对话时间标志
					map.putString("createTime",formattedTime);

					itemBean.setNoticeContent(loadedRecent.getContent());//最后一条对话内容
					map.putString("noticeContent",loadedRecent.getContent());


					NimUserInfo user = NIMClient.getService(UserService.class).getUserInfo(loadedRecent.getContactId());
					if(user == null){
						map.putString("senderName","");
					}else{
						itemBean.setSenderName(user.getName());
						map.putString("senderName",user.getName());
					}

					itemBean.setIsHasRead(loadedRecent.getUnreadCount() == 1 ? false : true);
					map.putBoolean("isHasRead",loadedRecent.getUnreadCount() == 1 ? false : true);

					LogUtils.d("login", "onResult: 获取到的最近联系人数据" + JSON.toJSON(itemBean));
					list.add(itemBean);
					array.pushMap(map);
				}

				LogUtils.d(TAG, "onResult:获取到的最近联系人列表处理完毕的结果"+JSON.toJSON(list));
//				promise.resolve(array);
				sCallback.invoke(array);
			}
		});
	}
	/**
	 * 获取JPush的registerID，用于服务端推送消息
	 */
	@ReactMethod
	public void getJPushRegisterID(final Promise promise){
		String rid = JPushInterface.getRegistrationID(getReactApplicationContext());
		if (!rid.isEmpty()) {
			promise.resolve(rid);
		} else {
			promise.reject("获取JPush注册信息失败");
		}
	}
	@ReactMethod
	public void getObject(final String key,final Callback callback){
		if(key.equals("registerId")){
			String rid = JPushInterface.getRegistrationID(getReactApplicationContext());
			callback.invoke(rid);
		}

//		if (!rid.isEmpty()) {
//
//		} else {
//			callback.invoke("获取JPush注册信息失败");
//		}
	}
	@ReactMethod
	public void setObject(final String key,final String val){

	}
	/**
	 * 添加好友 直接打开聊天界面 接口名称需要更换
	 * @param account 要添加的用户账户
	 */
	@ReactMethod
	public void ChatWith(final String account, final Callback cb) {
		toChatActivity("P2P", account);
	}
//		if (NIMClient.getService(FriendService.class).isMyFriend(account)) {{//检查将要添加的账户是否已是好友
//			LogUtils.d(TAG, "doAddFriend: 账户："+account+"已存在于好友列表中，不需要添加");
//			toChatActivity("P2P", account);//已是好友的直接打开对话
//			return;
//		}}
//
//		if (!NetworkUtil.isNetAvailable(getReactApplicationContext())) {
//			Toast.makeText(getReactApplicationContext(), R.string.network_is_not_available, Toast.LENGTH_SHORT).show();
//			return;
//		}
//		if (!TextUtils.isEmpty(account) && account.equals(DemoCache.getAccount())) {
//			Toast.makeText(getReactApplicationContext(), "不能加自己为好友", Toast.LENGTH_SHORT).show();
//			return;
//		}
//		final VerifyType verifyType = addDirectly ? VerifyType.DIRECT_ADD : VerifyType.VERIFY_REQUEST;
//		DialogMaker.showProgressDialog(getCurrentActivity(), "", true);
//		NIMClient.getService(FriendService.class).addFriend(new AddFriendData(account, verifyType, msg))
//				.setCallback(new RequestCallback<Void>() {
//					@Override
//					public void onSuccess(Void param) {
//						DialogMaker.dismissProgressDialog();
//						if (VerifyType.DIRECT_ADD == verifyType) {
//							Toast.makeText(getReactApplicationContext(), "添加好友成功", Toast.LENGTH_SHORT).show();
//							toChatActivity("P2P", account);//好友添加完毕后直接打开聊天界面
//						} else {
//							Toast.makeText(getReactApplicationContext(), "添加好友请求发送成功", Toast.LENGTH_SHORT).show();
//						}
//					}
//
//					@Override
//					public void onFailed(int code) {
//						DialogMaker.dismissProgressDialog();
//						if (code == 408) {
//							Toast.makeText(getReactApplicationContext(), R.string.network_is_not_available, Toast
//									.LENGTH_SHORT).show();
//						} else if ( code == 404 ) {
//						    Toast.makeText(getReactApplicationContext(),"开启对话失败，对方未注册云信账号",Toast.LENGTH_SHORT).show();
//						}else {
//							Toast.makeText(getReactApplicationContext(), "on failed:" + code, Toast
//									.LENGTH_SHORT).show();
//						}
//					}
//
//					@Override
//					public void onException(Throwable exception) {
//						DialogMaker.dismissProgressDialog();
//					}
//				});
//
//		Log.i(TAG, "onAddFriendByVerify");
//	}
}

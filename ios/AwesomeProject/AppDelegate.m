/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "AFNetworking.h"



#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif


@implementation AppDelegate

static NSString *appKey = @"143b05fcc438bf6ff3f027a1";     //填写appkey
static NSString *channel = nil;    //填写channel   一般为nil
static BOOL isProduction = true;  //填写isProdurion  平时测试时为false ，生产时填写true

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  //  [IQKeyboardManager sharedManager].enable = YES;
  
  [[NIMSDKConfig sharedConfig] setShouldSyncUnreadCount:YES];
  [[NIMSDK sharedSDK] registerWithAppID:@"1a88926e4245ddf4440a0c8923e2ede5"
   //测试33 f2f96eba1bacbb80bfcf2a64fb714948
   //正式 1a88926e4245ddf4440a0c8923e2ede5
                                cerName:nil];
  [[NIMSDK sharedSDK].conversationManager addDelegate:self];
  NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
  NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
  NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
  if ([localUserId length] && [localToken length]){
    [[[NIMSDK sharedSDK] loginManager] autoLogin:localUserId
                                           token:localToken];
  }

  if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
    //可以添加自定义categories
    [JPUSHService registerForRemoteNotificationTypes:(UIUserNotificationTypeBadge |
                                                      UIUserNotificationTypeSound |
                                                      UIUserNotificationTypeAlert)
                                          categories:nil];
  } else {
    //iOS 8以前 categories 必须为nil
    [JPUSHService registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge |
                                                      UIRemoteNotificationTypeSound |
                                                      UIRemoteNotificationTypeAlert)
                                          categories:nil];
  }
  
  if ([[UIApplication sharedApplication] respondsToSelector:@selector(registerUserNotificationSettings:)]) {
    UIUserNotificationType type =  UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound;
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:type
                                                                             categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    // 通知重复提示的单位，可以是天、周、月
//    notification.repeatInterval = NSCalendarUnitDay;
  } else {
    // 通知重复提示的单位，可以是天、周、月
//    notification.repeatInterval = NSDayCalendarUnit;
  }
  
  [JPUSHService setupWithOption:launchOptions appKey:appKey
                        channel:channel apsForProduction:isProduction];
  NSURL *jsCodeLocation;
//  [self loadOnlineProperty];
//  NSString *iHasNew = [[NSUserDefaults standardUserDefaults]objectForKey:@"IsHasNewMessage"];
//  if(iHasNew){
//    
//  }else{
//    [[NSUserDefaults standardUserDefaults]setObject:@"1" forKey:@"IsHasNewMessage"];//消息中心是否具有新消息
//
//  }
//  [self getJSBundleLocation:launchOptions];
  
  //  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
    jsCodeLocation = [NSURL URLWithString:[[NSBundle mainBundle] pathForResource:@"main_localrelease" ofType:@"jsbundle"]];
  
  //192.168.253.132
//     jsCodeLocation = [NSURL URLWithString:@"http://192.168.253.162:8081/index.ios.bundle?platform=ios"];
//    jsCodeLocation = [NSURL URLWithString:@"http://192.168.253.119:8081/index.ios.bundle?platform=ios"];
//    jsCodeLocation = [NSURL URLWithString:@"http://www.yifeiwang.com:8989/index.ios.bundle?platform=ios"];
//  jsCodeLocation = [NSURL URLWithString:@"http://192.168.253.132:8081/index.ios.bundle?platform=ios"];
  //    jsCodeLocation = [NSURL URLWithString:@"http://192.168.252.33:8989/index.ios.bundle?platform=ios"];
  
    self.rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                        moduleName:@"AwesomeProject"
                                                 initialProperties:nil
                                                     launchOptions:launchOptions];
    self.rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    SomeViewController *rootViewController = [SomeViewController new];
  
    //  TestViewController *testVC = [TestViewController new];
  
  
    rootViewController.view = self.rootView;
    //  self.window.rootViewController = rootViewController;
    self.nav = [[UINavigationController alloc]initWithRootViewController:rootViewController];
    self.window.rootViewController = self.nav;
    self.nav.navigationBarHidden = YES;
  
    [self.window makeKeyAndVisible];
  [[UITextField appearance] setTintColor:[UIColor whiteColor]];
  
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  
  [defaultCenter addObserver:self selector:@selector(jpushNetworkDidLogin:) name:kJPFNetworkDidLoginNotification object:nil];
  [defaultCenter addObserver:self selector:@selector(getNewMessage:) name:@"NEWMESSAGE" object:nil];
  
  
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;//进入应用后清除角标
  
  return YES;
}
-(void)getNewMessage:(NIMMessage*)message{
  RNIOSExportJsToReact(@"");

}
-(void)loadOnlineProperty{
  NSString *url = @"http://www.yifeiwang.com/swp/imService/getIMAppKey";
  AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
  [manager GET:url parameters:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject){
    NSLog(@"JSON: %@", responseObject);
    if([responseObject[@"status"] integerValue] == 1 ){
      if(responseObject[@"data"][@"appKey"]&&responseObject[@"data"][@"appKey"]!=nil && ![responseObject[@"data"][@"appKey"] isKindOfClass:[NSNull class]]){
        [[NIMSDK sharedSDK] registerWithAppID:responseObject[@"data"][@"appKey"] cerName:nil];
        
      }else{
        NSLog(@"Get AppKey From Server Error!");
      }
    }else{
      NSLog(@"Error: %@\n%@", responseObject[@"sqlInfoList"],responseObject[@"infoList"]);
    }
  } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
    NSLog(@"Error: %@", error);
  }];
}
-(void)getJSBundleLocation:(NSDictionary *)launchOptions{
  NSURLSession *session = [NSURLSession sharedSession];
  NSURL *url = [NSURL URLWithString:@"http://192.168.253.221:8080/swp/upload/file.zip"];
  NSURLSessionDownloadTask *task = [session downloadTaskWithURL:url completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
    NSLog(@"%@",location);
    
    NSString *bundleJSPath = [@"/yfw_package/" stringByAppendingString:@""];//jsBundle
    NSString *zipPath = [@"/yfw_package/" stringByAppendingString:@"tmp.zip"];
    NSString *fullPath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:bundleJSPath];
    NSString *fullZipPath =  [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:zipPath];
    
    [[NSFileManager defaultManager] moveItemAtURL:location toURL:[NSURL fileURLWithPath:fullZipPath] error:nil];
    
    [SSZipArchive unzipFileAtPath:fullZipPath toDestination: fullPath];
    
    
    NSLog(@"%@",fullPath);
    
    //
    NSURL *fullJSBundlePath = [NSURL fileURLWithPath:[fullPath stringByAppendingString:@"/JSBundle"]];
//    fullJSBundlePath =  [NSURL URLWithString:@"http://192.168.253.132:8081/index.ios.bundle?platform=ios"];
    
    dispatch_sync(dispatch_get_main_queue(), ^{
      
      RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:fullJSBundlePath
                                                          moduleName:@"AwesomeProject"
                                                   initialProperties:nil
                                                       launchOptions:launchOptions];
      rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
      
      self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
      SomeViewController *rootViewController = [SomeViewController new];
      
      //  TestViewController *testVC = [TestViewController new];
      
      
      rootViewController.view = rootView;
      //  self.window.rootViewController = rootViewController;
      self.nav = [[UINavigationController alloc]initWithRootViewController:rootViewController];
      self.window.rootViewController = self.nav;
      self.nav.navigationBarHidden = YES;
      [self.window makeKeyAndVisible];
      
      
    });
    
    
  }];
  [task resume];
  
  
  
  
  
}
//要获得registeID,可以在这里获取啊
- (void)jpushNetworkDidLogin:(NSNotification *)notification {
  
  NSLog(@"已登录");
  if ([JPUSHService registrationID]) {
    
    //下面是我拿到registeID,发送给服务器的代码，可以根据你需求来处理
    NSString *registerid = [JPUSHService registrationID];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    
    if (registerid) {
      [defaults setObject:registerid forKey:@"registerId"];
    }else{
      
    }
    
    NSLog(@"*******get RegistrationID = %@ ",[JPUSHService registrationID]);
  }
}
- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  //  NSLog(@"%@",deviceToken);
  [JPUSHService registerDeviceToken:deviceToken];
}
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  // 取得 APNs 标准信息内容
  NSLog(@"userInfo:%@",userInfo);
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}
//iOS 7 Remote Notification
- (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)   (UIBackgroundFetchResult))completionHandler {
  
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
}
// iOS 10 Support
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  // Required
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
  }
  completionHandler(UNNotificationPresentationOptionAlert); // 需要执行这个方法，选择是否提醒用户，有Badge、Sound、Alert三种类型可以选择设置
}
// iOS 10 需要添加如下代码
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler: (void (^)())completionHandler {
  // Required
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  [[NSNotificationCenter defaultCenter] postNotificationName:kJPFDidReceiveRemoteNotification object:userInfo];
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    [JPUSHService handleRemoteNotification:userInfo];
  }
  else {
    // 本地通知
//    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;

  }
  completionHandler();  // 系统要求执行这个方法
}
/*
 应用程序在进入前台,或者在前台的时候都会执行该方法
 */
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  // 必须要监听--应用程序在后台的时候进行的跳转
  if (application.applicationState == UIApplicationStateInactive) {
  
  }
}
- (void)applicationDidEnterBackground:(UIApplication *)application {
  NSInteger count = [[[NIMSDK sharedSDK] conversationManager] allUnreadCount];
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:count];
}
- (void)onRecvMessages:(NSArray *)messages{
  
}
- (void)didUpdateRecentSession:(NIMRecentSession *)recentSession
              totalUnreadCount:(NSInteger)totalUnreadCount{
  [self readSessionMessage:recentSession];
}
- (void)didAddRecentSession:(NIMRecentSession *)recentSession
           totalUnreadCount:(NSInteger)totalUnreadCount{
  [self readSessionMessage:recentSession];
}
- (void)readSessionMessage:(NIMRecentSession *)recentSession{
  _rootView.appProperties = @{@"IsHasNewMessage" :@(!_rootView.appProperties[@"IsHasNewMessage"])};
  NSString *text = [self messageContent:recentSession.lastMessage];
  [self sendLocalNotice:text];
  NSLog(@"readSessionMessage:%@",text);
  
  [[NSNotificationCenter defaultCenter]postNotificationName:@"NEWMESSAGE" object:recentSession.lastMessage];
  [[NSUserDefaults standardUserDefaults]setObject:@"1" forKey:@"IsHasNewMessage"];//消息中心是否具有新消息
}

- (void)sendLocalNotice:(NSString *)text{
  // 0.取消所有的本地通知
  [[UIApplication sharedApplication] cancelAllLocalNotifications];
  // 1.创建本地通知
  UILocalNotification *localNote = [[UILocalNotification alloc] init];
  
  // 2.设置本地通知的内容
  // 2.1.设置通知发出的时间
  localNote.fireDate = [NSDate dateWithTimeIntervalSinceNow:3.0];
  // 2.2.设置通知的内容
  localNote.alertBody = text;
  // 2.3.设置滑块的文字（锁屏状态下：滑动来“解锁”）
  localNote.alertAction = @"打开应用";
  // 2.4.决定alertAction是否生效
  localNote.hasAction = NO;
  // 2.5.设置点击通知的启动图片
  //    localNote.alertLaunchImage = @"";
  // 2.6.设置alertTitle
  localNote.alertTitle = @"来自云信的消息";
  // 2.7.设置有通知时的音效
  localNote.soundName = UILocalNotificationDefaultSoundName;
  // 2.8.设置应用程序图标右上角的数字
  localNote.applicationIconBadgeNumber = 0;
  // 2.9.设置额外信息
  localNote.userInfo = @{@"type" : @1};
  
  // 3.调用通知
  [[UIApplication sharedApplication] scheduleLocalNotification:localNote];
  
}

- (NSString *)messageContent:(NIMMessage*)lastMessage{
  NSString *text = @"";
  switch (lastMessage.messageType) {
    case NIMMessageTypeText:
      text = lastMessage.text;
      break;
    case NIMMessageTypeAudio:
      text = @"[语音]";
      break;
    case NIMMessageTypeImage:
      text = @"[图片]";
      break;
    case NIMMessageTypeVideo:
      text = @"[视频]";
      break;
    case NIMMessageTypeLocation:
      text = @"[位置]";
      break;
    case NIMMessageTypeNotification:{
      return text = @"[通知]";
      break;
    }
    case NIMMessageTypeFile:
      text = @"[文件]";
      break;
    case NIMMessageTypeTip:
      text = lastMessage.text;
      break;
    default:
      text = @"[未知消息]";
  }
  NSString *nickName = [NIMKitUtil showNick:lastMessage.from inSession:lastMessage.session];
  return nickName.length ? [nickName stringByAppendingFormat:@" : %@",text] : @"";
//  if (lastMessage.session.sessionType == NIMSessionTypeP2P || lastMessage.messageType == NIMMessageTypeTip) {
//    return text;
//  }else{
//    NSString *nickName = [NIMKitUtil showNick:lastMessage.from inSession:lastMessage.session];
//    return nickName.length ? [nickName stringByAppendingFormat:@" : %@",text] : @"";
//  }
}

@end

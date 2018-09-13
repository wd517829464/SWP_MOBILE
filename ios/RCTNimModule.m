#import "RCTNimModule.h"
#import "TestViewController.h"
#import "AppDelegate.h"
#import "NIMKitUtil.h"


@implementation RCTNimModule

-(NSUserDefaults*)userDefaultsForSuiteName:(NSString *)suiteName {
  //    if (suiteName && ![suiteName isEqualToString:@""]) {
  //        return [[NSUserDefaults alloc] initWithSuiteName:suiteName];
  //    }
  return [NSUserDefaults standardUserDefaults];//返回一个默认的UserDefaults
}
-(NSArray<NIMUser *> *)myOwnFriends{
  NSMutableArray *friends = [[NSMutableArray alloc]init];
  self.allUnreadMessage = [[NSMutableArray alloc]init];
  
  for (NIMUser *user in [NIMSDK sharedSDK].userManager.myFriends) {
    //    NSLog(@"friends List :%@",user);
    [friends addObject:user.userId];
    
  }
  //用户信息编辑测试
  //  __weak typeof(self) wself = self;
  //  [[NIMSDK sharedSDK].userManager updateMyUserInfo:@{@(NIMUserInfoUpdateTagAvatar) : @"http://121.40.113.7/swp/main/img/logo.png",@(NIMUserInfoUpdateTagNick):@"岳麓"} completion:^(NSError *error) {
  //    if (!error) {
  //      NSLog(@"update userinfo success!");
  //
  //    }else{
  //
  //    }
  //  }];
  
  return friends;
}

-(void)openChatView:(NSString *)accId{
  NIMSession *session = [NIMSession session:accId type:NIMSessionTypeP2P];
  //初始化SessionViewCongtroller
  NIMSessionViewController *vc = [[NIMSessionViewController alloc]
                                  initWithSession:session];
  //实现跳转
  AppDelegate *app = (AppDelegate *)[[UIApplication sharedApplication] delegate];
  
  app.nav.navigationBarHidden = NO;
  
  [app.nav pushViewController:vc animated:YES];
}
-(void)searchMessageHistory:(RCTResponseSenderBlock)cb{
  NSArray *mf = [self myOwnFriends];
  if(mf&&[mf count]>0){
    __block int i = 0;
    for (NSString *uId in mf) {
      NIMSession *session = [NIMSession session:uId type:NIMSessionTypeP2P];
      NIMHistoryMessageSearchOption *option = [[NIMHistoryMessageSearchOption alloc] init];
      option.sync = YES;
      option.limit = 100;
      option.startTime =[[NSDate date] timeIntervalSince1970] - 3600 * 24 * 10;
      [[NIMSDK sharedSDK].conversationManager fetchMessageHistory:session option:option result:^(NSError * _Nullable error, NSArray<NIMMessage *> * _Nullable messages) {
        //获取到消息记录后，再拉取对方用户信息，填充
        //      NSLog(@"uid : %@,\n",uId);
        NIMMessage *tmp = messages.firstObject;
        i++;
        [self processMessageInfo:tmp.session.sessionId message:tmp friendList:mf cb:cb index:i];
        
      }];
      
      
    }
    
    
  }else{
    [[NSUserDefaults standardUserDefaults] setObject:[NSArray array] forKey:@"unReadMessages"];
    
    NSArray *arr = [NSArray array];
    cb(@[arr]);
  }
  
}
-(void)processMessageInfo:(NSString *)uId message:(NIMMessage *)tmp friendList:(NSArray *)mf cb:(RCTResponseSenderBlock)cb index:(int)idx{
  NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
  NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
  //  NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
  
  NIMUser *friend = [[NIMSDK sharedSDK].userManager userInfo:uId];
  
  NSString *messageId = [NSString stringWithFormat:@"%@",(tmp.messageId?tmp.messageId:@"1")];
  NSString *messageType = [NSString stringWithFormat:@"%ld",(long)tmp.messageType];
  NSString *text = (tmp.text?tmp.text:@"");
  if([messageType isEqualToString:@"2"]){
    text = @"[语音]";
  }
  
  NSString *from = tmp.from;
  NSString *sendTime = [NSString stringWithFormat:@"%f",tmp.timestamp];;
  NSString *isRemoteRead = [NSString stringWithFormat:@"%@",((tmp.isRemoteRead||[localUserId isEqualToString:from])?@"1":@"0")];;
  NSString *senderName = [NSString stringWithFormat:@"%@",(friend.userInfo.nickName?friend.userInfo.nickName:@"")];;
  //  NSLog(@"localUserId : %@,%@ ==== %@,sessionid:%@",localUserId,from,isRemoteRead,uId);
  NSDictionary *tmpDict = [NSDictionary dictionaryWithObjectsAndKeys:
                           messageId, @"messageId",
                           messageType, @"messageType",
                           text, @"text",
                           from, @"from",
                           sendTime,@"sendTime",
                           isRemoteRead,@"isRemoteRead",uId,@"toId",senderName,@"senderName", nil];
  [self.allUnreadMessage addObject:tmpDict];
  NSLog(@"senderName:%@",senderName);
  if(idx == [mf count]){
    [[NSUserDefaults standardUserDefaults] setObject:self.allUnreadMessage forKey:@"unReadMessages"];
    cb(@[self.allUnreadMessage]);
  }
  
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
  if (lastMessage.session.sessionType == NIMSessionTypeP2P || lastMessage.messageType == NIMMessageTypeTip) {
    return text;
  }else{
    NSString *nickName = [NIMKitUtil showNick:lastMessage.from inSession:lastMessage.session];
    return nickName.length ? [nickName stringByAppendingFormat:@" : %@",text] : @"";
  }
}

RCT_EXPORT_MODULE()

// RCT_EXPORT_METHOD(getObject:(NSString *)key suiteName:(NSString *)suiteName callback:(RCTResponseSenderBlock)cb) {
//   NSUserDefaults *userDefaults = [self userDefaultsForSuiteName:suiteName];
//   NSString *result = [userDefaults stringForKey:key];
//   NSLog(@"%@--------------------------%@",suiteName,result);
//   if (result) {
//     cb(@[result]);
//   } else {
//     cb(@[@YES]);
//   }
// }

RCT_EXPORT_METHOD(setObject:(NSString *)key value:(NSString *)value) {
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  [userDefaults setObject:value forKey:key];
  [userDefaults synchronize];
  //  cb(@[@"Save success"]);
}

RCT_EXPORT_METHOD(ChatWith:(NSString *)accId callback:(RCTResponseSenderBlock)cb){
  NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
  NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
  NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
  if(accId == nil || [accId isEqualToString:@""]){
    return;
  }
  
  
  [[[NIMSDK sharedSDK] loginManager] login:localUserId
                                     token:localToken
                                completion:^(NSError *error) {
                                  if (error == nil){
                                      [self openChatView:accId];
                                  }}];
}
RCT_EXPORT_METHOD(requestRecentContacts:(NSString *)tag callback:(RCTResponseSenderBlock)cb){
  NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
  NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
  NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
  NSMutableArray *recentContactList = [NSMutableArray array];
  [[[NIMSDK sharedSDK] loginManager] login:localUserId
                                     token:localToken
                                completion:^(NSError *error) {
                                  if (error == nil){
                                    NSArray *aRS = [NIMSDK sharedSDK].conversationManager.allRecentSessions;
                                    for(NIMRecentSession *tmpSession in aRS){
                                      NSMutableDictionary *tmpDict = [NSMutableDictionary dictionary];
                                      [tmpDict setObject:[self messageContent:tmpSession.lastMessage] forKey:@"noticeContent"];
                                      [tmpDict setObject:(tmpSession.unreadCount>0)?(@NO):(@YES) forKey:@"isHasRead"];
                                      [tmpDict setObject:[NIMKitUtil showNick:tmpSession.session.sessionId
                                                                    inSession:tmpSession.lastMessage.session] forKey:@"senderName"];
                                      [tmpDict setObject:tmpSession.session.sessionId forKey:@"contactId"];
                                      [tmpDict setObject:[NIMKitUtil showTime:tmpSession.lastMessage.timestamp showDetail:NO] forKey:@"createTime"];
//                                      NSLog(@"%@",tmpDict);
                                      [recentContactList addObject:tmpDict];
                                    }
                                    cb(@[recentContactList]);
                                  }else{
                                    cb(@[[NSArray array]]);
                                  }
                                }];
}

RCT_EXPORT_METHOD(login:(NSString *)userId token:(NSString *)token callback:(RCTResponseSenderBlock)cb errorCallback:(RCTResponseSenderBlock)ecb) {
  NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
  NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
  NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
  
  [[[NIMSDK sharedSDK] loginManager] login:localUserId
                                     token:localToken
                                completion:^(NSError *error) {
                                  if(error != nil){
                                    cb(@[@"Success"]);
                                  }else{
                                    cb(@[@"云信登录失败!"]);
                                  }
                                }];}
RCT_EXPORT_METHOD(getObject:(NSString *)key callback:(RCTResponseSenderBlock)cb) {
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  NSObject *result =  [userDefaults objectForKey:key];// [userDefaults stringForKey:key];
  
  if (result) {
    cb(@[result]);
  } else {
    cb(@[@NO]);
  }
  
}

RCT_EXPORT_METHOD(getHistoryMessages:(NSString *)key callback:(RCTResponseSenderBlock)cb) {
  NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
  NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
  NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
  
  [[[NIMSDK sharedSDK] loginManager] login:localUserId
                                     token:localToken
                                completion:^(NSError *error) {
                                  if (error == nil){
                                    [self searchMessageHistory:cb];
                                    
                                    
                                  }else{
                                    NSLog(@"%@",error);
                                    cb(@[@[]]);
                                  }
                                }];
}

RCT_EXPORT_METHOD(showChatView:(NSDictionary *)sessionInfo) {
  NSLog(@"showChatView:%@",sessionInfo);
  if(sessionInfo && sessionInfo[@"toId"] && ![sessionInfo[@"toId"] isEqualToString: @""]){
    
  }else{
    return;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
    
    NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
    NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
    NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
    //    localUserId = @"18120046886";
    //    localToken  = @"944e69274750815e74c733f9e5e2280e";
    [[[NIMSDK sharedSDK] loginManager] login:localUserId
                                       token:localToken
                                  completion:^(NSError *error) {
                                    if(sessionInfo&&sessionInfo[@"toId"]){
                                      NIMSession *session = [NIMSession session:sessionInfo[@"toId"] type:NIMSessionTypeP2P];
                                      //初始化SessionViewCongtroller
                                      NIMSessionViewController *vc = [[NIMSessionViewController alloc]
                                                                      initWithSession:session];
                                      //实现跳转
                                      AppDelegate *app = (AppDelegate *)[[UIApplication sharedApplication] delegate];
                                      
                                      app.nav.navigationBarHidden = NO;
                                      
                                      [app.nav pushViewController:vc animated:YES];
                                      
                                    }else{
                                      UIAlertView *uav = [[UIAlertView alloc]initWithTitle:@"提示" message:@"用户会话已过期" delegate:nil cancelButtonTitle:@"忽略" otherButtonTitles:nil, nil];
                                      [uav show];
                                    }
                                  }];
  });
  
}

RCT_EXPORT_METHOD(pushView:(NSString *)key callback:(RCTResponseSenderBlock)cb) {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    NSUserDefaults *defaluts = [NSUserDefaults standardUserDefaults];
    NSString *localUserId = [defaluts objectForKey:@"yunxUserId"];
    NSString *localToken  = [defaluts objectForKey:@"yunxToken"];
    //    localUserId = @"18120046886";
    //    localToken  = @"944e69274750815e74c733f9e5e2280e";
    [[[NIMSDK sharedSDK] loginManager] login:localUserId
                                       token:localToken
                                  completion:^(NSError *error) {
                                    if (error == nil){
                                      [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDefault];
                                      //[self addMyFriend:@"18120046886"];
                                      //NSArray *t = [self myOwnFriends];
                                      //zl  展示会话之前 先从云端拉取消息记录 并同步到本地数据库
                                      //构建会话，这里sessionID是写死的，有需要的可以自行修改
                                      //option.fromIds = t; 只有搜索本地记录是才能有这个选项
                                      [self searchMessageHistory:cb];
                                      
                                      NIMSession *session = [NIMSession session:@"15862430345" type:NIMSessionTypeP2P];
                                      //初始化SessionViewCongtroller
                                      NIMSessionViewController *vc = [[NIMSessionViewController alloc]
                                                                      initWithSession:session];
                                      //实现跳转
                                      AppDelegate *app = (AppDelegate *)[[UIApplication sharedApplication] delegate];
                                      
                                      app.nav.navigationBarHidden = NO;
                                      
                                      [app.nav pushViewController:vc animated:YES];
                                      
                                    }else{
                                      NSLog(@"%@",error);
                                    }
                                  }];
    
  });
}

RCT_EXPORT_METHOD(getUserFriendsList:(NSString *)accId callback:(RCTResponseSenderBlock)cb) {
  
  NSString *result = @"";
  
  
  if (result) {
    cb(@[result]);
  } else {
    cb(@[@YES]);
  }
}

RCT_EXPORT_METHOD(empty:(NSString *)suiteName callback:(RCTResponseSenderBlock)cb) {
  
  //  NSArray *defaultSetting = @[@"RCTDevMenu", @"ApplePasscodeKeyboards", @"AddingEmojiKeybordHandled",
  //                              @"MSVLoggingMasterSwitchEnabledKey", @"AppleITunesStoreItemKinds",
  //                              @"NSInterfaceStyle", @"AppleLanguagesDidMigrate", @"AppleLanguages",
  //                              @"NSLanguages", @"AppleKeyboardsExpanded", @"AppleKeyboards", @"AppleLocale"];
  //
  //  NSUserDefaults *userDefaults = [self userDefaultsForSuiteName:suiteName];
  //  NSDictionary *defaultsDict = [userDefaults dictionaryRepresentation];
  //  for (NSString *key in [defaultsDict allKeys]) {
  //    NSInteger index = [defaultSetting indexOfObject:key];
  //    if (index == NSNotFound) {
  //      [userDefaults removeObjectForKey:key];
  //    }
  //  }
  //
  //  cb(@[[NSNull null] ,@"Empty success"]);
}


@end

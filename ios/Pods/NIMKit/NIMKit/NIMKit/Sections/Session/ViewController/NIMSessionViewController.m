//
//  NIMSessionViewController.m
//  NIMKit
//
//  Created by NetEase.
//  Copyright (c) 2015年 NetEase. All rights reserved.
//

#import "NIMSessionConfigurateProtocol.h"
#import "NIMInputTextView.h"
#import "NIMKit.h"
#import "NIMMessageCellProtocol.h"
#import "NIMMessageModel.h"
#import "NIMKitUtil.h"
#import "NIMCustomLeftBarView.h"
#import "NIMBadgeView.h"
#import "UITableView+NIMScrollToBottom.h"
#import "NIMMessageMaker.h"
#import "NIMKitUIConfig.h"
#import "UIView+NIM.h"
#import "NIMSessionConfigurator.h"
#import "NIMKitInfoFetchOption.h"

//0420
#import "NIMContactSelectConfig.h"
#import "NIMContactSelectViewController.h"
#import "UIView+Toast.h"
#import "NTESGalleryViewController.h"
#import "NIMLocationViewController.h"
#import "NIMKitLocationPoint.h"
//0823

@interface NIMSessionViewController ()<NIMMediaManagerDelgate,NIMInputDelegate>

@property (nonatomic,readwrite) NIMMessage *messageForMenu;

@property (nonatomic,strong)    NSIndexPath *lastVisibleIndexPathBeforeRotation;

@property (nonatomic,strong)  NIMSessionConfigurator *configurator;

@property (nonatomic,weak)    id<NIMSessionInteractor> interactor;

@end

@implementation NIMSessionViewController

- (instancetype)initWithSession:(NIMSession *)session{
    self = [super initWithNibName:nil bundle:nil];
    if (self) {
        _session = session;
    }
    return self;
}

- (void)dealloc
{
    [self removeListener];

    _tableView.delegate = nil;
    _tableView.dataSource = nil;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    //导航栏
    [self setupNav];
    //消息 tableView
    [self setupTableView];
    //输入框 inputView
    [self setupInputView];
    //下拉刷新 refreshControl
    [self setupRefreshControl];
    //会话相关逻辑配置器安装
    [self setupConfigurator];
    //添加监听
    [self addListener];
    
    //进入会话时，标记所有消息已读，并发送已读回执
    [[NIMSDK sharedSDK].conversationManager markAllMessagesReadInSession:self.session];
    [self sendMessageReceipt:self.interactor.items];
    
    //更新已读位置
    [self uiCheckReceipt];    
}
- (UIStatusBarStyle)preferredStatusBarStyle {
    return UIStatusBarStyleDefault;
}
- (void)setupNav
{
    self.navigationItem.title = [self sessionTitle];
    NIMCustomLeftBarView *leftBarView = [[NIMCustomLeftBarView alloc] init];
    UIBarButtonItem *leftItem = [[UIBarButtonItem alloc] initWithCustomView:leftBarView];
    self.navigationItem.leftBarButtonItem = leftItem;
    self.navigationItem.leftItemsSupplementBackButton = YES;
    
    
}

- (void)setupTableView
{
    self.view.backgroundColor = [UIColor whiteColor];
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tableView.backgroundColor = NIMKit_UIColorFromRGB(0xe4e7ec);
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    self.tableView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    [self.view addSubview:self.tableView];
    
    
}


- (void)setupInputView
{
    CGRect inputViewRect = CGRectMake(0, 0, self.view.nim_width, [[[NIMKitUIConfig sharedConfig] globalConfig] topInputViewHeight]);
    BOOL disableInputView = NO;
    if ([self.sessionConfig respondsToSelector:@selector(disableInputView)]) {
        disableInputView = [self.sessionConfig disableInputView];
    }
    if (!disableInputView) {
        self.sessionInputView = [[NIMInputView alloc] initWithFrame:inputViewRect];
        self.sessionInputView.nim_bottom = _tableView.nim_height;
        
        [self.sessionInputView setSession:self.session];
        [self.sessionInputView setInputConfig:self.sessionConfig];
        [self.sessionInputView setInputDelegate:self];
        [self.sessionInputView setInputActionDelegate:self];
        [self.view addSubview:_sessionInputView];
        
        self.tableView.nim_height -= self.sessionInputView.nim_height;
    }
}

- (void)setupRefreshControl
{
    self.refreshControl = [[UIRefreshControl alloc] initWithFrame:CGRectMake(0, 0, 20, 20)];
    [self.tableView addSubview:_refreshControl];
    [self.refreshControl addTarget:self action:@selector(headerRereshing:) forControlEvents:UIControlEventValueChanged];
}

- (void)setupConfigurator
{
    _configurator = [[NIMSessionConfigurator alloc] init];
    [_configurator setup:self];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    //fix bug: 竖屏进入会话界面，然后右上角进入群信息，再横屏，左上角返回，横屏的会话界面显示的就是竖屏时的大小
    [self.interactor cleanCache];
    [self.tableView reloadData];
}

- (void)viewDidDisappear:(BOOL)animated{
    [super viewDidDisappear:animated];
    [self.sessionInputView endEditing:YES];
}


- (void)viewDidLayoutSubviews{
    [self changeLeftBarBadge:self.conversationManager.allUnreadCount];
    [self.interactor resetLayout];
}

- (void)headerRereshing:(id)sender
{
    __weak typeof(self) wself = self;
    [self.interactor loadMessages:^(NSArray *messages, NSError *error) {
        [wself.refreshControl endRefreshing];
        if (messages.count) {
            [wself uiCheckReceipt];
        }
    }];
}

#pragma mark - 消息收发接口
- (void)sendMessage:(NIMMessage *)message
{
    [self.interactor sendMessage:message];
    [[NSNotificationCenter defaultCenter]postNotificationName:@"NEWMESSAGE" object:message];
}


#pragma mark - Touch Event
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    [super touchesBegan:touches withEvent:event];
    [_sessionInputView endEditing:YES];
}


#pragma mark - NIMSessionConfiguratorDelegate

- (void)didFetchMessageData
{
    [self uiCheckReceipt];
    [self.tableView reloadData];
    [self.tableView nim_scrollToBottom:NO];
}

- (void)didRefreshMessageData
{
    self.navigationItem.title = [self sessionTitle];
    [self.tableView reloadData];
}

#pragma mark - 会话title
- (NSString *)sessionTitle
{
    NSString *title = @"";
    NIMSessionType type = self.session.sessionType;
    switch (type) {
        case NIMSessionTypeTeam:{
            NIMTeam *team = [[[NIMSDK sharedSDK] teamManager] teamById:self.session.sessionId];
            title = [NSString stringWithFormat:@"%@(%zd)",[team teamName],[team memberNumber]];
        }
            break;
        case NIMSessionTypeP2P:{
            title = [NIMKitUtil showNick:self.session.sessionId inSession:self.session];
        }
            break;
        default:
            break;
    }
    return title;
}

#pragma mark - NIMChatManagerDelegate

- (void)willSendMessage:(NIMMessage *)message
{
    id<NIMSessionInteractor> interactor = self.interactor;
    
    if ([message.session isEqual:self.session]) {
        if ([interactor findMessageModel:message]) {
            [interactor updateMessage:message];
        }else{
            [interactor addMessages:@[message]];
        }
    }
}

//发送结果
- (void)sendMessage:(NIMMessage *)message didCompleteWithError:(NSError *)error
{
    if ([message.session isEqual:_session]) {
        [self.interactor updateMessage:message];
    }
}

//发送进度
-(void)sendMessage:(NIMMessage *)message progress:(CGFloat)progress
{
    if ([message.session isEqual:_session]) {
        [self.interactor updateMessage:message];
    }
}

//接收消息
- (void)onRecvMessages:(NSArray *)messages
{
    NIMMessage *message = messages.firstObject;
    NIMSession *session = message.session;
    if (![session isEqual:self.session] || !messages.count){
        return;
    }
    
    [self uiAddMessages:messages];
    [self sendMessageReceipt:messages];
    
    [self.conversationManager markAllMessagesReadInSession:self.session];
    
    NSString *text = [self messageContent:messages.lastObject];
    
    [self sendLocalNotice:text];
    
    
    NSLog(@"message.text:%@",message.text);
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
    if (lastMessage.session.sessionType == NIMSessionTypeP2P || lastMessage.messageType == NIMMessageTypeTip) {
        return text;
    }else{
        NSString *nickName = [NIMKitUtil showNick:lastMessage.from inSession:lastMessage.session];
        return nickName.length ? [nickName stringByAppendingFormat:@" : %@",text] : @"";
    }
}

- (void)fetchMessageAttachment:(NIMMessage *)message progress:(CGFloat)progress
{
    if ([message.session isEqual:_session]) {
        [self.interactor updateMessage:message];
    }
}

- (void)fetchMessageAttachment:(NIMMessage *)message didCompleteWithError:(NSError *)error
{
    if ([message.session isEqual:_session]) {
        NIMMessageModel *model = [self.interactor findMessageModel:message];
        //下完缩略图之后，因为比例有变化，重新刷下宽高。
        [model calculateContent:self.tableView.frame.size.width force:YES];
        [self.interactor updateMessage:message];
    }
}

- (void)onRecvMessageReceipt:(NIMMessageReceipt *)receipt
{
    if ([receipt.session isEqual:self.session] && [self shouldHandleReceipt]) {
        [self uiCheckReceipt];
    }
}

#pragma mark - NIMConversationManagerDelegate
- (void)messagesDeletedInSession:(NIMSession *)session{
    [self.interactor resetMessages];
    [self.tableView reloadData];
}

- (void)didAddRecentSession:(NIMRecentSession *)recentSession
           totalUnreadCount:(NSInteger)totalUnreadCount{
    [self changeUnreadCount:recentSession totalUnreadCount:totalUnreadCount];
}

- (void)didUpdateRecentSession:(NIMRecentSession *)recentSession
              totalUnreadCount:(NSInteger)totalUnreadCount{
    [self changeUnreadCount:recentSession totalUnreadCount:totalUnreadCount];
}

- (void)didRemoveRecentSession:(NIMRecentSession *)recentSession
              totalUnreadCount:(NSInteger)totalUnreadCount{
    [self changeUnreadCount:recentSession totalUnreadCount:totalUnreadCount];
}


- (void)changeUnreadCount:(NIMRecentSession *)recentSession
         totalUnreadCount:(NSInteger)totalUnreadCount{
    if ([recentSession.session isEqual:self.session]) {
        return;
    }
    [self changeLeftBarBadge:totalUnreadCount];
}

#pragma mark - NIMMediaManagerDelegate
- (void)recordAudio:(NSString *)filePath didBeganWithError:(NSError *)error {
    if (!filePath || error) {
        _sessionInputView.recording = NO;
        [self onRecordFailed:error];
    }
}

- (void)recordAudio:(NSString *)filePath didCompletedWithError:(NSError *)error {
    if(!error) {
        if ([self recordFileCanBeSend:filePath]) {
            [self sendMessage:[NIMMessageMaker msgWithAudio:filePath]];
        }else{
            [self showRecordFileNotSendReason];
        }
    } else {
        [self onRecordFailed:error];
    }
    _sessionInputView.recording = NO;
}

- (void)recordAudioDidCancelled {
    _sessionInputView.recording = NO;
}

- (void)recordAudioProgress:(NSTimeInterval)currentTime {
    [_sessionInputView updateAudioRecordTime:currentTime];
}

- (void)recordAudioInterruptionBegin {
    [[NIMSDK sharedSDK].mediaManager cancelRecord];
}

#pragma mark - 录音相关接口
- (void)onRecordFailed:(NSError *)error{}

- (BOOL)recordFileCanBeSend:(NSString *)filepath
{
    return YES;
}

- (void)showRecordFileNotSendReason{}

#pragma mark - NIMInputDelegate
- (void)showInputView
{
    [self.tableView setUserInteractionEnabled:NO];
}

- (void)hideInputView
{
    [self.tableView setUserInteractionEnabled:YES];
}

- (void)inputViewSizeToHeight:(CGFloat)height showInputView:(BOOL)show
{
    [self.tableView setUserInteractionEnabled:!show];
    [self.interactor changeLayout:height];
}

#pragma mark - NIMInputActionDelegate
- (BOOL)onTapMediaItem:(NIMMediaItem *)item{
    SEL sel = item.selctor;
    BOOL handled = sel && [self respondsToSelector:sel];
    if (handled) {
        NIMKit_SuppressPerformSelectorLeakWarning([self performSelector:sel withObject:item]);
        handled = YES;
    }
    return handled;
}

- (void)onTextChanged:(id)sender{}

- (void)onSendText:(NSString *)text atUsers:(NSArray *)atUsers
{
    NIMMessage *message = [NIMMessageMaker msgWithText:text];
    if (atUsers.count) {
        NIMMessageApnsMemberOption *apnsOption = [[NIMMessageApnsMemberOption alloc] init];
        apnsOption.userIds = atUsers;
        apnsOption.forcePush = YES;
        
        NIMKitInfoFetchOption *option = [[NIMKitInfoFetchOption alloc] init];
        option.session = self.session;
        
        NSString *me = [[NIMKit sharedKit].provider infoByUser:[NIMSDK sharedSDK].loginManager.currentAccount option:option].showName;
        apnsOption.apnsContent = [NSString stringWithFormat:@"%@在群里@了你",me];
        message.apnsMemberOption = apnsOption;
    }
    [self sendMessage:message];
}

- (void)onSelectChartlet:(NSString *)chartletId
                 catalog:(NSString *)catalogId{}

- (void)onCancelRecording
{
    [[NIMSDK sharedSDK].mediaManager cancelRecord];
}

- (void)onStopRecording
{
    [[NIMSDK sharedSDK].mediaManager stopRecord];
}

- (void)onStartRecording
{
    _sessionInputView.recording = YES;
    
    NIMAudioType type = NIMAudioTypeAAC;
    if ([self.sessionConfig respondsToSelector:@selector(recordType)])
    {
        type = [self.sessionConfig recordType];
    }
    
    NSTimeInterval duration = [NIMKitUIConfig sharedConfig].globalConfig.recordMaxDuration;
    
    [[[NIMSDK sharedSDK] mediaManager] addDelegate:self];
    
    [[[NIMSDK sharedSDK] mediaManager] record:type
                                     duration:duration];
}

#pragma mark - CellActionDelegate
- (void)onTapCell:(NIMKitEvent *)event{

    BOOL handled = false;//[super onTapCell:event];
    NSString *eventName = event.eventName;
    if ([eventName isEqualToString:NIMKitEventNameTapContent])
    {
        NIMMessage *message = event.messageModel.message;
        NSDictionary *actions = [self cellActions];
        NSString *value = actions[@(message.messageType)];
        if (value) {
            SEL selector = NSSelectorFromString(value);
            if (selector && [self respondsToSelector:selector]) {
//                SuppressPerformSelectorLeakWarning([self performSelector:selector withObject:message]);
                [self performSelector:selector withObject:message];
                handled = YES;
            }
        }
    }
    
    if (!handled) {
        NSAssert(0, @"invalid event");
    }
//    return handled;

}

- (void)onRetryMessage:(NIMMessage *)message
{
    if (message.isReceivedMsg) {
        [[[NIMSDK sharedSDK] chatManager] fetchMessageAttachment:message
                                                           error:nil];
    }else{
        [[[NIMSDK sharedSDK] chatManager] resendMessage:message
                                                  error:nil];
    }
}

- (void)onLongPressCell:(NIMMessage *)message
                 inView:(UIView *)view
{
    NSArray *items = [self menusItems:message];
    if ([items count] && [self becomeFirstResponder]) {
        UIMenuController *controller = [UIMenuController sharedMenuController];
        controller.menuItems = items;
        _messageForMenu = message;
        [controller setTargetRect:view.bounds inView:view];
        [controller setMenuVisible:YES animated:YES];
        
    }
}
- (NSDictionary *)cellActions
{
    static NSDictionary *actions = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        actions = @{@(NIMMessageTypeImage) :    @"showImage:",
                    @(NIMMessageTypeVideo) :    @"showVideo:",
                    @(NIMMessageTypeLocation) : @"showLocation:",
                    @(NIMMessageTypeFile)  :    @"showFile:",
//                    @(NIMMessageTypeCustom):    @"showCustom:"
                    };
    });
    return actions;
}

#pragma mark - 配置项
- (id<NIMSessionConfig>)sessionConfig
{
    return nil;
}
- (void)onTapAvatar:(NSString *)userId{
    //牵涉的到模块太多 暂不开放
    
//    UIViewController *vc = [[NTESPersonalCardViewController alloc] initWithUserId:userId];
//    [self.navigationController pushViewController:vc animated:YES];
//    UIAlertView *uav = [[UIAlertView alloc]initWithTitle:@"提示" message:@"暂不支持用户信息修改" delegate:nil cancelButtonTitle:@"好的" otherButtonTitles:nil, nil];
//    [uav show];
    
}
#pragma mark - Cell Actions
- (void)showImage:(NIMMessage *)message
{
    NIMImageObject *object = message.messageObject;
    NTESGalleryItem *item = [[NTESGalleryItem alloc] init];
    item.thumbPath      = [object thumbPath];
    item.imageURL       = [object url];
    item.name           = [object displayName];
    NTESGalleryViewController *vc = [[NTESGalleryViewController alloc] initWithItem:item];
    [self.navigationController pushViewController:vc animated:YES];
  
    if(![[NSFileManager defaultManager] fileExistsAtPath:object.thumbPath]){
        //如果缩略图下跪了，点进看大图的时候再去下一把缩略图
        __weak typeof(self) wself = self;
        [[NIMSDK sharedSDK].resourceManager download:object.thumbUrl filepath:object.thumbPath progress:nil completion:^(NSError *error) {
            if (!error) {
                [wself uiUpdateMessage:message];
            }
        }];
    }
}

- (void)showVideo:(NIMMessage *)message
{

}
- (void)showFile:(NIMMessage *)message
{
    
}
- (void)showLocation:(NIMMessage *)message
{
    NIMLocationObject *object = message.messageObject;
    NIMKitLocationPoint *locationPoint = [[NIMKitLocationPoint alloc] initWithLocationObject:object];
    NIMLocationViewController *vc = [[NIMLocationViewController alloc] initWithLocationPoint:locationPoint];
    [self.navigationController pushViewController:vc animated:YES];
}
#pragma mark - 菜单
- (NSArray *)menusItems:(NIMMessage *)message
{
    NSMutableArray *items = [NSMutableArray array];
    
    if (message.messageType == NIMMessageTypeText) {
        [items addObject:[[UIMenuItem alloc] initWithTitle:@"复制"
                                                    action:@selector(copyText:)]];
        [items addObject:[[UIMenuItem alloc] initWithTitle:@"转发" action:@selector(forwardMessage:)]];
        [items addObject:[[UIMenuItem alloc] initWithTitle:@"撤回" action:@selector(revokeMessage:)]];

    }
    
    [items addObject:[[UIMenuItem alloc] initWithTitle:@"删除"
                                                action:@selector(deleteMsg:)]];
    
    return items;
    
}

- (NIMMessage *)messageForMenu
{
    return _messageForMenu;
}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

- (BOOL)canPerformAction:(SEL)action withSender:(id)sender
{
    NSArray *items = [[UIMenuController sharedMenuController] menuItems];
    for (UIMenuItem *item in items) {
        if (action == [item action]){
            return YES;
        }
    }
    return NO;
}


- (void)copyText:(id)sender
{
    NIMMessage *message = [self messageForMenu];
    if (message.text.length) {
        UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
        [pasteboard setString:message.text];
    }
}

- (void)deleteMsg:(id)sender
{
    NIMMessage *message    = [self messageForMenu];
    [self uiDeleteMessage:message];
    [self.conversationManager deleteMessage:message];
}

- (void)menuDidHide:(NSNotification *)notification
{
    [UIMenuController sharedMenuController].menuItems = nil;
}


#pragma mark - 操作接口
- (void)uiAddMessages:(NSArray *)messages
{
    [self.interactor addMessages:messages];
}

- (void)uiInsertMessages:(NSArray *)messages
{
    [self.interactor insertMessages:messages];
}

- (NIMMessageModel *)uiDeleteMessage:(NIMMessage *)message{
    NIMMessageModel *model = [self.interactor deleteMessage:message];
    if (model.shouldShowReadLabel)
    {
        [self uiCheckReceipt];
    }
    return model;
}

- (void)uiUpdateMessage:(NIMMessage *)message{
    [self.interactor updateMessage:message];
}

- (void)uiCheckReceipt
{
    if ([self shouldHandleReceipt]) {
        [self.interactor checkReceipt];
    }
}

#pragma mark - NIMMeidaButton
- (void)onTapMediaItemPicture:(NIMMediaItem *)item
{
    [self.interactor mediaPicturePressed];
}

- (void)onTapMediaItemShoot:(NIMMediaItem *)item
{
    [self.interactor mediaShootPressed];
}

- (void)onTapMediaItemLocation:(NIMMediaItem *)item
{
    [self.interactor mediaLocationPressed];
}

#pragma mark - 旋转处理 (iOS8 or above)
- (void)viewWillTransitionToSize:(CGSize)size
       withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator
{
    self.lastVisibleIndexPathBeforeRotation = [self.tableView indexPathsForVisibleRows].lastObject;
    [super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
    if (self.view.window) {
        __weak typeof(self) wself = self;
        [coordinator animateAlongsideTransition:^(id <UIViewControllerTransitionCoordinatorContext> context)
         {
             [[NIMSDK sharedSDK].mediaManager cancelRecord];
             [wself.interactor cleanCache];
             [wself.tableView reloadData];
             [wself.tableView scrollToRowAtIndexPath:wself.lastVisibleIndexPathBeforeRotation atScrollPosition:UITableViewScrollPositionBottom animated:NO];
         } completion:nil];
    }
}

#pragma mark - 已读回执
- (void)sendMessageReceipt:(NSArray *)messages
{
    if ([self shouldHandleReceipt]) {
        [self.interactor sendMessageReceipt:messages];
    }
}
//0420
- (void)forwardMessage:(id)sender
{
    NIMMessage *message = [self messageForMenu];
   
                NIMContactFriendSelectConfig *config = [[NIMContactFriendSelectConfig alloc] init];
                config.needMutiSelected = NO;
                NIMContactSelectViewController *vc = [[NIMContactSelectViewController alloc] initWithConfig:config];
                vc.finshBlock = ^(NSArray *array){
                    NSString *userId = array.firstObject;
                    NIMSession *session = [NIMSession session:userId type:NIMSessionTypeP2P];
                    [self forwardMessage:message toSession:session];
                };
                [vc show];
            

}
- (void)forwardMessage:(NIMMessage *)message toSession:(NIMSession *)session
{
    NSString *name;
    if (session.sessionType == NIMSessionTypeP2P)
    {
        NIMKitInfoFetchOption *option = [[NIMKitInfoFetchOption alloc] init];
        option.session = session;
        name = [[NIMKit sharedKit] infoByUser:session.sessionId option:option].showName;
    }
    else
    {
        name = [[NIMKit sharedKit] infoByTeam:session.sessionId option:nil].showName;
    }
    [[NIMSDK sharedSDK].chatManager forwardMessage:message toSession:session error:nil];
    [self.view makeToast:@"已发送" duration:2.0 position:CSToastPositionCenter];

}
- (void)revokeMessage:(id)sender
{
    NIMMessage *message = [self messageForMenu];
    __weak typeof(self) weakSelf = self;
    [[NIMSDK sharedSDK].chatManager revokeMessage:message completion:^(NSError * _Nullable error) {
        if (error) {
            if (error.code == NIMRemoteErrorCodeDomainExpireOld) {
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"发送时间超过2分钟的消息，不能被撤回" delegate:nil cancelButtonTitle:@"确定" otherButtonTitles:nil, nil];
                [alert show];
            }else{
//                DDLogError(@"revoke message eror code %zd",error.code);
                [weakSelf.view makeToast:@"消息撤回失败，请重试" duration:2.0 position:CSToastPositionCenter];
            }
        }
        else
        {
            NIMMessageModel *model = [self uiDeleteMessage:message];
            [weakSelf.view makeToast:@"消息撤回成功!" duration:2.0 position:CSToastPositionCenter];

        }
    }];
}
- (void)audio2Text:(id)sender
{

}
#pragma mark - Private

- (void)addListener
{
    
    if (![self.sessionConfig respondsToSelector:@selector(disableReceiveNewMessages)]
        || ![self.sessionConfig disableReceiveNewMessages]) {
        [[NIMSDK sharedSDK].chatManager addDelegate:self];
    }
    [[NIMSDK sharedSDK].conversationManager addDelegate:self];
}

- (void)removeListener
{
    [[NIMSDK sharedSDK].chatManager removeDelegate:self];
    [[NIMSDK sharedSDK].conversationManager removeDelegate:self];
}

- (void)changeLeftBarBadge:(NSInteger)unreadCount
{
    NIMCustomLeftBarView *leftBarView = (NIMCustomLeftBarView *)self.navigationItem.leftBarButtonItem.customView;
    leftBarView.badgeView.badgeValue = @(unreadCount).stringValue;
    leftBarView.badgeView.hidden = YES;//!unreadCount; 在没有一个统计菜单的时候 不显示所有未读条数  zl
    
}


- (BOOL)shouldHandleReceipt
{
    return self.session.sessionType == NIMSessionTypeP2P &&
    [self.sessionConfig respondsToSelector:@selector(shouldHandleReceipt)] &&
    [self.sessionConfig shouldHandleReceipt];
}

- (id<NIMConversationManager>)conversationManager{
    switch (self.session.sessionType) {
        case NIMSessionTypeChatroom:
            return nil;
            break;
        case NIMSessionTypeP2P:
        case NIMSessionTypeTeam:
        default:
            return [NIMSDK sharedSDK].conversationManager;
    }
}


@end


//
//  RCTMessageEmitter.h
//  AwesomeProject
//
//  Created by HenryZ on 2017/8/23.
//  Copyright © 2017年 ShenCai. All rights reserved.
//
#import <React/RCTBridge.h>
#import <React/RCTEventEmitter.h>

//@interface RCTYXMessageEmitter : RCTEventEmitter<RCTBridgeModule>
//
//@end
#define RNIOSExportJsToReact(noti) [[NSNotificationCenter defaultCenter] postNotificationName:@"event-emitted" object:noti];

@interface RCTYXMessageEmitter : RCTEventEmitter<RCTBridgeModule>
+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload;
@end

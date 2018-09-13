//
//  RCTMessageEmitter.m
//  AwesomeProject
//
//  Created by HenryZ on 2017/8/23.
//  Copyright © 2017年 ShenCai. All rights reserved.
//

#import "RCTYXMessageEmitter.h"

@implementation RCTYXMessageEmitter



//- (NSArray<NSString *> *)supportedEvents
//{
//  return @[@"isMessageSendOrRecived"];//有几个就写几个
//}
//-(void)isMessageSendOrRecived:(NSString*)code
//{
//  [self sendEventWithName:@"isMessageSendOrRecived"
//                     body:@{@"code": code,
//                            }];
//}
RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"isMessageSendOrRecived"]; //这里返回的将是你要发送的消息名的数组。
}
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(emitEventInternal:)
                                               name:@"event-emitted"
                                             object:nil];
}
- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitEventInternal:(NSNotification *)notification
{
  [self sendEventWithName:@"isMessageSendOrRecived"
                     body:notification.object];
}

+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload
{
  [[NSNotificationCenter defaultCenter] postNotificationName:@"event-emitted"
                                                      object:self
                                                    userInfo:payload];
}

@end

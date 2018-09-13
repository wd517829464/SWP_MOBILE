#import <React/RCTBridge.h>
#import "MainViewController.h"

@interface RCTNimModule : NSObject <RCTBridgeModule>

@property(nonatomic,strong) NSMutableArray *allUnreadMessage;

@end

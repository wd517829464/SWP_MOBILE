//
//  TestViewController.m
//  AwesomeProject
//
//  Created by HenryZ on 2017/4/11.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "TestViewController.h"
#import "AppDelegate.h"
#import "MainViewController.h"
#import <React/RCTRootView.h>
#import "NIMSDK.h"

@interface TestViewController ()

@end

@implementation TestViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
  

}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
- (void)doPushNotification:(NSNotification *)notification{
//  NSLog(@"成功收到===>通知");
//  SomeViewController *one = [[SomeViewController alloc]init];
//  
//  AppDelegate *app = (AppDelegate *)[[UIApplication sharedApplication] delegate];
//  
//  [app.nav pushViewController:one animated:YES];
//
//  //注意不能在这里移除通知否则pus进去后有pop失效
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end

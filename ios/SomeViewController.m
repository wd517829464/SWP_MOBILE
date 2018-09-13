//
//  SomeViewController.m
//  AwesomeProject
//
//  Created by HenryZ on 2017/4/11.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "SomeViewController.h"

@interface SomeViewController ()

@end

@implementation SomeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
//    self.navigationController.navigationBarHidden = YES;
    [self.navigationController setNavigationBarHidden:YES animated:false];
}
-(void)viewWillAppear:(BOOL)animated{
//  self.navigationController.navigationBarHidden = YES;
  [self.navigationController setNavigationBarHidden:YES animated:false];

}
- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
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

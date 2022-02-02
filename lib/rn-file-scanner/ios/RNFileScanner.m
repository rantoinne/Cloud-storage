//
//  RNFileScanner.m
//  RNFileScanner
//
//  Created by Awamry on 12/08/21.
//  Copyright © 2021 FireKamp All rights reserved.
//
#import <React/RCTBridge.h>

@interface RCT_EXTERN_MODULE(RNFileScanner, NSObject)
    RCT_EXTERN_METHOD(getFilesInDir: (NSNumber) page
                        dirPath: (NSString * )dirPath
                        sortBy: (NSString *) sortBy
                        searchText: (NSString *) searchText)
    RCT_EXTERN_METHOD(init: (NSDictionary *) config)
    RCT_EXTERN_METHOD(setConfig: (NSDictionary *) config)
@end

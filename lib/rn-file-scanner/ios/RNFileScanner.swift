//
//  RNFileScanner.swift
//  RNFileScanner
//
//  Created by Awamry on 12/08/21.
//  Copyright © 2021 FireKamp All rights reserved.
//
//  import FileScannerFramework
import RealmSwift

@objc(RNFileScanner)
public class FileScannerWrapper: NSObject {
    //public static let instance: FileScanner?
    //public static func getInstance() -> FileScanner  {}

    public override init() {
      super.init()
    }

    @objc static func requiresMainQueueSetup() -> Bool {
      return false
    }

    @objc public func initialize(_ config: NSDictionary? = nil) {}
    @objc public func setConfig(_ config: NSDictionary? = nil) {}
    @objc public func getFilesInDir(_ page: NSNumber, dirPath: NSString, sortBy: NSString? = nil, searchText: NSString) {}
}

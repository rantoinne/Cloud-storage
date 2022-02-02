//
//  File.swift
//  Opacity
//
//  Created by Neeraj Negi on 03/08/21.
//  Copyright © 2021 Opacity. All rights reserved.
//

import Foundation
import Photos
import Realm
import RealmSwift
import UIKit
import CryptoKit


enum AutomaticUploadStatus: Int {
  case off = 0
  case on = 1
}

enum AutomaticUploadScope: Int {
  case recentPhotos = 0
  case allPhotos = 1
}

fileprivate struct PHAssetFolderName {
    let folderName: String
    let asset: PHAsset
}


public class AutomaticUploadManager: NSObject, PHPhotoLibraryChangeObserver {
    
    public struct FileScannerConfig {
        let includeVideos: Bool
        let includePhotos: Bool
        let includeOnlyNewPhotos: Bool
        let syncPhotosFromDate: TimeInterval
        let whitelistPaths: Array<String>
        let hasStorageAccess: Bool
        
        public init(includeVideos: Bool, includePhotos: Bool, includeOnlyNewPhotos: Bool, syncPhotosFromDate: TimeInterval, whitelistPaths: Array<String>, hasStorageAccess: Bool) {
            self.includeVideos = includeVideos
            self.includePhotos = includePhotos
            self.includeOnlyNewPhotos = includeOnlyNewPhotos
            self.syncPhotosFromDate = syncPhotosFromDate
            self.whitelistPaths = whitelistPaths
            self.hasStorageAccess = hasStorageAccess
        }
        
    }

    public struct GetFilesOptions {
        let page: Int = 1
        let dirPath: String
        let sortBy: SortBy
        let searchText: String?
        let requestPolicy: RequestPolicy?
    }
    
    public struct FilePageList {
        let data: Array<OpacityPhotoAssetDetails>
        let start: Int
        let end: Int
        let totalSize: Int
        let page: Int
    }
    
    var isFileScanning = false
    private static var config: FileScannerConfig?
    public static let shared = AutomaticUploadManager()
    var totalUploadedFilesInCurrentSession = 0
    private var setOfFilesWithFolderName = Array<PHAssetFolderName>()
    
    var backgroundID:UIBackgroundTaskIdentifier = UIBackgroundTaskIdentifier.invalid
    
    let dboperationQueue: OperationQueue = {
        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = Constants.concurrentFileUploadCount
        return queue
    }()
    
    var fileUploadedSuccesfully = [((OpacityPhotoAssetDetails) -> Void)?]()
    var totalFailedFiles = Set<OpacityPhotoAssetDetails>()
    var fileUploaded = [(() -> Void)?]()
    var isRepopulating = false
    var photoAssetDetails = Set<OpacityPhotoAssetDetails>()
    private var fileSize: Int = 0
    var failedFileNameIndex = [String: Int]()
    var isRepairOn = false
    
    /// List of all the PHAssets object
    var mediaAssets: PHFetchResult<PHAsset>?
    
    // Local path tracking to cancel upload from anywhere
    var fileLocalPath = [String: String]()
    
    private let uploadFolderPath = Utils.automaticUploadStatus()
    
    public class func setup(_ config:FileScannerConfig) {
        AutomaticUploadManager.config = config
        
        Utils.setAutomaticUploadStatus(flag: .on)
        Utils.setAutomaticUploadScope(flag: config.includeOnlyNewPhotos == true ? .recentPhotos : .allPhotos )
        
//        Utils.setAutomaticUploadStatus(flag: .on)
//        Utils.setAutomaticUploadScope(flag: .allPhotos)
    }
    
    private override init() {
        super.init()
        
        guard let config = AutomaticUploadManager.config else {
            fatalError("Error - you must call setup before accessing AutomaticUploadManager.shared")
        }
        
        print(config)
        
        // show on window, will be visible in all view controller
        let photoAccessStatus = PHPhotoLibrary.authorizationStatus()
        switch photoAccessStatus {
        case .authorized:
            repopulateDatabase()
            
        default:
            askForPhotoAccess()
        }
        
        PHPhotoLibrary.shared().register(self)
    }
    // MARK: - Private functions
    private func askForPhotoAccess() {
        PHPhotoLibrary.requestAuthorization { [weak self] authorisationPermissionStatus in
            switch authorisationPermissionStatus {
            case .authorized:
                self?.repopulateDatabase()
                
            default:
                Log.logDebug("Photo library access is not granted or restricted")
            }
        }
    }
    
    func createNonDuplicateName(name: String) -> String {
        var fileName =  name
        if self.failedFileNameIndex[name] != nil {
            fileName = (fileName as NSString).deletingPathExtension.appending("_copy.") + (name as NSString).pathExtension
        }
        return fileName
    }
    
    func dummyUploadMethod( filePath: String, remoteFilePath: String) {
        
        DispatchQueue.global().async {
            if AutomaticUploadManager.shared.fileLocalPath[filePath ?? ""] != nil {
                AutomaticUploadManager.shared.fileLocalPath.removeValue(forKey: filePath ?? "")
            }
        }
        
        OperationQueue.main.addOperation {
            self.totalUploadedFilesInCurrentSession += 1
            
            let filteredList = self.photoAssetDetails.filter({ (object) -> Bool in
                (object.fileName ?? "") == (remoteFilePath.components(separatedBy: "/").last ?? "").replacingOccurrences(of: "_thumb", with: "")
            })
            if let current = filteredList.first {
                current.status = .synced
                current.updatedPath = filePath
                
                let copyCurrent = current
                Log.logDebug("\(copyCurrent)")
                
                current.saveInDB { (status) in
                    if status {
                        
                    } else {
                        current.saveInDB()
                    }
                    self.photoAssetDetails.remove(current)
                    Log.logDebug("Deleted")
                    self.addUploadTask(refresh: false)
                    self.fileUploadedSuccesfully.forEach { (callback) in
                        callback?(copyCurrent)
                    }
                }
            } else {
                self.addUploadTask(refresh: false)
            }
        }
    }
    
    // MARK: - Public Utility functions
    public func updateFilesStatus(page: Int = 1, dirPath: String, sortBy: SortBy, searchText: String) -> Bool {
        
        return true
    }
    
    public func getFilesInDir(page: Int = 1, dirPath: String, sortBy: SortBy, searchText: String, completionHandler:@escaping(FilePageList)->()) {
        dboperationQueue.addOperation { [weak self] in
            autoreleasepool {
                guard let self = self else { return }
                do {
                    let realm = try Realm()
                    var result = realm.objects(OpacityPhotoAssetDetails.self)
                    if searchText.trimmingCharacters(in: .whitespacesAndNewlines).count > 0 {
                        result = result.filter("fileName contains[c] %@", searchText)
                    }
                    var objects = Array.init(result.sorted(byKeyPath: sortBy.rawValue, ascending: true))
                    let pageSize = 25
                    let start = pageSize * (page-1)
                    let end = pageSize * page
                    var tempFileArr = Array<OpacityPhotoAssetDetails>.init()
                    var endCount = 0
                    if objects.count > 0 {
                        for offset in start..<end {
                            if objects.count > offset {
                                tempFileArr.append(objects[offset])
                                endCount += 1
                            }
                            else {
                                break
                            }
                        }
                        objects = tempFileArr
                    }
                    completionHandler(FilePageList.init(data: objects, start: start, end: endCount, totalSize: endCount, page: page))
                } catch {
                    Log.logDebug("Got error in fetching the data")
                    completionHandler(FilePageList.init(data: Array<OpacityPhotoAssetDetails>.init(), start: 1, end: 1, totalSize: 1, page: 1))
                }
            }
        }
    }
    
    func cancelAllPreviousOperations() {
        dboperationQueue.cancelAllOperations()
    }
    
    public func startUpload() {
        self.totalFailedFiles.removeAll()
        self.failedFileNameIndex.removeAll()
        if self.photoAssetDetails.count < Constants.concurrentFileUploadCount {
            for _ in 1 ... Constants.concurrentFileUploadCount - self.photoAssetDetails.count {
                AutomaticUploadManager.shared.addUploadTask(refresh: false)
            }
        }
        
        AutomaticUploadManager.shared.repopulateDatabase(callback: {
            DispatchQueue.main.asyncAfter(deadline: DispatchTime.now()) {
                guard let media = self.mediaAssets, media.count > 0 else {
                    NotificationCenter.default.post(name: .automaticUploadDisabled, object: nil)
                    return
                }
                NotificationCenter.default.post(name: .automaticUploadEnabled, object: nil)
            }
        })
    }
    
    func repopulateDatabase(callback: (() -> Void)? = nil) {
        //if self.isRepopulating { return }
        
        if Utils.automaticUploadStatus() != .off {
            DispatchQueue.main.async {
                let photoAccessStatus = PHPhotoLibrary.authorizationStatus()
                switch photoAccessStatus {
                case .denied:
                    UIApplication.shared.delegate?.window!!.makeToast("Need photo library access to start auto upload")
                    return
                    
                default: Log.logDebug("Might have access")
                }
            }
        }
        
        
        Log.logDebug("Start Time: \(Date())")
        Log.logDebug("repopulateDatabase: Start")
        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(
            key: "creationDate",
            ascending: false
        )]
        
        options.predicate = NSPredicate(
            format: "mediaType = %d OR mediaType = %d",
            PHAssetMediaType.video.rawValue,
            PHAssetMediaType.image.rawValue
        )
        mediaAssets = PHAsset.fetchAssets(with: options)
        Log.logDebug("Media asset update: \(self.mediaAssets?.count)")
        callback?()
    }
    
    func checkAssetUploadStatus(asset: PHAsset) -> Bool {
        let ifObjectAlreadyUploading = AutomaticUploadManager.shared.photoAssetDetails.filter { (opacityObj) -> Bool in
            opacityObj.localIdentifier == asset.localIdentifier
        }
        
        let failedFilter = self.totalFailedFiles.filter { (opacityObj) -> Bool in
            opacityObj.localIdentifier == asset.localIdentifier
        }
        if let _ = ifObjectAlreadyUploading.first {
            return true
        } else if let _ = failedFilter.first {
            return true
        } else {
            return OpacityPhotoAssetDetails.checkObjectExistInLocalDB(localIdentifier: asset.localIdentifier)
        }
    }
    
    func addUploadTask(refresh: Bool) {
        // Do nothing if the user has upload
        if Utils.automaticUploadStatus() == .off { return }
        
        let photoUploadOperation = BlockOperation {
            self.addUpload()
        }
        
        if refresh {
            let photoFetchOperation = BlockOperation {
                self.repopulateDatabase()
            }
            photoUploadOperation.addDependency(photoFetchOperation)
            dboperationQueue.addOperations(
                [photoFetchOperation, photoUploadOperation],
                waitUntilFinished: false
            )
        } else {
            dboperationQueue.addOperation(photoUploadOperation)
        }
    }
    
    func getNextUpload() -> PHAsset? {
        autoreleasepool {
            var photoAsset: PHAsset? = nil
            guard let medias = self.mediaAssets else { return nil }
            var loopCount: Int = medias.count
            if Utils.getAutomaticUploadScope() == .recentPhotos {
                loopCount = min(Constants.numberOfFilesInRecentList, medias.count)
            }
            var alreadyUpload = 0
            var needToUpload = 0
            for assetCount in 0 ..< loopCount {
                let theAsset = medias.object(at: assetCount)
                if checkAssetUploadStatus(asset: theAsset) {
                    alreadyUpload += 1
                    continue
                } else {
                    photoAsset = theAsset
                    break
                }
            }
            needToUpload = loopCount - alreadyUpload
            return photoAsset
        }
    }
    
    func showToastMessage(message: String) {
        UIApplication.shared.delegate?.window!!.makeToast(message)
    }
    
    func addUpload() {
        
        DispatchQueue.global().async {
            if self.backgroundID == UIBackgroundTaskIdentifier.invalid {
                self.isFileScanning = true
                self.backgroundID = UIApplication.shared.beginBackgroundTask(withName: "Fetch_Photo_Library", expirationHandler: {
                    print("Background task expired")
                    UIApplication.shared.endBackgroundTask(self.backgroundID)
                    self.backgroundID = UIBackgroundTaskIdentifier.invalid
                })
            }
        }
        DispatchQueue.main.async {
            
            /*
             guard let assetDetail = OpacityPhotoAssetDetails.getNextAssetToUpload(existingList: self.photoAssetDetails)?.first,
             let imageAsset = PHAsset.fetchAssets(
             withLocalIdentifiers: [assetDetail.localIdentifier],
             options: nil
             ).firstObject else { return }
             */
            
            
            
            guard let assetDetail = self.getNextUpload(),
                  let imageAsset = PHAsset.fetchAssets(
                    withLocalIdentifiers: [assetDetail.localIdentifier],
                    options: nil
                  ).firstObject else {
        
                print("Scanning finished...")
                
                /* Use the below  after upload completed*/
                
                /*UIApplication.shared.endBackgroundTask(self.backgroundID)
                self.backgroundID = UIBackgroundTaskIdentifier.invalid
                self.appDelegate.isFileScanning = false
                Utils.setLastUploadTime(dateTime: Date.init())
                */
                return
                
            }
            //Create OpacityAsset object and save it in Local aaray
            let assetRecord = OpacityPhotoAssetDetails()
            assetRecord.localIdentifier = assetDetail.localIdentifier
            assetRecord.fileName = assetDetail.originalFilename() ?? assetDetail.localIdentifier
            assetRecord.assetCreationTimestamp = assetDetail.creationDate?.timeIntervalSince1970 ?? 0.0
            assetRecord.path = assetDetail.originalFilename()
            assetRecord.type = assetDetail.originalFilename()?.mimeType()
            assetRecord.status = .needSync
            
            if assetDetail.mediaType == .video {
                assetDetail.requestVideo { (data, thumbnail) in
                    let sha256 = SHA256.hash(data: data).description.replacingOccurrences(of: "SHA256 digest: ", with: "")
                    assetRecord.sha256 = sha256
                    self.photoAssetDetails.insert(assetRecord)
                    
                    assetRecord.saveInDB { (success) in
                        if success {
                            self.photoAssetDetails.remove(assetRecord)
                            self.addUploadTask(refresh: false)
                        }
                        else {
                            assetRecord.saveInDB()
                        }
                    }
                }
            }
            else if assetDetail.mediaType == .image {
                imageAsset.requestMaxSizeImageToUPpload { (data, image) in
                    let sha256 = SHA256.hash(data: data).description.replacingOccurrences(of: "SHA256 digest: ", with: "")
                    assetRecord.sha256 = sha256
                    self.photoAssetDetails.insert(assetRecord)
                    
                    assetRecord.saveInDB { (success) in
                        if success {
                            self.photoAssetDetails.remove(assetRecord)
                            self.addUploadTask(refresh: false)
                        }
                        else {
                            assetRecord.saveInDB()
                        }
                    }
                }
            }
            
            
        }
    }
    
    
    // MARK: - Photo Library delegate functions
    
    public func photoLibraryDidChange(_ changeInstance: PHChange) {
        AutomaticUploadManager.shared.repopulateDatabase {
            AutomaticUploadManager.shared.addUploadTask(refresh: false)
            AutomaticUploadManager.shared.fileUploaded.forEach { (callback) in
                callback?()
            }
        }
    }
    
    deinit {
        PHPhotoLibrary.shared().unregisterChangeObserver(self)
    }
}

//
//  OpacityPhotoAssetDetails.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import Foundation
import Realm
import RealmSwift

public enum FileMime: String {
    case png = "image/png"
    case pdf = "application/pdf"
    case excel = "application/vnd.ms-excel"
}

public enum FileStatus: String {
    case noSync = "no-sync"
    case needSync = "needs-sync"
    case synced = "synced"
}

public enum ScanStatus: String {
    case idle = "IDLE"
    case running = "RUNNING"
    case finished = "FINISHED"
}

public enum RequestPolicy: String {
    case uptoDate = "up-to-date"
    case latest = "latest"
}

public enum SortBy: String {
    case name = "fileName"
    case type = "mimeType"
    case size = "size"
    case dateCreated = "assetCreationTimestamp"
}

final class OpacityPhotoAssetDetails: Object {
    @objc dynamic var localIdentifier: String = ""
    dynamic var status: FileStatus = .needSync
    @objc dynamic var uploadError: Bool = false
    //  @objc dynamic var remoteFileURL: String?
    @objc dynamic var fileName: String?
    @objc dynamic var path: String?
    @objc dynamic var updatedPath: String?
    @objc dynamic var type: String?
    @objc dynamic var sha256: String?
    @objc dynamic var assetCreationTimestamp: Double = 0.0
    @objc dynamic var size : Int64 = 0
    
    override static func primaryKey() -> String? {
        return "localIdentifier"
    }
    
    class func getRecentFilesToUpload() -> Int {
        do {
            let realm = try Realm()
            let assetsNeedToBeUploaded = Array(realm.objects(OpacityPhotoAssetDetails.self)
                                                .filter("uploadError == false")
                                                .sorted(byKeyPath: "assetCreationTimestamp", ascending: false)
            )
            
            var objectsToUpload = Set<OpacityPhotoAssetDetails>()
            if Utils.getAutomaticUploadScope() == .recentPhotos {
                for counter in 0..<min(Constants.numberOfFilesInRecentList, assetsNeedToBeUploaded.count) {
                    let object = assetsNeedToBeUploaded[counter]
                    objectsToUpload.insert(object)
                }
                if Utils.getAutomaticUploadScope() == .recentPhotos {
                    AutomaticUploadManager.shared.totalUploadedFilesInCurrentSession = objectsToUpload.reduce(0, {
                        $0 + ($1.status == .needSync ? 0 : 1)
                    })
                }
                return objectsToUpload.count
            }
        } catch {
            return 0
        }
        return 0
    }
    
    class func getDataFromRecent(query: String) -> Int {
        do {
            guard let medias = AutomaticUploadManager.shared.mediaAssets else { return 0 }
            let realm = try Realm()
            let fetchedAssets = Array(realm.objects(OpacityPhotoAssetDetails.self)
                                        .filter(query)
                                        .sorted(byKeyPath: "assetCreationTimestamp", ascending: false)
            )
            var objectsToUpload = Set<OpacityPhotoAssetDetails>()
            for counter in 0..<min(Constants.numberOfFilesInRecentList, fetchedAssets.count) {
                let object = fetchedAssets[counter]
                objectsToUpload.insert(object)
            }
            var objCount = 0
            for assetCount in 0 ..< min(Constants.numberOfFilesInRecentList, medias.count) {
                let theAsset = medias.object(at: assetCount)
                Log.logDebug("Lib Identifier: \(theAsset.localIdentifier), Creation date: \(theAsset.creationDate)")
                if let _ = objectsToUpload.filter({ (obj) -> Bool in
                    obj.localIdentifier == theAsset.localIdentifier
                }).first {
                    objCount += 1
                    continue
                }
            }
            Log.logDebug("DB Identifier: \(objectsToUpload)")
            return objCount
        } catch {
            return 0
        }
    }
    
    class func checkObjectExistInLocalDB(localIdentifier: String) -> Bool {
        let realm = try? Realm()
        guard realm != nil else {
            return false
        }
        let objects = (realm!.objects(OpacityPhotoAssetDetails.self)).filter("localIdentifier == %@", localIdentifier).sorted(byKeyPath: "assetCreationTimestamp", ascending: false)
        if let _ = objects.first {
            return true
        } else { return false }
    }
    
    class func checkObjectAndDelete(remoteFileURL: String) -> Bool {
        let realm = try? Realm()
        guard let _realm = realm else {
            return false
        }
        let objects = (realm!.objects(OpacityPhotoAssetDetails.self)).filter("path == %@", remoteFileURL)
        if let item = objects.first {
            do {
                try _realm.write {
                    _realm.delete(item)
                }
                return true
            } catch {
                return false
            }
        } else { return false }
    }
    
    
    class func getUploadCountStatus() -> (success: Int, fail: Int) {
        let realm = try? Realm()
        guard realm != nil else {
            return (0, 0)
        }
        
        let assetArray = (realm!.objects(OpacityPhotoAssetDetails.self))
        
        let failedUpload = assetArray.filter("uploadError == true")
        let succededUpload = assetArray.filter("fileStatus == true")
        return (success: succededUpload.count, fail: failedUpload.count)
    }
    
    class func getNextAssetToUpload(existingList: Set<OpacityPhotoAssetDetails>) -> Set<OpacityPhotoAssetDetails>? {
        autoreleasepool {
            do {
                let realm = try Realm()
                let assetsNeedToBeUploaded = Array(realm.objects(OpacityPhotoAssetDetails.self)
                                                    .filter("uploadError == false")
                                                    .sorted(byKeyPath: "assetCreationTimestamp", ascending: false)
                )
                
                var objectsToUpload = Set<OpacityPhotoAssetDetails>()
                if Utils.getAutomaticUploadScope() == .recentPhotos {
                    for counter in 0..<min(Constants.numberOfFilesInRecentList, assetsNeedToBeUploaded.count) {
                        let object = assetsNeedToBeUploaded[counter]
                        objectsToUpload.insert(object)
                    }
                    AutomaticUploadManager.shared.totalUploadedFilesInCurrentSession = objectsToUpload.reduce(0, {
                        $0 + ($1.status == .needSync ? 0 : 1)
                    })
                } else {
                    objectsToUpload = Set(assetsNeedToBeUploaded)
                }
                return objectsToUpload.filter { $0.status == .needSync }.subtracting(existingList)
            } catch let assetPersistError {
                Log.logDebug(assetPersistError.localizedDescription)
                return nil
            }
        }
    }
    
    final func markAsUploaded(filePath: String?) {
        DispatchQueue.main.async {
            autoreleasepool {
                do {
                    let realm = try Realm()
                    try realm.write {
                        self.status = .synced
                        self.updatedPath = filePath
                    }
                } catch let assetPersistError as NSError {
                    Log.logDebug(assetPersistError.localizedDescription)
                }
            }
        }
    }
    
    final func changeName(name: String?) {
        DispatchQueue.main.async {
            autoreleasepool {
                do {
                    let realm = try Realm()
                    try realm.write {
                        self.fileName = name
                    }
                } catch let assetPersistError as NSError {
                    Log.logDebug(assetPersistError.localizedDescription)
                }
            }
        }
    }
    
    
    final func markAsErrorInUpload() {
        DispatchQueue.main.async {
            autoreleasepool {
                do {
                    let realm = try Realm()
                    try realm.write {
                        self.status = .needSync
                        self.uploadError = true
                        self.updatedPath = ""
                    }
                } catch let assetPersistError as NSError {
                    Log.logDebug(assetPersistError.localizedDescription)
                }
            }
        }
    }
    
    final func saveInDB(callback: ((Bool) -> Void)? = nil) {
        DispatchQueue.main.async {
            autoreleasepool {
                do {
                    let realm = try Realm()
                    try realm.write {
                        realm.add(self, update: .all)
                        Log.logDebug("Saved")
                        callback?(true)
                    }
                } catch let assetPersistError {
                    callback?(false)
                    Log.logDebug(assetPersistError.localizedDescription)
                }
            }
        }
    }
    
    class func deleteAllUploadCache() {
        do {
            let realm = try Realm()
            try? realm.write {
                let filesToUpload = realm.objects(OpacityPhotoAssetDetails.self)
                realm.delete(filesToUpload)
            }
        } catch let assetPersistError {
            Log.logDebug(assetPersistError.localizedDescription)
        }
    }
}

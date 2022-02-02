//
//  Constants.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import UIKit

class Constants: NSObject {
    static let scope = "opacity"
    static let storageType = scope + ".storageType"
    static let automaticUploadKey = scope + ".automatic_upload"
    static let automaticUploadAllOrRecentPhotosKey = scope + ".automatic_upload_all_or_recent_photos"
    static let uploadEncryptedFileKey = scope + ".upload_encrypted"
    static let allocationExpiredKey = scope + ".allocationExpired"
    static let lastUploadTimeKey = scope + ".last_upload_time"
    
    
    static let getAllocationStatsCallDiff = 1*60 //5 mins

    static let uploadUpdate = "uploadUpdate"
    static let automaticUpload = "automaticUploadKey"
    static let rootPath = "/"
    static let logPath = "logs"
    static let logFileName = "opcty.txt"
    static let uploadPath = "upload"
    static let expirationDateKey = "Expiry Date"
    static let secondsInYear = 31536000
    static let deletionDays = 3
    static let deletionTimeStamp = Constants.deletionDays * 24 * 60 * 60 * 1000
    static let changeAllocationCell = "changeAllocation"
    
    static let concurrentFileUploadCount = 1
    static let lastPhotoLibrarySyncDate = scope + ".lastPhotoLibrarySyncDate"
    
    
    static let expiryNotificationDays: Int = 5
    static let notifyInterval: TimeInterval = -7 * 24 * 60 * 60
    static let numberOfFilesInRecentList = 15
    
    static let localFolders = scope + ".localFolders"
    
  }

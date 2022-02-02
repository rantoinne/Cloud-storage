//
//  Utils.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import UIKit

enum DirectoryLocation {
    case Temporary
    case Document
    case Cache
}

enum FileType : String {
    case Directory = "d"
    case File = "f"
    case Image = "image"
    case Video = "video"
    case Unknown = "unknown"
}


class Utils: NSObject {
    
    static func checkFileExistForPath(dir: String, fileName: String) -> Bool {
        var path = dir
        if dir == "/" { path = "/home" }
        if let nameIndexForDir = Utils.getDefaults(key: path) as? [String: String] {
            if nameIndexForDir[fileName] != nil {
                return true
            }
            return false
        }
        return false
    }
    
    
    public static func writeToDefaults(key : String , value : Any) {
        let defaults = UserDefaults.standard
        defaults.set(value, forKey: key)
        defaults.synchronize()
    }
    
    public static func getDefaults(key : String) -> Any? {
        let defaults = UserDefaults.standard
        return defaults.value(forKey: key)
    }
    
    public static func removeDefaults(key : String) {
        let defaults = UserDefaults.standard
        defaults.removeObject(forKey: key)
        defaults.synchronize()
    }
    
    
    public static func path(dirType: DirectoryLocation) -> String {
        if dirType == .Document {
            return NSSearchPathForDirectoriesInDomains(
                .documentDirectory,
                .userDomainMask,
                true
            )[0]
        } else {
            return NSSearchPathForDirectoriesInDomains(
                .cachesDirectory,
                .userDomainMask,
                true
            )[0]
        }
    }
}

// MARK:- File operation
extension Utils {
    static func uploadDirectoryPath(forFileName fileName: String) -> String {
        return Utils.path(dirType: .Cache) + "/" + fileName
    }
    
    static func getNonDuplicateNameForFileInDir(dir: String, fileName: String) -> String {
        var path = dir
        if dir == "/" { path = "/home" }
        if var nameIndexForDir = Utils.getDefaults(key: path) as? [String: String] {
            var name = fileName
            // Returns the first possible _copy name for a file
            if nameIndexForDir[name] != nil {
                name = (name as NSString).deletingPathExtension.appending("_copy.") + (fileName as NSString).pathExtension
            }
            // Add the new _copy name to map
            nameIndexForDir[name] = name
            Utils.writeToDefaults(key: dir, value: nameIndexForDir)
            return name
        }
        return fileName
    }
}


// MARK: - Automatic upload

extension Utils {
    public static func automaticUploadStatus() -> AutomaticUploadStatus {
        let intValue = UserDefaults.standard.integer(forKey: Constants.automaticUploadKey)
        return AutomaticUploadStatus(rawValue: intValue) ?? AutomaticUploadStatus.off
    }
    
    public static func setAutomaticUploadStatus(flag: AutomaticUploadStatus) {
        UserDefaults.standard.set(flag.rawValue, forKey: Constants.automaticUploadKey)
    }
    
    public static func setAutomaticUploadScope(flag: AutomaticUploadScope) {
        UserDefaults.standard.set(flag.rawValue, forKey: Constants.automaticUploadAllOrRecentPhotosKey)
    }
    
    public static func getAutomaticUploadScope() -> AutomaticUploadScope {
        let value = UserDefaults.standard.integer(forKey: Constants.automaticUploadAllOrRecentPhotosKey)
        return AutomaticUploadScope(rawValue: value) ?? AutomaticUploadScope.recentPhotos
    }
    
    public static func setLastUploadTime(dateTime: Date) {
        let dateFormatter = DateFormatter.init()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        let dateTimeStr = dateFormatter.string(from: dateTime)
        UserDefaults.standard.set(dateTimeStr, forKey: Constants.lastUploadTimeKey)
    }
    
    public static func getLastUploadTime() -> Date {
        let value = UserDefaults.standard.string(forKey: Constants.lastUploadTimeKey)
        let dateFormatter = DateFormatter.init()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        let dateTime = dateFormatter.date(from: value!)
        return dateTime!
    }
    
    public static func getFileTypes(path: String) -> FileType {
        let pathExt = (path as NSString).pathExtension.lowercased()
        switch pathExt {
        case "jpg", "jp2", "png", "gif", "webp", "cr2", "tif", "bmp", "jxr", "psd", "ico", "heif", "dwg", "heic":
            return FileType.Image
        case "mp4", "m4v", "mkv", "webm", "mov", "avi", "mpg", "flv", "3gp", "wmv":
            return FileType.Video
        default:
            return FileType.Unknown
        }
    }
}

//
//  PHAsset+originalFilename.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import Foundation
import Photos.PHAsset
import UIKit.UIImage

extension PHAsset {
    
  func originalFilename(includeExtension: Bool = true) -> String? {
    guard let fileName = PHAssetResource.assetResources(for: self).first?.originalFilename else {
      return nil
    }
    if !includeExtension {
      return (fileName as NSString).deletingPathExtension
    } else {
      return fileName
    }
  }
}

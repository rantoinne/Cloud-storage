//
//  PHAsset+RequestMaxSizeImage.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import Foundation
import Photos.PHAsset
import UIKit.UIImage

extension PHAsset {
  func requestMaxSizeImageToUPpload(_ then: ((Data, UIImage) -> Void)?) {
    var originalImageData: Data?
    var thumbnailImage: UIImage?
    let thumbnailImageSize = CGSize(width: 1000, height: 1000)

    let requestImageOption = PHImageRequestOptions()
    requestImageOption.deliveryMode = .highQualityFormat
    let manager = PHImageManager.default()
    requestImageOption.isSynchronous = true

    manager.requestImage(
      for: self,
      targetSize: PHImageManagerMaximumSize,
      contentMode: .aspectFit,
      options: requestImageOption
    ) { (image: UIImage?, _) in
      thumbnailImage = image
      if let _thumbnailImage = image, let _originalImage = originalImageData {
        DispatchQueue.main.async {
          then?(_originalImage, _thumbnailImage)
        }
      }
    }

    manager.requestImageData(
      for: self,
      options: requestImageOption
    ) { imageData, mimeType, imageOrientation, imageDetailsDict in
      originalImageData = imageData
      if let _thumbnailImage = thumbnailImage, let _originalImageData = imageData {
        DispatchQueue.main.async {
          then?(_originalImageData, _thumbnailImage)
        }
      }
    }
  }
}

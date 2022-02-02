//
//  UIImage+WriteAtPath.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//


import Foundation
import ImageIO
import MobileCoreServices
import UIKit

public extension UIImage {
  /// Supported image types
  private var supportedType: [String: CFString] {
    let _supportedType: [String: CFString] = [
      "JPG": kUTTypeJPEG,
      "JPEG": kUTTypeJPEG,
      "PNG": kUTTypePNG,
      "PNGF": kUTTypePNG,
      "TIFF": kUTTypeTIFF,
      "TIF": kUTTypeTIFF,
      "PICT": kUTTypePICT,
      "PIC": kUTTypePICT,
      "PCT": kUTTypePICT,
      "X-PICT": kUTTypePICT,
      "X-MACPICT": kUTTypePICT,
      "JP2": kUTTypeJPEG2000,
      "ICO": kUTTypeICO,
      "ICNS": kUTTypeAppleICNS,
      "QIF": kUTTypeQuickTimeImage,
      "BMPF": kUTTypeBMP,
      "BMP": kUTTypeBMP,
      "HEIC": kUTTypeJPEG
    ]

    return _supportedType
  }

  /// Saves an image at given file path.
  ///
  /// - Parameter path: full path to file.
  /// - Returns: true if image was saved succssfully otherwise false
  @discardableResult func writeAtPath(path: String) -> Bool {
    let result = CGImageWriteToFile(image: cgImage!, filePath: path)
    return result
  }

  /// Saves an image at given file path.
  ///
  /// - Parameters:
  ///   - image: Source image to save.
  ///   - filePath: full path to file.
  /// - Returns: true if image was saved succssfully otherwise false
  private func CGImageWriteToFile(image: CGImage, filePath: String) -> Bool {
    let imageURL: CFURL = NSURL(fileURLWithPath: filePath)

    let ext = (filePath as NSString).pathExtension.uppercased()
    let imageType: CFString? = supportedType[ext]

    guard let imageExt = imageType else {
      return false
    }

    guard let destination = CGImageDestinationCreateWithURL(imageURL, imageExt, 1, nil) else {
      return false
    }

    CGImageDestinationAddImage(destination, image, nil)

    if CGImageDestinationFinalize(destination) {
      return false
    }

    return true
  }
}

//
//  PHAsset+requestVideo.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import Foundation

import Foundation
import Photos.PHAsset
import UIKit.UIImage

extension PHAsset {

  func requestVideo(then: ((Data, UIImage) -> Void)?) {
    let phOptions = PHVideoRequestOptions()
    phOptions.deliveryMode = .highQualityFormat
    phOptions.version = .original
    phOptions.isNetworkAccessAllowed = true

    PHImageManager.default().requestAVAsset(forVideo: self, options: phOptions) { asset, _, _ in
      guard let asset = asset as? AVURLAsset else { return }
      do {
        let imgGenerator = AVAssetImageGenerator(asset: asset)
        imgGenerator.appliesPreferredTrackTransform = true
        let cgImage = try imgGenerator.copyCGImage(at: CMTimeMake(value: 0, timescale: 1), actualTime: nil)
        let thumbnail = UIImage(cgImage: cgImage)
        guard let videoData = try? Data(contentsOf: asset.url) else {
          Log.logDebug("No proper Data")
          return
        }
        DispatchQueue.main.async {
          then?(videoData, thumbnail)
        }
      }
      catch {}
    }
  }
}

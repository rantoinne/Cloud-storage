//
//  NSNotification.Name.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import Foundation

extension NSNotification.Name {  
  static var fileUploadedSuccesfully: Self {
   return NSNotification.Name("com.beyondroot.Opacity.fileUploadedSuccesfully")
  }

  static var automaticUploadEnabled: Self {
    return NSNotification.Name("com.beyondroot.Opacity.automaticUploadEnabled")
  }

  static var automaticUploadDisabled: Self {
    return NSNotification.Name("com.beyondroot.Opacity.automaticUploadDisabled")
  }
  
}

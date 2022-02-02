//
//  Log.swift
//  Opacity
//
//  Created by nSquare on 03/08/21.
//

import UIKit

enum LogLevel : String {
  case ERROR = "Error"
  case DEBUG = "Debug"
  case NONE = "None"
  case ALL = "All"
}

class Log: NSObject {
  
  static var logLevel : LogLevel = .NONE
  public static func log(_ text: String,
                         level: LogLevel,
                         file: StaticString = #file,
                         function: StaticString = #function,
                         line: UInt = #line) {
    let msg : String = "Opacity_LOG: [File:" + "\(file)" + "\nFunction:" + "\(function)" + "\nLine#:" + "\(line)" + "\nMsg:" + "\(text)]"
    guard level != .NONE else {
      return
    }
    
    if logLevel == level || logLevel == .ALL{
      print(msg)
    }
  }
  
  public static func logDebug(_ msg: String) {
     #if DEBUG
      print(msg)
     #endif
  }
  
}

// RNFileScannerModule.java
package com.firekamp.rnfilescanner;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.opacity.androidsdk.CallbackResult;
import com.opacity.androidsdk.FilesSyncSDK;
import com.opacity.androidsdk.db.data.Config;
import com.opacity.androidsdk.db.data.FilePageList;
import com.opacity.androidsdk.db.data.GetFilesOptions;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import androidx.annotation.Nullable;

public class RNFileScannerModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private static ReactApplicationContext reactContext;
  private BroadcastReceiver sdkEventsReceiver;

  public RNFileScannerModule(ReactApplicationContext context) {
    super(context);
    this.reactContext = context;
    sdkEventsReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action.equals(FilesSyncSDK.ACTION_SCAN_STATUS)) {
          String scanStatus = intent.getExtras().getString(FilesSyncSDK.ACTION_SCAN_STATUS_EXTRA);
          sendFileScanStatusEvent(scanStatus);
        } else if (action.equals(FilesSyncSDK.ACTION_FILE_CHANGED)) {
          String filePath = intent.getExtras().getString(FilesSyncSDK.ACTION_FILE_CHANGED_FILE_PATH_EXTRA);
          long fileSize = intent.getExtras().getLong(FilesSyncSDK.ACTION_FILE_CHANGED_FILE_SIZE_EXTRA);
          sendFileChangeEvent(filePath, fileSize);
        }
      }
    };
    IntentFilter intentFilter = new IntentFilter(FilesSyncSDK.ACTION_SCAN_STATUS);
    intentFilter.addAction(FilesSyncSDK.ACTION_FILE_CHANGED);
    reactContext.registerReceiver(sdkEventsReceiver, intentFilter);
  }

  private void sendFileScanStatusEvent(String scanStatus) {
    WritableMap params = Arguments.createMap();
    params.putString("status", scanStatus);
    sendEvent(reactContext, "ScanStatus", params);
    Log.d("ScanStatus", "status: " + scanStatus);
  }

  private void sendFileChangeEvent(String filePath, long fileSize) {
    WritableMap params = Arguments.createMap();
    params.putString("path", filePath);
    params.putDouble("size", fileSize);
    sendEvent(reactContext, "FileChange", params);
    Log.d("FileChange", "path: " + filePath + " - size: " + fileSize);
  }

  private void sendEvent(ReactContext reactContext,
                         String eventName,
                         @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

  @Override
  public String getName() {
    return "RNFileScanner";
  }

  @ReactMethod
  public void setConfig(ReadableMap config, final Callback callback) {
    FilesSyncSDK.setConfig(reactContext, Config.parse(config), new CallbackResult<Boolean>() {
      @Override
      public void onResult(Boolean result) {
        callback.invoke(result);
      }
    });
  }

  @ReactMethod
  public void getFilesInDir(ReadableMap requestOptions, final Callback callback) {
    //We can parse the incoming requestOptions by calling 'GetFilesOptions.parse' function
    GetFilesOptions getFilesOptions = GetFilesOptions.parse(requestOptions);
    //GetFilesOptions getFilesOptions = new GetFilesOptions(1.0, "/DCIM/Camera/", "NAME", "");
    FilesSyncSDK.getFilesInDir(getFilesOptions, new CallbackResult<FilePageList>() {
      @Override
      public void onResult(FilePageList filePageList) {
        callback.invoke(filePageList.getMap());
      }
    });
  }

  @ReactMethod
  public void updateFilesStatus(ReadableArray filesList, final Callback callback) {
    FilesSyncSDK.updateFilesStatus(filesList, new CallbackResult<Boolean>() {
      @Override
      public void onResult(Boolean result) {
        callback.invoke(result);
      }
    });
  }

  @ReactMethod
  public void getTotalCount(@Nullable String status, final Callback callback) {
    FilesSyncSDK.getTotalCount(status, new CallbackResult<Double>() {
      @Override
      public void onResult(Double result) {
        callback.invoke(result);
      }
    });
  }

    @ReactMethod
  public void cleanDB(final Callback callback) {
    FilesSyncSDK.cleanDB(new CallbackResult<Boolean>() {
      @Override
      public void onResult(Boolean result) {
        callback.invoke(result);
      }
    });
  }

  @Override
  public void onHostResume() {
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {
    try {
      reactContext.unregisterReceiver(sdkEventsReceiver);
    } catch (Exception e) {
    }
  }
}

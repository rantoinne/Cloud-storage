package com.opacity;

import android.app.Application;
import android.content.Context;

import com.ReactNativeBlobUtil.ReactNativeBlobUtilPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.chirag.RNMail.RNMail;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import cl.json.RNSharePackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactlibrary.RNThreadPackage;
import com.reactnativeaesgcmcrypto.AesGcmCryptoPackage;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {
  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          packages.add(new RNThreadPackage(mReactNativeHost,
                  new ReactNativeBlobUtilPackage(), // we have to add ReactNativeBlobUtilPackage because it's needed in worker.thread.js code to prevent ReactNativeBlobUtilPackage import failure
                  new RandomBytesPackage(), // we have to add RandomBytesPackage because it's needed in worker.thread.js code to prevent crypto import failure
                  new AesGcmCryptoPackage(),
                  new RNMail()
          ));
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}

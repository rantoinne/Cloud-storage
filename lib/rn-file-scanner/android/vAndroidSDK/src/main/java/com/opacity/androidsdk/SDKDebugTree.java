package com.opacity.androidsdk;

import android.os.Build;
import android.util.Log;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import timber.log.Timber;

public class SDKDebugTree extends Timber.Tree {
    private static final String TAG = "OpacityAndroid";
    private static final int MAX_LOG_LENGTH = 4000;
    private static final int MAX_TAG_LENGTH = 23;
    private static final int CALL_STACK_INDEX = 6;
    private static final Pattern ANONYMOUS_CLASS = Pattern.compile("(\\$\\d+)+$");
    private static SimpleDateFormat currentDayHourFormatter = new SimpleDateFormat("yyyy-MM-dd(hha)" , Locale.US);
    private static SimpleDateFormat currentTimeFormatter = new SimpleDateFormat("hh:mm:ss.SSS" , Locale.US);
    public static  boolean cloudLog = false;
    public static  boolean localLog = false;
    public static File externalCacheDir = null;
    public static String packageName = "";
    public static long LOG_WRITE_LIMIT = 22000;
    public static long lastWriteOperationTimestamp = 0;
    public static StringBuilder stringBuilder = new StringBuilder();


    /**
     * Extract the tag which should be used for the message from the {@code element}. By default
     * this will use the class name without any anonymous class suffixes (e.g., {@code Foo$1}
     * becomes {@code Foo}).
     * <p>
     * Note: This will not be called if a tag(String) manual tag} was specified.
     */
    @Nullable
    protected String getClass(@NotNull StackTraceElement element) {

        String tag = element.getClassName();
        Matcher m = ANONYMOUS_CLASS.matcher(tag);
        if (m.find()) {
            tag = m.replaceAll("");
        }
        tag = tag.substring(tag.lastIndexOf('.') + 1);
        // Tag length limit was removed in API 24.
        if (tag.length() <= MAX_TAG_LENGTH || Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return tag;
        }
        return tag.substring(0, MAX_TAG_LENGTH);
    }

    String getPrefix() {

        // DO NOT switch this to Thread.getCurrentThread().getStackTrace(). The test will pass
        // because Robolectric runs them on the JVM but on Android the elements are different.
        StackTraceElement[] stackTrace = new Throwable().getStackTrace();
        StackTraceElement element = stackTrace[CALL_STACK_INDEX];

        if (stackTrace.length <= CALL_STACK_INDEX) {
            throw new IllegalStateException(
                    "Synthetic stacktrace didn't have enough elements: are you using proguard?");
        }

        return getClass(stackTrace[CALL_STACK_INDEX]) /*+ " - " + element.getMethodName()*/;
    }

    /**
     * Break up {@code message} into maximum-length chunks (if needed) and send to either
     * {@link Log#println(int, String, String) Log.println()} or
     * {@link Log#wtf(String, String) Log.wtf()} for logging.
     * <p>
     * {@inheritDoc}
     */
    @Override
    protected void log(int priority, String tag, @NotNull String message, Throwable t) {
        //ignore incoming tag
        tag = TAG;

        if (message.length() < MAX_LOG_LENGTH) {
            if (priority == Log.ASSERT) {
                Log.wtf(tag, message);
            } else {
                Log.println(priority, tag , getPrefix() + " - " + message);
                //save to local if localLog is enabled
                if (localLog) saveToLocal(message);
            }
            return;
        }

        // Split by line, then ensure each line can fit into Log's maximum length.
        for (int i = 0, length = message.length(); i < length; i++) {
            int newline = message.indexOf('\n', i);
            newline = newline != -1 ? newline : length;
            do {
                int end = Math.min(newline, i + MAX_LOG_LENGTH);
                String part = message.substring(i, end);
                if (priority == Log.ASSERT) {
                    Log.wtf(tag, part);
                } else {
                    Log.println(priority, tag, part);
                    //save to local if localLog is enabled
                    if (localLog) saveToLocal(part);
                }
                i = end;
            } while (i < newline);
        }
    }

    //Save logs locally for debugging
    protected void saveToLocal(String msg) {
        if (externalCacheDir == null) return;


        long currentTimestamp = Calendar.getInstance().getTimeInMillis();
        Date currentTime = new Date(currentTimestamp);
        String currentDayHourStr = currentDayHourFormatter.format(currentTime);
        String currentMsg = "[" + currentTimeFormatter.format(currentTime) + "] " + msg +"\n";
        stringBuilder.append(currentMsg);

        //return if limit is not reach or last write since less than 1 second
        if (((currentTimestamp - lastWriteOperationTimestamp) < 1000) && stringBuilder.length() <= LOG_WRITE_LIMIT ) {
            return;
        }

        File saveDir = new File("/storage/emulated/0/OpacitySDKLog/" + packageName);
        if (!saveDir.exists()) {
            saveDir.mkdir();
        }
        File filePath = new File(saveDir + "/" + currentDayHourStr + "_opacity_sdk_log.txt");

        try {
            FileOutputStream outputStream = new FileOutputStream(filePath, true);
            outputStream.write(stringBuilder.toString().getBytes());
            outputStream.close();
            //reset
            stringBuilder.setLength(0);
            lastWriteOperationTimestamp = Calendar.getInstance().getTimeInMillis();
        } catch (Exception e) {
            Log.e(TAG, "can't save log locally - e:" + e);
        }

    }

}
function Main() {
Java.perform(function () {
        var ActivityThread = Java.use("android.app.ActivityThread");
        var currentActivityThread = ActivityThread.currentActivityThread();
        var appContext = currentActivityThread.getApplication();

        var Handler = Java.use("android.os.Handler");
        var Looper = Java.use("android.os.Looper");
        var Intent = Java.use("android.content.Intent");
        var Bundle = Java.use("android.os.Bundle");

        var Activity = "com.tencent.mm.plugin.profile.ui.ContactInfoUI"

        var MainActivity = Java.use(Activity);

        var mainLooper = Looper.getMainLooper();
        var handler = Handler.$new(mainLooper);

        var Runnable = Java.use("java.lang.Runnable");
        var MyRunnable = Java.registerClass({
            name: 'MyRunnable',
            implements: [Runnable],
            methods: {
                run: function () {
                    var intent = Intent.$new(appContext, MainActivity.class);  // use appContext here
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK.value)
                    var bundle = Bundle.$new();

                    bundle.putInt('Kdel_from', 0);
                    bundle.putString('Contact_User', 'wxid_i5e2pseumhih21');
                    bundle.putBoolean('Contact_RoomMember', true);
                    // bundle.putLong('preAct_time', 1698050303122);

                    intent.putExtras(bundle);
                    appContext.startActivity(intent);  // start activity from appContext
                }
            }
        });

        handler.post(MyRunnable.$new());
    });
}

setTimeout(Main, 1000)


// frida -U -l openApp.js -f com.shizhuang.duapp --no-pause
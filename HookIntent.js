var logger = (function () {
    var levels = {
        'error': '\x1b[31m',  // Red
        'Activity': '\x1b[33m',   // Yellow
        'info': '\x1b[32m',   // Green
        'Bundle': '\x1b[34m',   // Blue
        'MainActivity': '\x1b[32m'
    };

    function printBundleType(extras) {
        if (extras != null) {
            var keySet = extras.keySet();
            var iterator = keySet.iterator();
            while (iterator.hasNext()) {
                var key = iterator.next();
                var value = extras.get(key);

                if (value !== null) {
                    var valueType = Java.use("java.lang.Object").getClass.call(value).getName();
                    console.log(
                        "   ",
                        "\x1b[36m" + "[BundleType]" + "\x1b[0m",
                        `Type: ${valueType}`.padEnd(30),
                        `Key: ${key}`.padEnd(40),
                        `Value: ${value}`.padEnd(50)
                    );
                }
            }
        }
        console.log()
    }

    function log(level, message) {
        var reset = '\x1b[0m';
        console.log(levels[level] + '[' + level + ']' + reset + ' ' + message);
        if (level !== "Bundle" && level !== "MainActivity") {
            console.log()
        }
    }

    return {
        Bundle: function (message, extras) {
            log('Bundle', message);
            printBundleType(extras);
        },

        info: function (message) {
            log('info', message);
        },

        Activity: function (message) {
            log('Activity', message);
        },

        error: function (message) {
            log('error', message);
        },
        MainActivity: function (message, extras) {
            log('MainActivity', message);
            printBundleType(extras)
        }
    };
})();

function Main() {
    Java.perform(function () {

            var Activity = Java.use("android.app.Activity");

//             var onResume = Activity.onResume;
//             Interceptor.replace(onResume, new NativeCallback(function () {
//                 var intent = this.getIntent();
//                 var extras = intent.getExtras();
//                 console.log('MainActivity:', this.$className, extras);
//                 onResume.call(this);
//             }, 'void', []));
//
// // 接收 'input' 消息并触发 onResume() 方法
//             recv('input', function (data) {
//                 if (data.payload === '\n') {
//                     console.log('Input received, triggering onResume()...');
//                     onResume.call(Activity.$new());
//                 }
//             });
            Activity.onResume.implementation = function () {
                var intent = this.getIntent();
                var extras = intent.getExtras();
                logger.MainActivity(this.$className, extras);
                try {
                    this.onResume.overload().call(this);
                } catch (e) {
                    logger.error('Error calling onResume: ', e.message);
                }
            };
            Activity.startActivity.overload('android.content.Intent').implementation = function (intent) {
                var extras = intent.getExtras();
                logger.Bundle(`startActivity intent: ${extras}`, extras);
                this.startActivity(intent);
            };

            Activity.startActivityForResult.overload('android.content.Intent', 'int').implementation = function (intent, requestCode) {
                var extras = intent.getExtras();

                logger.Bundle(`startActivityForResult intent: ${extras}, ${requestCode}`, extras);

                this.startActivityForResult(intent, requestCode);
            }
            ;
            Activity.startActivity.overload('android.content.Intent').implementation = function (intent) {
                var extras = intent.getExtras();
                logger.Bundle(`startActivityForResult intent: ${extras}`, extras)
                return this.startActivity(intent);
            };

            var Intent = Java.use("android.content.Intent");

            Intent.$init.overload('android.content.Context', 'java.lang.Class').implementation = function (context, cls) {
                var instance = this.$init(context, cls);
                logger.Activity(`new Intent: ${context}, ${cls.toString()}`);
                return instance;
            };

            Intent.$init.overload('android.content.Intent').implementation = function (intent) {
                var instance = this.$init(intent);
                logger.Activity(`new Intent: ${intent}`);
                return instance;
            };
            Intent.putExtras.overload('android.os.Bundle').implementation = function (intent) {
                // var extras = intent.getExtras();
                // logger.Bundle(`intent.putExtras: ${extras}`, extras)
                // return this.putExtras(intent);
                // var extras = intent.getExtras();
                logger.Bundle(`intent.putExtras: ${intent}`, intent)
                return this.putExtras(intent);
            };

            Intent.setClassName.overload('android.content.Context', 'java.lang.String').implementation = function (context, className) {
                logger.Activity(`Hooked setClassName: ${context}, ${className}`);
                // console.log('Context:', context);
                // console.log('Class Name:', className);
                this.setClassName(context, className);

                return this;
            };

            Intent.setClassName.overload('java.lang.String', 'java.lang.String').implementation = function (packageName, className) {
                logger.Activity(`Hooked setClassName: ${packageName}, ${className}`);
                this.setClassName(packageName, className);
                return this;
            };

            var Context = Java.use("android.content.Context");

            Context.startActivity.overload('android.content.Intent').implementation = function (intent) {
                var extras = intent.getExtras();

                // log before original Impl
                console.log("Context.startActivity intent: ", extras);

                // call original Impl
                this.startActivity(intent);
            };

            Context.sendBroadcast.overload('android.content.Intent').implementation = function (intent) {
                var extras = intent.getExtras();

                // log before original Impl
                console.log("Context.sendBroadcast intent: ", extras);

                // call original Impl
                this.sendBroadcast(intent);
            };

            Context.startService.overload('android.content.Intent').implementation = function (intent) {
                var extras = intent.getExtras();

                // log before original Impl
                console.log("Context.startService intent: ", extras);

                // call original Impl
                this.startService(intent);
            };

            // Intent.setAction.implementation = function (action) {
            //     console.log('Intent.setAction: action=' + action);
            //     return this.setAction(action);
            // };
            //
            // Intent.addCategory.implementation = function (category) {
            //     console.log('Intent.addCategory: category=' + category);
            //     return this.addCategory(category);
            // };
            //
            // Intent.setData.implementation = function (uri) {
            //     console.log('Intent.setData: uri=' + uri.toString());
            //     return this.setData(uri);
            // };
            //
            // Intent.putExtra.overload('java.lang.String', 'java.lang.String').implementation = function (key, value) {
            //     console.log('Intent.putExtra: key=' + key + ', value=' + value);
            //     return this.putExtra(key, value);
            // };
            //
            // Intent.putExtra.overload('java.lang.String', 'int').implementation = function (key, value) {
            //     console.log('Intent.putExtra: key=' + key + ', value=' + value);
            //     return this.putExtra(key, value);
            // };
        }
    )
}

setTimeout(Main, 500)


// frida -U -l HookIntent.js com.tencent.mm --no-pause
// frida -U -l HookIntent.js com.tencent.mobileqq --no-pause
// frida -U -l HookIntent.js com.ccssoft.ywt --no-pause
// frida -U -l HookIntent.js lozn.hookui --no-pause
// frida -U -l HookIntent.js com.android.launcher3 --no-pause
/**
 * @file some function for background page
 * @author mj (zoumiaojiang@gmail.com)
 */

(function (root) {

    /**
     * utils工具包对象
     *
     * @type {Object}
     */
    var utils = {};


    /**
     * 在页面中调用background的一个函数
     */
    utils.bgFuncCaller = function () {

        // params: functionName, [funcionParames<array>], [callback<function>]

        var args = [];

        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        var fn = args.shift();
        var hasCallback = (typeof args[args.length - 1] === 'function');
        var callback = (hasCallback ? args.pop() : function () {});

        chrome.extension.sendRequest({
            command: 'call',
            fn: fn,
            args: args
        }, callback);
    };


    /**
     * 日志函数 console.log
     */
    utils.log = function () {
        CONF.VERBOSE_DEBUG && console.log.apply(console, arguments);
    };


    /**
     * 日志函数 console.group
     */
    utils.logGroup = function () {
        CONF.VERBOSE_DEBUG && console.group.apply(console, arguments);
    };


    /**
     * 日志函数 console.groupEnd
     */
    utils.logGroupEnd = function () {
        CONF.VERBOSE_DEBUG && console.groupEnd();
    };


    /**
     * 国际化语言翻译
     *
     * @param  {string} messageID  语言的标记id, 在_locale中定义的
     * @param  {array} args        翻译的参数
     * @return {string}            翻译之后的字符串
     */
    utils.translate = function (messageID, args) {
        return chrome.i18n.getMessage(messageID, args);
    };


    /**
     * 获取当前的语言
     *
     * @return {string}  语言类型, zh, zh-CN, en等
     */
    utils.determineUserLanguage = function () {
        return navigator.language.match(/^[a-zA-Z_\-]+/i)[0];
    };


    /**
     * 解析一个url地址
     *
     * @param  {string} url url地址
     * @return {Object}     uri对象
     */
    utils.parseUrl = function (url) {

        var matches
            = /^(([^:]+(?::|$))(?:(?:\w+:)?\/\/)?(?:[^:@\/]*(?::[^:@\/]*)?@)?(([^:\/?#]*)(?::(\d*))?))((?:[^?#\/]*\/)*[^?#]*)(\?[^#]*)?(\#.*)?/
                .exec(url);

        // uri对象含有的属性名
        var keys = ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
        var obj = {};
        var items = [];

        for (var i = 0; (matches && i < keys.length); i++) {
            obj[keys[i]] = matches[i] || '';
        }
        if (obj.search) {
            items = obj.search.split(/[\?\&]/g);
            obj.querys = {};
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                if (item !== '') {
                    var temparr = item.split('=');
                    obj.querys[temparr[0]] = (temparr[1] || true);
                }
            }
        }

        return obj;
    };


    /**
     * localStorage set方法(safari有坑)
     *
     * @param  {string} key   设置的key值
     * @param  {Object} value 设置的value值
     */
    utils.storageSet = function (key, value) {
        var store = (window.SAFARI ? safari.extension.settings : localStorage);
        if (value === undefined) {
            store.removeItem(key);
            return;
        }
        try {
            store.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            // Safari throws this error for all writes in Private Browsing mode.
            // TODO: deal with the Safari case more gracefully.
            if (e.name == 'QUOTA_EXCEEDED_ERR' && !SAFARI) {
                // alert(utils_translate('storage_quota_exceeded'));
                // openTab("options/index.html#ui-tabs-2");
            }
        }
    };


    /**
     * localStorage的get方法(safari有坑)
     *
     * @param  {string} key  key值
     * @return {Object}      通过key值取到的对象
     */
    utils.storageGet = function (key) {
        var store = window.SAFARI ? safari.extension.settings : localStorage;
        var json = store.getItem(key);
        try {
            return JSON.parse(json);
        }
        catch (e) {
            this.log('Couldn\'t parse json for ' + key);
        }
    };


    root.UTILS = utils;

})(this);

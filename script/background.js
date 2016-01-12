/**
 * @file graphsearch background.js
 * @author mj (zoumiaojiang@gmail.com)
 */

(function () {


    /**
     * 初始化邮件点击图片的右键菜单
     */
    (function initRightClickContextMenu() {

        /**
         * 右键点击图片的处理函数
         *
         * @param  {Object} info 当前页面的一些信息
         * @param  {Objecy} tab  当前tab的信息
         */
        function genericOnClick(info, tab) {

            UTILS.log('[page info]: ', info);
            UTILS.log('[tab info]: ', tab);

            chrome.tabs.sendRequest(tab.id, {action: 'loadingshow'}, function (response) {});

            $.ajax({
                url: location.protocol.indexOf('https') > -1 ? CONF.HTTPS_UPLOAD_IMAGE_URL : CONF.UPLOAD_IMAGE_URL,
                type: 'POST',
                dataType: 'json',
                data: {
                    image: info.srcUrl,
                    tn: CONF.EXTENTIONS_TN
                },
                success: function (data) {
                    if ('' + data.status === '0' && data.command) {
                        UTILS.log('[uploadImage ajax return data]: ', data);

                        var uri = UTILS.parseUrl(data.command.url || 'search://');
                        var url = CONF.SHOW_RESULT_URL + '?word=' + uri.host + '&sign=' + uri.querys['sign'] || '';

                        chrome.tabs.create({
                            index: tab.index + 1,
                            url: url
                        });
                    }
                    else {
                        UTILS.log('--status: ' + data.status, '\n--statusInfo: ' + (data.statusInfo || data.msg));
                    }

                    chrome.tabs.sendRequest(tab.id, {action: 'loadinghide'}, function (response) {});
                },

                fail: function () {
                    alert('服务器开小差了~');
                }
            });
        } 


        chrome.contextMenus.create({

            // 设置右键点击后的功能描述话术
            'title': UTILS.translate('menuTitle'),

            // 指定在哪些dom元素上触发, 只支持img元素，如果是backgroud形式的，就没招了，只能拖拽搜索
            'contexts': ['image'],

            // 点击触发回调
            'onclick': genericOnClick
        });

    }());



    /**
     * 点击browser icon干的事情
     */
    (function bindBrowserClickEvent() {
        chrome.browserAction.onClicked.addListener(function () {
            chrome.tabs.executeScript({
                file: 'script/pageAction.js'
            });
        });
    }());


    // 与contentscript通信控制器
    chrome.extension.onRequest.addListener(
        function (request, sender, sendResponse) {

            if (request.action === 'blank') {
                chrome.tabs.create({
                    index: sender.tab.index + 1,
                    url: request.url
                });
                sendResponse({status: 0});
            }
            else {
                sendResponse({status: 1}); // snub them.
            }
        }
    );


})();
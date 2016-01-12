/**
 * @file 在background中需要对content页面进行操作的action
 * @author mj (zoumiaojiang@gmail.com)
 */

(function () {

    /**
     * 点击browser action的按钮出发的事件
     */
     function onBrowserActionClick() {

        $wapper = $('.cp-gs-wapper');

        if ($wapper.hasClass('cp-gs-show')) {
            $wapper.removeClass('cp-gs-show');
        }
        else {
            $wapper.addClass('cp-gs-show');
        }
    };

    // 这个页面是在background中用executeScript file方法执行的,所以需要自己手动的执行一遍事件句柄
    onBrowserActionClick();

})();
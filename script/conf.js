/**
 * @file 插件用到的一些配置项
 * @author mj (zoumiaojiang@gmail.com)
 */


(function (root) {


    var conf = {

        // 设置是不是需要console对象的log日志
        VERBOSE_DEBUG: true,

        // 图片上传接口
        UPLOAD_IMAGE_URL: 'http://graph.baidu.com/upload',

        // https环境下的图片上传接口
        HTTPS_UPLOAD_IMAGE_URL: 'https://sp0.baidu.com/-aYHfD0a2gU2pMbgoY3K/upload',

        // 图片展示页面的访问地址
        SHOW_RESULT_URL: 'http://www.baidu.com/imgsearch',

        // 插件标识
        EXTENTIONS_TN: 'pc_js'
    };

    root.CONF = conf;

})(this);
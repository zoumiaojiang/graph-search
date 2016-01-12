/**
 * @file 初始化页面中的图像搜索入口的控件
 * @author mj (zoumiaojiang@gmail.com)
 */

(function () {

    /**
     * 图搜组件对象
     *
     * @type {Object}
     */
    var graph = {};

    var dragUrl = '';


    /**
     * 构造dom结构
     *
     * @return {string} html片段
     */
    function buildHtml() {

        var html = ''
            + '<div class="cp-gs-wapper">'
            +     '<div class="cp-gs-main" '
            +         'style="background:url(' + chrome.extension.getURL('images/upload.png')+ ') no-repeat center;"'
            +     '>'
            +         '<div class="cp-gs-input-wrap">'
            +             '<input type="file" name="image" accept="image/*" id="upload"/>'
            +         '</div>'
            +         '<p>点击此区域或拖拽图片至此处</p>'
            +     '</div>'
            + '</div>'
        ;
        return html;
    }


    /**
     * loading object
     *
     * @type {Object}
     */
    var loading = {

        /**
         * 初始化loading
         *
         * @param  {Object} opts 配置参数
         */
        init: function (opts) {
            var loading = ''
                + '<div class="cp-gs-loading" style="display:none;">'
                +     '<img src="' + opts.img + '">'
                +     '<p>' + opts.text + '</p>'
                + '</div>'
            $(document.body).append(loading);
            this.initMask();
        },


        /**
         * 初始化mask
         */
        initMask: function () {
            var mask = '<div class="cp-gs-mask" style="display:none;"></div>';
            $(document.body).append(mask);

            $('.cp-gs-mask').on('click', function () {
                loading.hide();
            });
        },


        /**
         * 显示loading
         */
        show: function () {
            $('.cp-gs-mask').show();
            $('.cp-gs-loading').show();
        },


        /**
         * 隐藏loading
         */
        hide: function () {
            $('.cp-gs-mask').hide();
            $('.cp-gs-loading').hide();
        }

    };


    /**
     * 验证文件
     *
     * @param  {Object} file 文件对象
     * @return {Boolean}     验证结果
     */
    function validate(file) {
        if (!file.type) {
            return false;
        }
        return true;
    }


    /**
     * 上传成功
     *
     * @param  {Object} data  上传成功的数据
     */
    function uploadComplete(res) {

        loading.hide();

        if (res) {
            if (+res.status !== 0) {
                alert('sorry, 没找到图片url或文件, 或者此图片做了防抓取限制。');
            }
            else if (res.command && +res.command.mode === 2 && res.data) {

                // 发送message让background新开标签
                
                chrome.extension.sendRequest(
                    {
                        action: 'blank',
                        url: CONF.SHOW_RESULT_URL
                            + '?sign=' + encodeURIComponent(res.data.sign)
                            + '&wd=' + encodeURIComponent(res.data.wd)
                            + '&tn=' + CONF.EXTENTIONS_TN
                    },
                    function (response) {}
                );
            }
        }

    };


    /**
     * 发送ajax
     *
     * @param  {Object} data ajax参数数据
     * @param  {number} type ajax上传类型1: file, 0: url
     */
    function doAjax(data, type) {

        var param = {
            url: location.protocol.indexOf('https') > -1 ? CONF.HTTPS_UPLOAD_IMAGE_URL : CONF.UPLOAD_IMAGE_URL,
            type: 'POST',
            dataType: 'json',
            async: true,
            data: data,
            crossDomain: true,
            success: function (data) {
                uploadComplete(data);
            },
            error: function (data) {
                alert('上传出错...');
                loading.hide();
            }
        };
        if (type) {
            param.processData = false;
            param.contentType = false;
        }
        $.ajax(param);
    }


    function handleDrop(e) {
        var items;
        var dataTransfer;

        if (e.dataTransfer) {
            dataTransfer = e.dataTransfer;
        }
        else if (e.originalEvent.dataTransfer) {
            dataTransfer = e.originalEvent.dataTransfer;
        }

        items = dataTransfer.files;
        if (!items || items.length === 0) {
            if (dragUrl) {
                uploadUrl(dragUrl);
            }
            else {
                var url;
                try {
                    url = dataTransfer.getData('text/plain') || dataTransfer.getData('text/uri-list');
                }
                catch (err) {
                    url = dataTransfer.getData('Text') || dataTransfer.getData('URL');
                }
                if (url) {
                    uploadUrl(url);
                }
                else {
                }
            }
            dragUrl = '';
            return;
        }

        uploadFile(items[0]);
    }


    function uploadUrl(url) {
        loading.show();
        var data = {
            image: url,
            tn: CONF.EXTENTIONS_TN
        };
        doAjax(data);
    }


    function uploadFile(file) {
        var formData = new FormData();
        if (!validate(file)) {
            alert('文件类型不对...');
            return;
        }
        formData.append('image', file);
        formData.append('tn', CONF.EXTENTIONS_TN);
        doAjax(formData, 1);
    }

    function stopDefaultEvent(e) {
        e.stopPropagation && e.stopPropagation();
        e.preventDefault && e.preventDefault();
    }

    /**
     * 绑定组件的一些事件
     */
    function bindEvent() {

        function onFileChange(e) {
            $('.cp-gs-input-wrap').html('<input type="file" name="image" accept="image/*" id="upload"/>');
            $('.cp-gs-main input').on('change', onFileChange);
            loading.show();

            uploadFile(this.files[0]);
        };

        $('.cp-gs-main input').on('change', onFileChange);

        var wrap = $('.cp-gs-wapper');

         $(document).on('dragstart', function (e) {
            var target = e.target || e.srcElement;
            var nodeName = target.nodeName.toLowerCase();
            if (nodeName === 'img') {
                dragUrl = target.src;
            }
            else if (nodeName === 'a') {
                var imgs = $(target).parent().find('img');
                if (imgs.length) {
                    dragUrl = imgs[0].src;
                }
            }

        });

        $(document).on('dragover', function () {
        });

        $(document).on('dragleave', function () {
        });

        wrap.on('dragover', function (e) {
            stopDefaultEvent(e);
        });

        wrap.on('dragleave', function (e) {
            stopDefaultEvent(e);
        });

        wrap.on('drop', function (e) {
            stopDefaultEvent(e);
            handleDrop(e);
        });
    }


    /**
     * 初始化组件
     */
    graph.init = function () {
        var me = this;
        me.render();
        bindEvent.call(me);
    };


    /**
     * 组件的渲染
     */
    graph.render = function () {
        var me = this;
        $('body').append(buildHtml.call(me));
        me.wapper = $('.cp-gs-wapper')[0];

        loading.init({
            img: chrome.extension.getURL('images/loading.gif'),
            text: '正在上传...'
        });
    };

    chrome.extension.onRequest.addListener(
        function (request, sender, sendResponse) {
            if (request.action === 'loadingshow') {
                loading.show();
                sendResponse({status: 0});
            }
            else if (request.action === 'loadinghide') {
                loading.hide();
                sendResponse({status: 0});
            }
            else {
                sendResponse({status: 1}); // snub them.
            }
        }
    );

    graph.init();

})();
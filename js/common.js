jQuery(function ($) {
    var Common = {

        toastr: function (options) {
            // 移除之前的
            $('.toastr').remove();
            // 添加新的
            var config = {
                    content: options.content || "这是一个提示",
                    pos: options.pos || "bottom",
                    delay: options.delay || 1000
                },
                str = '<div class="toastr"><p>' + config.content + '</p></div>';
            $('body').append(str);

            var Toastr = $('.toastr'),
                setValue = {};


            if (config.pos === "bottom") {
                setValue = {
                    bottom: "10%"
                };
            } else if (config.pos === "center") {
                setValue = {
                    top: "40%"
                };
            } else if (config.pos === "top") {
                setValue = {
                    bottom: "10%"
                };
            } else {
                setValue = {
                    top: config.pos
                };
            }

            if (Number(config.delay)) {
                Toastr.css(setValue).fadeIn().delay(config.delay).fadeOut(300, function () {
                    $(this).remove();
                });
            } else if (config.delay == 'fixed') {
                Toastr.css(setValue).fadeIn();
            }


        },

        footer: function (_$) {
            _$().css('min-height', $(window).height());
            _$('footer').length && _$('footer').show();
        },

        feedback: function (ele) {
            ele.on('click', function () {
                if (!$('#feedbackBox').length) {
                    var str = '<div id="feedbackBox"><div class="feedback-body"><textarea placeholder="请输入你的问题和建议"></textarea>' +
                        '<input type="number" placeholder="请留下你的QQ/电话"><div class="submit">提交</div></div><div class="feedback-mask"></div></div>';
                    $('body').append(str);
                } else {
                    $('#feedbackBox').show();
                }
            });

            $(document).on('tap', '.feedback-mask', function () {
                $('#feedbackBox').hide();
            })
        },
        comment: function (ele, state, callback) {
            ele.on('click', function () {
                // 判断是否登录
                if (state) {
                    if (!$('#commentBox').length) {
                        var str = '<div id="commentBox"><div class="comment-body"><textarea placeholder="请输入你的评论"></textarea>' +
                            '<div class="submit">发表</div></div><div class="comment-mask"></div></div>';
                        $('body').append(str);
                    } else {
                        $('#commentBox').show();
                    }
                } else {
                    callback();
                }
            });

            $(document).on('tap', '.comment-mask', function () {
                $('#commentBox').hide();
            })
        },
        verifyData: function (data) {
            if (data.code == 200) {
                return true;
            } else if (data.code == 10001) {
                window.Common.toastr({
                    content: data.msg,
                    pos: "top"
                });
                /*setTimeout(function () {
                 window.location.href = window.Common.domain + '/console/user/login';
                 }, 1000);*/
                return false;
            } else {
                window.Common.toastr({
                    content: data.msg
                });
                return false;
            }
            return true
        },
        addDprAttr: function () {
            var dpr = window.devicePixelRatio || 1;
            $('html').attr('data-dpr', dpr);
        },

        domain: 'http://uliao.news'
    };

    Common.addDprAttr();

    window.Common = Common
});

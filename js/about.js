/**
 * Created by zhupengcheng on 2016/10/10.
 */
$(function () {

    var _$ = function (arg) {
            var ele = $('#About');
            return arg ? ele.find(arg) : ele
        },
        About = {
            init: function () {
                window.Common.footer(_$);
                this.feedback();
            },
            feedback: function () {
                window.Common.feedback(_$('.feedback'));
                $(document).on('tap', '#feedbackBox .submit', function () {
                    var feedbackBox = $('#feedbackBox'),
                        contentVal = feedbackBox.find('textarea').val(),
                        connectVal = feedbackBox.find('input').val();
                    if (contentVal) {
                        if(contentVal.length < 512){
                            if(contentVal.length > 3){
                                if (connectVal) {
                                    if(connectVal.length > 4 && connectVal.length < 16){
                                        var url = window.Common.domain + '/wx/feedback/add?content=' + contentVal + '&connect=' + connectVal + '&callback=?';
                                        $.getJSON(url, function (resp) {
                                            if (window.Common.verifyData(resp)) {
                                                feedbackBox.remove();
                                                window.Common.toastr({
                                                    content: '多谢反馈，爱死你了',
                                                    pos: 'center'
                                                })
                                            }
                                        })
                                    }else {
                                        window.Common.toastr({
                                            content: '联系方式长度应在5-15之间',
                                            pos: 'bottom'
                                        })
                                    }
                                } else {
                                    window.Common.toastr({
                                        content: '请输入你的QQ/电话',
                                        pos: 'bottom'
                                    })
                                }
                            }else {
                                window.Common.toastr({
                                    content: '请多写一点点在提交o_o',
                                    pos: 'bottom'
                                })
                            }

                        } else {
                            window.Common.toastr({
                                content: '反馈内容超出最大字符限制',
                                pos: 'bottom'
                            })
                        }

                    } else {
                        window.Common.toastr({
                            content: '请输入你的评论',
                            pos: 'bottom'
                        })
                    }


                })
            }
        };

    About.init()
});
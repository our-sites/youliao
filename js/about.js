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
                window.Common.feedback(_$('.feedback'))
            },

        };

    About.init()
});
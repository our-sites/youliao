/**
 * Created by zhupengcheng on 2016/10/10.
 */
$(function () {

    var _$ = function (arg) {
            var ele = $('#Account');
            return arg ? ele.find(arg) : ele
        },
        Account = {
            init: function () {
                window.Common.footer(_$);
                window.Common.feedback(_$('.feedback'))
            },

        };

    Account.init()
});
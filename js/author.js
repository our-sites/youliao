jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Author');
            return arg ? ele.find(arg) : ele
        },
        Author = {
            init: function () {
                window.Common.footer(_$);
            }

        };

    Author.init()
});
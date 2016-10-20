/**
 * Created by zhupengcheng on 2016/10/10.
 */
$(function () {

    var _$ = function (arg) {
            var ele = $('#Labels');
            return arg ? ele.find(arg) : ele
        },
        Labels = {
            init: function () {

                window.Common.footer(_$);

                this.circlePos();

                this.selectLabels();
            },
            circlePos: function () {
                var rate = $(window).width() / 320;
                _$('div').each(function () {
                    $(this).css({
                        top: Number($(this).css('top').replace('px',''))*rate,
                        left: Number($(this).css('left').replace('px',''))*rate
                    })
                })
            },
            selectLabels: function () {
                _$('div').on('tap', function () {
                    if($(this).hasClass('active')){
                        $(this).removeClass('active')
                    } else {
                        $(this).addClass('active');
                    }

                    if(_$('.active').length === 3){
                        window.location.pathname = '/index.html'
                    }
                })
            }
        };
    Labels.init()
});
jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Labels');
            return arg ? ele.find(arg) : ele
        },
        Labels = {
            init: function () {
                this.initDom();
                window.Common.footer(_$);

                this.circlePos();

                this.selectLabels();
            },
            initDom: function () {
                var jsonData = window.jsonData;
                if (Common.verifyData(jsonData)) {
                    var data = jsonData.data;
                    var recommendData = data.recommend;
                    var normalData = data.normal;
                    var arr = [];
                    arr.push('<div class="yellow circle-1" data-id="' + recommendData[0].cateid + '">' + recommendData[0].catename + '</div>');
                    arr.push('<div class="yellow circle-2" data-id="' + recommendData[1].cateid + '">' + recommendData[1].catename + '</div>');
                    arr.push('<div class="yellow circle-6" data-id="' + recommendData[2].cateid + '">' + recommendData[2].catename + '</div>');
                    arr.push('<div class="yellow circle-7" data-id="' + recommendData[3].cateid + '">' + recommendData[3].catename + '</div>');
                    arr.push('<div class="cyan circle-3" data-id="' + normalData[0].cateid + '">' + normalData[0].catename + '</div>');
                    arr.push('<div class="cyan circle-4" data-id="' + normalData[1].cateid + '">' + normalData[1].catename + '</div>');
                    arr.push('<div class="cyan circle-5" data-id="' + normalData[2].cateid + '">' + normalData[2].catename + '</div>');
                    arr.push('<div class="cyan circle-8" data-id="' + normalData[3].cateid + '">' + normalData[3].catename + '</div>');
                    arr.push('<div class="cyan circle-9" data-id="' + normalData[4].cateid + '">' + normalData[4].catename + '</div>');
                    arr.push('<div class="cyan circle-10" data-id="' + normalData[5].cateid + '">' + normalData[5].catename + '</div>');
                    //_$().prepend(arr.join(''));
                    _$('#tags').html(arr.join(''));
                }
            },
            circlePos: function () {
                var rate = $(window).width() / 375;
                _$('#tags div').each(function () {
                    $(this).css({
                        top: Number($(this).css('top').replace('px', '')) * rate,
                        left: Number($(this).css('left').replace('px', '')) * rate
                    })
                })
            },
            selectLabels: function () {
                _$('#tags div').on('tap', function () {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active')
                    } else {
                        $(this).addClass('active');
                    }
                    var $active = _$('.active');
                    var arr = [];
                    $active.each(function () {
                        arr.push($(this).data('id'));
                    });
                    _$('#ids').val(arr.join(','));
                    if ($active.length === 3) {
                        _$('#form1').get(0).submit();
                        //window.location.pathname = '/index.html'
                    }
                });
            }
        };
    Labels.init()
});
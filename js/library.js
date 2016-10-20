jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Library');
            return arg ? ele.find(arg) : ele
        },
        Library = {
            init: function () {

                this.section();

                this.delItem();

                window.Common.footer(_$);

                this.testLoading();
            },
            section: function () {
                var section = _$('section'),
                    Body = $('body');
                console.log(Body.height());

                section.on('scrollstart', function (e) {
                    console.log('scrollstart' + Body.scrollTop());
                });



                section.on('touchend', function (e) {
                    console.log('touch---' + Body.scrollTop());
                })


            },

            delItem: function () {
                // 左滑显示
                $(document).on('swipeleft','section .item', function () {
                    $(this).animate({
                        left: "-80px"
                    },200);

                });
                // 右滑隐藏
                $(document).on('swiperight','section .item', function () {
                    $(this).animate({
                        left: 0
                    },200);
                });
                // 删除
                $(document).on('tap','section .del', function () {
                    window.Common.toastr({
                        content: '资源已下架',
                        pos: "bottom"
                    })
                });
            },
            testLoading: function () {
                var section = _$('section'),
                    loading = _$('.loading-big');
                section.hide();
                loading.show();
                setTimeout(function () {
                    loading.hide();
                    section.show();
                },3000)
            }
        };

    Library.init()
});
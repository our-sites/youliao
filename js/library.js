jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Library');
            return arg ? ele.find(arg) : ele
        },
        Library = {
            init: function () {
                window.Common.footer(_$);
                this.loadContent();
                this.delItem();
                this.storePage();


            },
            loadContent: function () {
                window.libraryPageNum = window.libraryPageNum ? window.libraryPageNum : 1;
                var that = this,
                    nav = _$('nav'),
                    section = _$('section'),
                    ul = section.find('ul'),
                    loadingBig = _$('.loading-big'),
                    noDataTip = _$('.no-data-tip'),
                    loading = '<div class="loading-small"><div class="loading-icon"><div class="loading-curve"></div></div>页面加载中...</div>',
                    successFun = function (data, me) {
                        if (window.Common.verifyData(data)) {
                            var listData = data.data,
                                _html = '';
                            if (data.data.length) {
                                for (var x in listData) {
                                    var detail = window.Common.domain + '/wx/article/detailapi',
                                        id = listData[x]['id'],
                                        href = detail + '?id=' + id,
                                        src = listData[x]['cover'],
                                        title = listData[x]['title'],
                                        view = (Number(listData[x]['viewnum']) > 10*10000) ?　'100000+' : listData[x]['viewnum'],
                                        author = listData[x]['actname'];
                                    _html += '<li><div class="item clf"><a data-href="' + href + '" href="javascript:;"><img src="' + src + '" alt="">' +
                                        '<h4>' + title + '</h4><p><span class="author">' + author +
                                        '</span><span class="page-view"><img src="http://yl-static.b0.upaiyun.com/img/eyes.png" width="17" height="12">' +
                                        view + '</span></p></div></a><div class="del" data-id="' + id + '">删除</div></li>';
                                }


                                loadingBig.hide();
                                noDataTip.hide();
                                section.show();
                                ul.append(_html);
                                window.libraryPageNum += 1;

                                var maxWidth = _$('section li h4').width()
                                    - parseInt(_$('section li .author').css('margin-right'))
                                    - parseInt(_$('section li .page-view').css('max-width'));
                                _$('section li .author').css('max-width',maxWidth);

                                that.dropload.resetload();
                                me.unlock();
                                me.noData(false);
                            } else {
                                me.lock('down');
                                me.noData();
                                that.dropload.resetload();
                                if(ul.find('li').length == 0){
                                    loadingBig.hide();
                                    section.hide();
                                    noDataTip.show();
                                }
                            }

                        }
                    };

                that.dropload = section.dropload({
                    scrollArea: window,
                    autoLoad: window.library.autoLoad,
                    domDown: {
                        domClass: 'dropload-down',
                        domLoad: loading,
                        domNoData: '<div class="dropload-noData" style="background-color: #f3f3f3;"></div>'
                    },
                    loadDownFn: function (me) {
                        // var url = window.Common.domain + '/wx/collect/list?page=' + window.libraryPageNum + '&callback=?';
                        var url = window.Common.domain + '/wx/collect/list?page=' + window.libraryPageNum + '&uid=1&callback=?'; //开发环境
                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            success: function (data) {
                                successFun(data, me);
                            },
                            error: function (xhr, type) {
                                that.dropload.resetload();
                            }
                        });
                    }
                });
            },

            delItem: function () {
                // 左滑显示
                $(document).on('swipeleft', 'section .item', function () {
                    $(this).animate({
                        left: "-80px"
                    }, 200);

                });
                // 右滑隐藏
                $(document).on('swiperight', 'section .item', function () {
                    $(this).animate({
                        left: 0
                    }, 200);
                });
                // 删除
                $(document).on('click', 'section .del', function () {
                    var id = $(this).data('id'),
                        url = window.Common.domain + '/wx/collect/collect?id=' + id + '&callback=?',
                        Li = $(this).closest('li');
                    Li.slideUp(500, function () {
                        $.getJSON(url, function (resp) {
                            if (window.Common.verifyData(resp)) {
                                resp.data || window.Common.toastr({
                                    content: '取消收藏成功',
                                    pos: "bottom"
                                });
                                Li.remove();
                            } else {
                                Li.show();
                            }
                        });
                    });


                });
            },

            storePage: function () {
                $(document).on('click', 'section li a', function (e) {
                    e.preventDefault();
                    $(this).hasClass('visited') || $(this).addClass('visited');

                    _$('section').find('.dropload-down').remove();
                    var obj = {
                        pageNum: window.libraryPageNum,
                        section: _$('section').html(),
                        scrollTop: $('body').scrollTop()
                    };
                    sessionStorage.setItem('library', JSON.stringify(obj));
                    location.href = $(this).data('href');
                    //location.href = 'http://127.0.0.1:8888/article.html' // 开发环境
                })
            },

        };

    Library.init()
});

jQuery(function($) {

    var _$ = function(arg) {
            var ele = $('#Library');
            return arg ? ele.find(arg) : ele
        },
        Library = {
            init: function() {
                this.loadContent();
                this.delItem();
                window.Common.footer(_$);

            },
            loadContent: function() {
                var that = this,
                    nav = _$('nav'),
                    section = _$('section'),
                    Body = $('body'),
                    num = 1,
                    loading = '<div class="loading-small"><div class="loading-icon"><div class="loading-curve"></div></div>页面加载中...</div>',
                    successFun = function(data, me, type) {
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
                                        view = listData[x]['viewnum'],
                                        author = listData[x]['actname'];
                                    _html += '<li><div class="item clf"><a href="' + href + '"><img src="' + src + '" alt="">' +
                                        '<h4>' + title + '</h4><p><span class="author">' + author + '</span><span class="page-view">' +
                                        view + '</span></p></div><div class="del" data-id="' + id + '">删除</div></a></li>';
                                }
                                _$('.loading-big').hide();
                                section.show();

                                if (type == 'refresh') {
                                    section.find('ul').html(_html);
                                    num = 1;
                                } else if (type == 'add') {
                                    section.find('ul').append(_html);
                                    num += 1;
                                } else {
                                    console.log('not a valid type')
                                }

                                that.dropload.resetload();
                                me.unlock();
                                me.noData(false);
                            } else {
                                me.lock('down');
                                me.noData();
                                that.dropload.resetload();
                            }

                        }
                    };

                that.dropload = section.dropload({
                    scrollArea: window,
                    /*domUp: {
                        domClass: 'dropload-up',
                        domLoad: loading
                    },*/
                    domDown: {
                        domClass: 'dropload-down',
                        domLoad: loading,
                        domNoData: '<div class="dropload-noData">暂无数据</div>'
                    },
                    /*loadUpFn: function (me) {
                        $.ajax({
                            type: 'GET',
                            url: window.Common.domain + '/wx/collect/list?page=1&callback=?',
                            dataType: 'json',
                            success: function (data) {
                                successFun(data, me, 'refresh');
                            },
                            error: function (xhr, type) {
                                that.dropload.resetload();
                            }
                        });
                    },*/
                    loadDownFn: function(me) {
                        $.ajax({
                            type: 'GET',
                            url: window.Common.domain + '/wx/collect/list?page=' + num + '&callback=?',
                            dataType: 'json',
                            success: function(data) {
                                successFun(data, me, 'add');
                            },
                            error: function(xhr, type) {
                                that.dropload.resetload();
                            }
                        });
                    }
                });
            },

            delItem: function() {
                // 左滑显示
                $(document).on('swipeleft', 'section .item', function() {
                    $(this).animate({
                        left: "-80px"
                    }, 200);

                });
                // 右滑隐藏
                $(document).on('swiperight', 'section .item', function() {
                    $(this).animate({
                        left: 0
                    }, 200);
                });
                // 删除
                $(document).on('tap', 'section .del', function() {
                    var id = $(this).data('id'),
                        url = window.Common.domain + '/wx/collect/collect?id=' + id + '&callback=?',
                        Li = $(this).closest('li');
                    Li.slideUp(500, function() {
                        $.getJSON(url, function(resp) {
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

        };

    Library.init()
});

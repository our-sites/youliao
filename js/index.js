jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Index');
            return arg ? ele.find(arg) : ele
        },
        Index = {
            init: function () {
                this.navSwipe();

                this.loadContent();

                window.Common.footer(_$);
            },
            preload: '',
            navSwipe: function () {
                var that = this,
                    Nav = _$('nav'),
                    Ul = Nav.find('ul'),
                    Plus = Nav.find('.plus'),
                    Body = $('body'),
                    rate = 1.2,
                    boursLength = 20,
                    limitWidth = Nav.width() - Plus.width();

                // 取得ul的真实宽度
                var width = 0,
                    Li = Ul.find('li'),
                    Padding = Number(Li.css('padding-left').replace('px', '')) * 2,
                    Margin = Number(Li.css('margin-left').replace('px', ''));
                Li.each(function () {
                    width += $(this).width() + Padding + Margin
                });

                // 设置ul的宽度 使所有li在一行显示
                Ul.css('width', width);
                // console.log(width);

                Ul.on('vmouseover', function (e) {
                    Ul.data('x', e.pageX)
                });

                // 滑动
                Ul.on('vmousemove', function (e) {
                    var distance = Ul.data('x') - e.pageX,
                        left = Ul.css('left').slice(0, Ul.css('left').length - 2),
                        finalLeft = 0;
                    if (distance < 0) {
                        // 左滑 ←
                        finalLeft = left - distance * rate;
                        // 如果已经是最左
                        if (finalLeft > boursLength) {
                            finalLeft = boursLength
                        }

                    } else {
                        // 右滑 →
                        // 如果有隐藏的项
                        if (width > limitWidth) {
                            finalLeft = left - distance * rate;
                            // 如果已经是最右
                            if (limitWidth - width - boursLength > finalLeft) {
                                finalLeft = limitWidth - width - boursLength;
                            }
                        } else {
                            finalLeft = 0
                        }
                    }

                    // 滑动
                    Ul.css('left', finalLeft);


                    setTimeout(function () {
                        if (finalLeft > 0) {
                            Ul.css('left', 0);
                        } else if (limitWidth - width > finalLeft) {
                            Ul.css('left', limitWidth - width);
                        }
                    }, 300);


                });

                // 初始化一些值
                Ul.find('li').each(function () {
                    var key = 'tabs' + $(this).data('id');
                    that[key] = false;
                });

                // 点击
                Ul.find('li').on('tap', function () {
                    var cateId = $(this).data('id'),
                        el = 'ul[data-id="' + cateId + '"]',
                        key = 'tabs' + cateId,
                        section = _$('section');

                    var oldCateId = $(this).siblings('.active').data('id'),
                        oldEl = 'ul[data-id="' + oldCateId + '"]',
                        oldKey = 'tabs' + oldCateId;

                    $(this).addClass('active').siblings('li').removeClass('active');


                    // section.find(oldEl).data('scrolltop', Body.scrollTop());

                    section.hide();
                    _$('.loading-big').show();

                    section.find(el).show().siblings('ul').hide();

                    // Body.scrollTop(section.find(el).data('scrolltop') || 0);


                    /*if (that[key]) {
                     // 锁定
                     that.dropload.lock();
                     that.dropload.noData();
                     } else {
                     // 解锁
                     that.dropload.unlock();
                     that.dropload.noData(false);
                     }*/
                    // 重置
                    that.dropload.unlock();
                    that.dropload.noData(false);
                    that.dropload.resetload();
                });

                //添加
                Plus.on('tap', function () {
                    var str = '<div id="tagsBox"><div class="tags-body"><p class="clf"><span class="close">&times;</span></p>' +
                        '<div class="my"><h5>我的频道 <span class="edit">编辑</span><span class="success">完成</span></h5><div class="my-content">' +
                        '</div></div><div class="more"><h5>点击添加更多频道</h5>' +
                        '</div></div><div class="mask"></div></div>';
                })
            },
            loadContent: function () {
                var that = this,
                    section = _$('section'),
                    Body = $('body'),
                    url = window.Common.domain + '/wx/article/interest' + '?callback=?',
                    loading = '<div class="loading-small"><div class="loading-icon"><div class="loading-curve"></div></div>页面加载中...</div>',
                    successFun = function (data, me, cateId, type, preload) {
                        if (window.Common.verifyData(data)) {
                            var listData = data.data.list,
                                key = 'tabs' + cateId,
                                el = 'ul[data-id="' + cateId + '"]',
                                _html = '';
                            for (var x in listData) {
                                var detail = window.Common.domain + '/wx/article/detailapi',
                                    href = detail + '?id=' + listData[x]['id'],
                                    src = listData[x]['cover'],
                                    title = listData[x]['title'],
                                    view = listData[x]['viewnum'],
                                    author = listData[x]['actname'];
                                _html += '<li><a href="' + href + '"><img src="' + src + '" alt=""><h4>' + title + '</h4>' +
                                    '<p><span class="author">' + author + '</span><span class="page-view">' + view + '</span>' +
                                    '</p></a></li>';
                            }
                            if (preload) {
                                that.preload = _html;
                                console.log('preload is true');
                            } else {
                                // 隐藏loading
                                _$('.loading-big').hide();
                                // 删除之前的refresh-node
                                section.find('.refresh-node').remove();
                                // 判断是prepend 还是append
                                if (type == 'prepend') {
                                    _html += '<div class="refresh-node">刚刚看到这里，点击刷新</div>';
                                    section.show().find(el).prepend(_html);
                                } else if (type == 'append') {
                                    section.show().find(el).append(_html);
                                } else {
                                    console.log('choose the type first')
                                }
                                // that[key] = true;
                                that.dropload.resetload();
                                me.unlock();
                                me.noData(false);
                            }

                        }
                    };

                that.dropload = section.dropload({
                    scrollArea: window,
                    domUp: {
                        domClass: 'dropload-up',
                        domLoad: loading
                    },
                    domDown: {
                        domClass: 'dropload-down',
                        domLoad: loading,
                    },
                    loadUpFn: function (me) {
                        var cateId = _$('nav').find('li.active').data('id');

                        if (cateId == 0) {
                            url = window.Common.domain + '/wx/article/interest' + '?callback=?';
                        } else {
                            url = window.Common.domain + '/wx/article/cate?cateid=' + cateId + '&uid=1' + '&callback=?';
                            // url = window.Common.domain + '/wx/article/cate?cateid=' + cateId + '&callback=?';
                        }

                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            success: function (data) {
                                successFun(data, me, cateId, 'prepend');
                                // me.$domUp.css("height", 0);
                            },
                            error: function (xhr, type) {
                                that.dropload.resetload();
                            }
                        });
                    },
                    loadDownFn: function (me) {
                        var cateId = _$('nav').find('li.active').data('id');

                        if (cateId == 0) {
                            url = window.Common.domain + '/wx/article/interest' + '?callback=?';
                        } else {
                            url = window.Common.domain + '/wx/article/cate?cateid=' + cateId + '&uid=1' + '&callback=?';
                            // url = window.Common.domain + '/wx/article/cate?cateid=' + cateId + '&callback=?';
                        }

                        // 正常请求
                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            success: function (data) {
                                successFun(data, me, cateId, 'append');
                            },
                            error: function (xhr, type) {
                                that.dropload.resetload();
                            }
                        });

                        if (that.preload) {
                            // 隐藏loading
                            _$('.loading-big').hide();
                            // 删除之前的refresh-node
                            section.find('.refresh-node').remove();
                            // append
                            section.show().find('ul[data-id="' + cateId + '"]').append(that.preload);

                            that.preload = '';

                            // 预加载
                            $.ajax({
                                type: 'GET',
                                url: url,
                                dataType: 'json',
                                success: function (data) {
                                    successFun(data, me, cateId, 'append', true);
                                },
                                error: function (xhr, type) {
                                    that.dropload.resetload();
                                }
                            });

                            that.dropload.resetload();
                            me.unlock();
                            me.noData(false);
                        } else {
                            // 预加载
                            $.ajax({
                                type: 'GET',
                                url: url,
                                dataType: 'json',
                                success: function (data) {
                                    successFun(data, me, cateId, 'append', true);
                                },
                                error: function (xhr, type) {
                                    that.dropload.resetload();
                                }
                            });
                        }

                    }
                });

            },
            refreshNode: function () {
                var refresh = _$('.refresh-node');
                refresh.on('tap', function () {
                    
                })
            }
        };

    Index.init()
});

/**
 * Created by zhupengcheng on 2016/10/10.
 */
$(function() {

    var _$ = function(arg) {
            var ele = $('#Index');
            return arg ? ele.find(arg) : ele
        },
        Index = {
            init: function() {
                this.navSwipe();

                this.loadContent();

                window.Common.footer(_$);
            },
            navSwipe: function() {
                var that = this,
                    Nav = _$('nav'),
                    Ul = Nav.find('ul'),
                    Plus = Nav.find('.plus'),
                    Body = $('body'),
                    limitWidth = Nav.width() - Plus.width();

                // 取得ul的真实宽度
                var width = 0,
                    Li = Ul.find('li'),
                    Padding = Number(Li.css('padding-left').replace('px', '')) * 2,
                    Margin = Number(Li.css('margin-left').replace('px', ''));
                Li.each(function() {
                    width += $(this).width() + Padding + Margin
                });

                // console.log(width);

                // 滑动
                Ul.on('swipe', function(e) {
                    var distance = e.swipestart.coords[0] - e.swipestop.coords[0],
                        left = Ul.css('left').slice(0, Ul.css('left').length - 2),
                        finalLeft = 0;
                    if (distance < 0) {
                        // 左滑 ←
                        finalLeft = left - distance * 2;

                        // 如果已经是最左
                        if (finalLeft > 0) {
                            finalLeft = 0
                        }


                    } else {
                        // 右滑 →
                        // 如果有隐藏的项
                        if (width > limitWidth) {
                            finalLeft = left - distance * 2;
                            // 如果已经是最右
                            if (limitWidth - width > finalLeft) {
                                finalLeft = limitWidth - width
                            }
                        } else {
                            finalLeft = 0
                        }
                    }

                    // 滑动
                    Ul.animate({
                        left: finalLeft
                    }, 200);
                    // console.log(left - distance*2);
                    // console.log(left);
                    // console.log(Ul.width());
                    // console.log(e.swipestop. coords[0] - e.swipestart. coords[0]);
                });

                // 初始化一些值
                Ul.find('li').each(function() {
                    var key = 'tabs' + $(this).data('id');
                    that[key] = false;
                });

                // 点击
                Ul.find('li').on('tap', function() {

                    var cateId = $(this).data('id'),
                        el = 'ul[data-id="' + cateId + '"]',
                        key = 'tabs' + cateId;

                    var oldCateId = $(this).siblings('.active').data('id'),
                        oldEl = 'ul[data-id="' + oldCateId + '"]',
                        oldKey = 'tabs' + cateId;

                    $(this).addClass('active').siblings('li').removeClass('active');

                    _$('section').find(oldEl).data('scrolltop', Body.scrollTop());
                    _$('section').find(el).show().siblings('ul').hide();
                    Body.scrollTop(_$('section').find(el).data('scrolltop') || 0);


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
                Plus.on('tap', function() {
                    var str = '<div id="tagsBox"><div class="tags-body"><p class="clf"><span class="close">&times;</span></p>' +
                        '<div class="my"><h5>我的频道 <span class="edit">编辑</span><span class="success">完成</span></h5><div class="my-content">' +
                        '</div></div><div class="more"><h5>点击添加更多频道</h5>' +
                        '</div></div><div class="mask"></div></div>';
                })
            },
            loadContent: function() {
                var that = this,
                    section = _$('section'),
                    Body = $('body'),
                    url = window.Common.domain + '/wx/article/interest' + '?callback=?',
                    loading = '<div class="loading-small"><div class="loading-icon"><div class="loading-curve"></div></div>页面加载中...</div>',
                    successFun = function(data, me, cateId) {
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
                                _html += '<li><a href="' + href + '" class="img-box"><img src="' + src + '" alt=""></a>' +
                                    '<h4><a href="' + href + '">' + title + '</a></h4><p><span class="author">' + author +
                                    '</span><span class="page-view">' + view + '</span></p></li>';
                            }
                            section.find(el).html(_html);
                            that[key] = true;
                            that.dropload.resetload();
                            me.unlock();
                            me.noData(false);


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
                    loadUpFn: function(me) {
                        var cateId = _$('nav').find('li.active').data('id');

                        if (cateId == 0) {
                            url = window.Common.domain + '/wx/article/interest' + '?callback=?';
                        } else {
                            url = window.Common.domain + '/wx/article/cate?cateid=' + cateId + '&uid=1' + '&callback=?';
                        }

                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            success: function(data) {
                                successFun(data, me, cateId);
                                me.$domUp.css("height", 0);
                            },
                            error: function(xhr, type) {
                                that.dropload.resetload();
                            }
                        });
                    },
                    loadDownFn: function(me) {
                        var cateId = _$('nav').find('li.active').data('id');

                        if (cateId == 0) {
                            url = window.Common.domain + '/wx/article/interest' + '?callback=?';
                        } else {
                            url = window.Common.domain + '/wx/article/cate?cateid=' + cateId + '&uid=1' + '&callback=?';
                        }

                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            success: function(data) {
                                successFun(data, me, cateId);
                                Body.scrollTop(0);
                            },
                            error: function(xhr, type) {
                                that.dropload.resetload();
                            }
                        });
                    }
                });


            }
        };

    Index.init()
});

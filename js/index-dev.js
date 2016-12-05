jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Index');
            return arg ? ele.find(arg) : ele
        },
        Index = {
            init: function () {
                // 初始化数据
                this.initData();

                // nav的左右滑动/点击跳转效果/新增效果
                this.navSwipe();

                this.horizontalSwipe();

                this.loadContent();

                this.refreshNode();

                this.storePage();

                window.Common.footer(_$);
            },
            initData: function () {
                var that = this,
                    Nav = _$('nav'),
                    section = _$('.list');

                // 窗口的宽度
                that.screenWidth = _$().width();

                // 用于存储预加载的数据
                that.preload = {};


                // 所有频道的id :用于预加载 关闭定时器
                that.cateIds = [];
                Nav.find('li').each(function () {
                    that.cateIds.push($(this).data('id'))
                });


                //列表父级盒子section的滚动数值为0
                section.data('translate', section.data('translate') || 0);


                // 各个列表 下拉、上滑加载 方法对象
                that.droploadObj = {};
                // 数据对象
                that.droploadData = {};
                // 当前cateid
                that.currentsCateId = Nav.find('li.active').data('id');

                //定时器
                that.timer = {};


            },
            navSwipe: function () {
                var that = this,
                    Nav = _$('nav'),
                    Ul = Nav.find('ul'),
                    Plus = Nav.find('.plus'),
                    Body = $('body'),
                    section = _$('.list'),
                    loading = _$('.loading-big');

                /*
                 *  左右滑动效果
                 *
                 *  使用滚动条实现 ul.width = n*li.width
                 * */

                // 取得li的真实宽度
                var width = 0,
                    Li = Ul.find('li'),
                    Padding = Number(Li.css('padding-left').replace('px', '')) * 2,
                    Margin = Number(Li.css('margin-left').replace('px', ''));
                Li.each(function () {
                    width += $(this).width() + Padding + Margin
                });

                // 单个li的宽度
                that.navLiWidth = Li.eq(0).width() + Padding + Margin;

                // 设置ul的宽度
                Ul.css('width', width + 15);

                that.navUlWidth = width + 15;

                /*
                 *
                 * 点击切换频道
                 *
                 * */
                Ul.find('li').each(function (idx) {
                    var _t = $(this);
                    _t.on('click', function () {
                        var oldCateId = _t.siblings('.active').data('id'),
                            oldEl = '[data-id="' + oldCateId + '"]';

                        var cateId = _t.data('id'),
                            el = '[data-id="' + cateId + '"]';


                        // nav样式
                        _t.addClass('active').siblings('li').removeClass('active');


                        // 显示当前分类
                        var mathResult = -idx * that.screenWidth,
                            cssResult = 'translate3d(' + mathResult + 'px, 0px ,0px) translateZ(0px)';
                        section.css('-webkit-transform', cssResult).data('translate', mathResult);


                        // 设置currentsCateId
                        that.currentsCateId = cateId;

                        // 判断当前分类是否有内容，如果没有，显示loading
                        if (section.find(el).find('li').length) {
                            loading.hide();
                            // 重置
                            that.droploadObj[cateId].unlock();
                            that.droploadObj[cateId].noData(false);
                            that.droploadObj[cateId].resetload();
                        } else {
                            loading.show();
                            that.droploadObj[cateId].opts.loadUpFn(that.droploadObj[cateId]);
                            // 预加载
                            that.preloadTimer(cateId);
                        }


                    });
                })


            },
            loadContent: function () {
                var that = this,
                    Nav = _$('nav'),
                    section = _$('.list'),
                    loadingBig = _$('.loading-big'),
                    Body = $('body'),
                    url = window.Common.domain + '/wx/article/interest' + '?callback=?',
                    loading = '<div class="loading-small"><div class="loading-icon"><div class="loading-curve"></div></div>页面加载中...</div>',
                    authorMaxWidth = function () {
                        var Lis = section.find('li'),
                            maxWidth = Lis.find('h4').width()
                                - parseInt(Lis.find('.author').css('margin-right'))
                                - parseInt(Lis.find('.page-view').css('max-width'));
                        Lis.find('.author').css('max-width', maxWidth);
                    },
                    successFun = function (data, me, cateId, type, preload) {
                        if (window.Common.verifyData(data)) {
                            var listData = data.data.list,
                                el = '[data-id="' + cateId + '"]',
                                _html = '';
                            for (var x in listData) {
                                var detail = window.Common.domain + '/wx/article/detailapi',
                                    href = detail + '?id=' + listData[x]['id'],
                                    src = listData[x]['cover'],
                                    title = listData[x]['title'],
                                    view = (Number(listData[x]['viewnum']) > 10 * 10000) ? '100000+' : listData[x]['viewnum'],
                                    author = listData[x]['actname'];
                                _html += '<li><a data-href="' + href + '" href="javascript:;"><img src="' + src + '" alt=""><h4>' + title + '</h4>' +
                                    '<p><span class="author">' + author +
                                    '</span><span class="page-view"><img src="http://yl-static.b0.upaiyun.com/img/eyes.png" width="17" height="12">' +
                                    view + '</span>' +
                                    '</p></a></li>';
                            }


                            // 如果是预加载
                            if (preload) {
                                that.preload[cateId] = _html;
                            } else {
                                // 隐藏loading
                                loadingBig.hide();
                                // 删除之前的refresh-node
                                section.find('.refresh-node').remove();
                                // 判断是prepend 还是append
                                if (type == 'prepend') {
                                    _html += '<div class="refresh-node">刚刚看到这里，点击刷新</div>';
                                    section.find(el).find('ul').prepend(_html);
                                    Body.scrollTop(0);
                                } else if (type == 'append') {
                                    section.find(el).find('ul').append(_html);
                                } else {
                                    console.log('choose the type first')
                                }
                            }


                            authorMaxWidth();
                            me.resetload();
                            me.unlock();
                            me.noData(false);

                        }
                    };


                section.find('.channel-scroll').each(function () {
                    var self = $(this),
                        cateId = self.parent().data('id');
                    // 绑定事件
                    that.droploadObj[cateId] = self.dropload({
                        autoLoad: window.index.autoLoad ? false : (cateId == '0'),
                        domUp: {
                            domClass: 'dropload-up',
                            domLoad: loading
                        },
                        domDown: {
                            domClass: 'dropload-down',
                            domRefresh: '',
                            domLoad: loading
                        },
                        loadUpFn: function (me) {
                            // var dev = true;
                            var str = dev ? '&uid=1&callback=?' : '&callback=?';
                            that.currentsCateId = cateId = Nav.find('li.active').data('id');
                            url = window.Common.domain + ((cateId == 0) ? '/wx/article/interest' : ('/wx/article/cate?cateid=' + cateId)) + str;
                            $.ajax({
                                type: 'GET',
                                url: url,
                                dataType: 'json',
                                success: function (data) {
                                    successFun(data, me, cateId, 'prepend');
                                },
                                error: function (xhr, type) {
                                    that.droploadObj[cateId].resetload();
                                }
                            });

                            // 预加载
                            // that.preloadTimer(cateId);
                        },
                        loadDownFn: function (me, preload) {
                            // var dev = true;
                            var str = dev ? '&uid=1&callback=?' : '&callback=?';
                            that.currentsCateId = cateId = Nav.find('li.active').data('id');
                            url = window.Common.domain + ((cateId == 0) ? '/wx/article/interest' : ('/wx/article/cate?cateid=' + cateId)) + str;
                            if (preload) {
                                $.ajax({
                                    type: 'GET',
                                    url: url,
                                    dataType: 'json',
                                    success: function (data) {
                                        successFun(data, me, cateId, 'append', preload);
                                    },
                                    error: function (xhr, type) {
                                        me.resetload();
                                    }
                                });
                            } else {
                                // 如果不是预加载 看看是否有存储的预加载数据 有的话就用 没有就去请求
                                if (that.preload[cateId]) {
                                    var el = '[data-id="' + cateId + '"]';
                                    section.find(el).find('ul').append(that.preload[cateId]);


                                    // 设置公众号名称的最大宽度
                                    authorMaxWidth();

                                    that.preload[cateId] = '';
                                    me.resetload();
                                    me.unlock();
                                    me.noData(false);

                                } else {
                                    $.ajax({
                                        type: 'GET',
                                        url: url,
                                        dataType: 'json',
                                        success: function (data) {
                                            successFun(data, me, cateId, 'append');
                                        },
                                        error: function (xhr, type) {
                                            me.resetload();
                                        }
                                    });
                                    // 预加载
                                    that.preloadTimer(cateId);
                                }
                            }
                        }
                    });


                });


            },
            refreshNode: function () {
                var that = this;
                $(document).on('click', '.refresh-node', function () {
                    var cateId = $(this).closest('.channel').data('id');
                    that.droploadObj[cateId].opts.loadUpFn(that.droploadObj[cateId]);
                })
            },
            storePage: function () {
                $(document).on('click', '.list li a', function (e) {
                    e.preventDefault();
                    var _t = $(this),
                        Body = $('body'),
                        Nav = _$('nav'),
                        section = _$('section'),
                        channel = _t.closest('.channel');
                    _t.hasClass('visited') || _t.addClass('visited');

                    section.find('.dropload-down').remove();
                    var obj = {
                        nav: Nav.html(),
                        navScrollLeft: Nav.scrollLeft(),
                        sectionDataTranslate: section.data('translate'),
                        sectionTranslate: section.attr('style'),
                        channelId: channel.data('id'),
                        channel: channel.html(),
                        channelScrollTop: channel.find('.channel-scroll').scrollTop()
                    };
                    sessionStorage.setItem('index', JSON.stringify(obj));
                    location.href = _t.data('href');
                    // location.href = 'http://127.0.0.1:8888/article.html' // 开发环境
                })
            },
            preloadTimer: function (cateId) {
                var that = this;
                // 预加载
                // 关闭所有定时器
                for (var h in that.cateIds) {
                    var timerKey = that.cateIds[h];
                    clearTimeout(that.timer[timerKey]);
                }
                // 打开一个定时器
                that.timer[cateId] = setTimeout(function () {
                    that.droploadObj[cateId].opts.loadDownFn(that.droploadObj[cateId], 'preload');
                }, 2000);
            },
            horizontalSwipe: function () {
                var that = this,
                    Nav = _$('nav'),
                    section = _$('.list'),
                    channelLength = section.find('.channel').length,
                    navThreshold = Math.floor(that.screenWidth / that.navLiWidth), // 列表水平滑动 触发 nav 水平滑动的阈值
                    screenLength = Math.floor(channelLength / navThreshold) - 1,
                    loading = _$('.loading-big');

                section.find('.channel').swipe({
                    swipeStatus: function (event, phase, direction, distance) {
                        console.log(phase + " you have swiped " + distance + "px in direction:" + direction);
                        var scrollBox = $(this).find('.channel-scroll'),
                            cateId = $(this).data('id'),
                            nextChannel = '',
                            nextCateId = '';
                        if (phase == 'start') {
                            that.startState = '';

                        }
                        /*
                         *  在第一次移动中确定方向（水平或者竖直），以后的移动只改变该方向上的数值
                         *
                         *
                         * */
                        if (phase == 'move' && direction != 'none') {
                            // 确定方向
                            if (!that.startState) {
                                // 确定滑动方向
                                if (['up', 'down'].indexOf(direction) > -1) {
                                    that.startState = 'vertical';
                                } else {
                                    that.startState = 'horizontal';
                                    // 如果是水平滚动，则禁止竖直方向的滚动
                                    scrollBox.css('overflow', 'hidden');
                                    // 阻止竖直方向的事件
                                    that.droploadObj[cateId].loading = true;
                                }
                            }
                            // 改变数值
                            else {
                                //如果是竖直
                                if (that.startState == 'vertical') {
                                }
                                // 如果是水平
                                else if (that.startState == 'horizontal') {
                                    // 左/右
                                    if (direction == 'left') {
                                        distance = -distance;
                                    }
                                    // 跟随触点移动
                                    var sectionTranslate = section.data('translate'),
                                        mathResult = sectionTranslate + distance,
                                        cssResult = 'translate3d(' + mathResult + 'px, 0px ,0px) translateZ(0px)';
                                    // 保存最终的移动距离 设置移动的安全距离
                                    // 如果是首屏
                                    if (sectionTranslate == 0) {
                                        // 设置安全距离
                                        if (mathResult > that.screenWidth / 2) {
                                            mathResult = that.screenWidth / 2;
                                            cssResult = 'translate3d(' + mathResult + 'px, 0px ,0px) translateZ(0px)';
                                        }
                                    }
                                    // 最后一屏
                                    else if (sectionTranslate == -(channelLength - 1) * that.screenWidth) {
                                        // 设置安全距离
                                        if (mathResult < -(channelLength - 1) * that.screenWidth - that.screenWidth / 2) {
                                            mathResult = -(channelLength - 1) * that.screenWidth - that.screenWidth / 2;
                                            cssResult = 'translate3d(' + mathResult + 'px, 0px ,0px) translateZ(0px)';
                                        }
                                    }
                                    section.css('-webkit-transform', cssResult)
                                        .data('temp', mathResult)
                                        .data('direction', direction);
                                }
                            }
                        }

                        if (phase == 'end') {
                            if (that.startState == 'horizontal') {
                                // 初始化方向
                                that.startState = '';

                                // 通过计算得出最终停留的频道
                                var current = Math.abs(section.data('temp')),
                                    currentDirection = section.data('direction'),
                                    integer = Math.floor(current / that.screenWidth),
                                    remainder = current % that.screenWidth,
                                    finalMathResult = 0,
                                    finalCssResult = '';


                                //首屏
                                if (integer == 0) {
                                    if (current * 2 > that.screenWidth) {
                                        integer = 1
                                    }
                                }
                                // 最后一屏
                                else if (integer == channelLength - 1) {
                                    integer = channelLength - 1
                                }
                                // 其他
                                else if (remainder * 2 > that.screenWidth) {
                                    integer += 1
                                }

                                //最终数值
                                finalMathResult = -integer * that.screenWidth;
                                finalCssResult = 'translate3d(' + finalMathResult + 'px, 0px ,0px) translateZ(0px)';

                                // 保存滚动数值 设置滚动动画
                                section
                                    .data('translate', finalMathResult)
                                    .css('transition-duration', '500ms')
                                    .css('-webkit-transform', finalCssResult);

                                // 初始化样式
                                setTimeout(function () {
                                    section.css('transition-duration', '0ms')
                                }, 600);

                                // 恢复滚动
                                scrollBox.css('overflow', 'auto');

                                // 恢复竖直方向的事件
                                that.droploadObj[cateId].loading = false;

                                // 如果频道切换了 导航也跟着切换
                                if ($(this).data('index') != integer) {
                                    if (currentDirection === 'left') {
                                        nextChannel = $(this).next('.channel');
                                    } else {
                                        nextChannel = $(this).prev('.channel');
                                    }

                                    // 如果 nextChannel存在
                                    if (nextChannel.length) {
                                        // nav样式
                                        Nav.find('li').eq(integer).addClass('active').siblings('li').removeClass('active');
                                        // nav联动
                                        var idx = nextChannel.data('index'),
                                            equation = idx / navThreshold - screenLength,
                                            aniFun = function (num) {
                                                Nav.animate({
                                                    scrollLeft: num
                                                }, 500)
                                            };
                                        if (equation < 0) {
                                            aniFun(0);
                                        }
                                        else if (equation >= 0 && equation < 1) {
                                            aniFun(navThreshold * that.navLiWidth * screenLength);
                                        }
                                        else {
                                            aniFun(navThreshold * that.navLiWidth * (screenLength + 1));
                                        }

                                        //  渲染数据
                                        // 设置currentsCateId
                                        that.currentsCateId = nextCateId = nextChannel.data('id');

                                        // 判断当前分类是否有内容，如果没有，显示loading
                                        if (nextChannel.find('li').length) {
                                            loading.hide();
                                            // 重置
                                            that.droploadObj[nextCateId].unlock();
                                            that.droploadObj[nextCateId].noData(false);
                                            that.droploadObj[nextCateId].resetload();
                                        } else {
                                            loading.show();
                                            that.droploadObj[nextCateId].opts.loadUpFn(that.droploadObj[nextCateId]);
                                            // 预加载
                                            that.preloadTimer(nextCateId);
                                        }
                                    }
                                }


                            }
                        }
                    },
                    fingers: 1,
                    threshold: 10, // 超过 n 像素 确定滚动方向
                    allowPageScroll: "auto" // 允许滚动
                })
            }

        };

    Index.init();

    // 控制台调试
    // window.Index = Index;
});

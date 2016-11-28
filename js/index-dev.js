jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Index');
            return arg ? ele.find(arg) : ele
        },
        Index = {
            init: function () {
                // 初始化数据
                this.initData();

                // 初始化列表结构
                this.renderStructure();

                // nav的左右滑动/点击跳转效果/新增效果
                this.navSwipe();

                this.test();

                /*this.loadContent();

                 this.refreshNode();

                 this.storePage();*/

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
                section.data('translate', 0);


            },
            renderStructure: function () {
                var Nav = _$('nav'),
                    section = _$('.list'),
                    html = '';
                Nav.find('li').each(function () {
                    var id = $(this).data('id');
                    html += '<div class="channel" data-id="' + id + '"><div class="channel-scroll"><ul></ul></div></div>';
                });
                section.append(html);

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

                // 设置ul的宽度
                Ul.css('width', width + 15);


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


                        // loading
                        loading.show();

                        // 显示当前分类
                        var mathResult = -idx * that.screenWidth,
                            cssResult = 'translateX(' + mathResult + 'px)';
                        section.css('transform', cssResult).data('translate', mathResult);
                        setTimeout(function () {
                            loading.hide()
                        }, 300);

                        /*
                         // 判断当前分类是否有内容，如果没有，显示loading
                         if (!section.find(el).find('li').length) {
                         // loading
                         section.hide();
                         _$('.loading-big').show();
                         }


                         // 重置
                         that.dropload.unlock();
                         that.dropload.noData(false);
                         that.dropload.resetload();


                         // 预加载
                         that.preloadTimer(cateId);
                         */
                    });
                })


            },
            loadContent: function () {
                var that = this,
                    Nav = _$('nav'),
                    section = _$('.list'),
                    Body = $('body'),
                    url = window.Common.domain + '/wx/article/interest' + '?callback=?',
                    loading = '<div class="loading-small"><div class="loading-icon"><div class="loading-curve"></div></div>页面加载中...</div>',
                    successFun = function (data, me, cateId, type, preload) {
                        if (window.Common.verifyData(data)) {
                            var listData = data.data.list,
                                key = 'tabs' + cateId,
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
                                _$('.loading-big').hide();
                                // 显示section
                                section.show();
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
                            var Lis = section.find('li'),
                                maxWidth = Lis.find('h4').width()
                                    - parseInt(Lis.find('.author').css('margin-right'))
                                    - parseInt(Lis.find('.page-view').css('max-width'));
                            Lis.find('.author').css('max-width', maxWidth);


                            that.dropload.resetload();
                            me.unlock();
                            me.noData(false);

                        }
                    };

                that.dropload = section.dropload({
                    scrollArea: window,
                    // autoLoad: window.index.autoLoad,
                    domUp: {
                        domClass: 'dropload-up',
                        domLoad: loading
                    },
                    domDown: {
                        domClass: 'dropload-down',
                        domLoad: loading
                    },
                    loadUpFn: function (me) {

                        var cateId = Nav.find('li.active').data('id');

                        // url = window.Common.domain + ((cateId == 0) ? '/wx/article/interest' : ('/wx/article/cate?cateid=' + cateId)) + '&callback=?';
                        url = window.Common.domain + ((cateId == 0) ? '/wx/article/interest' : ('/wx/article/cate?cateid=' + cateId)) + '&uid=1&callback=?'; // 开发环境

                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            success: function (data) {
                                successFun(data, me, cateId, 'prepend');
                            },
                            error: function (xhr, type) {
                                that.dropload.resetload();
                            }
                        });

                        // 预加载
                        // that.preloadTimer(cateId);
                    },
                    loadDownFn: function (me, preload) {
                        var cateId = Nav.find('li.active').data('id');

                        // url = window.Common.domain + ((cateId == 0) ? '/wx/article/interest' : ('/wx/article/cate?cateid=' + cateId)) + '&callback=?';
                        url = window.Common.domain + ((cateId == 0) ? '/wx/article/interest' : ('/wx/article/cate?cateid=' + cateId)) + '&uid=1&callback=?'; // 开发环境

                        if (preload) {
                            $.ajax({
                                type: 'GET',
                                url: url,
                                dataType: 'json',
                                success: function (data) {
                                    successFun(data, me, cateId, 'append', preload);
                                },
                                error: function (xhr, type) {
                                    that.dropload.resetload();
                                }
                            });
                        } else {
                            // 如果不是预加载 看看是否有存储的预加载数据 有的话就用 没有就去请求
                            if (that.preload[cateId]) {
                                var el = '[data-id="' + cateId + '"]';
                                section.find(el).find('ul').append(that.preload[cateId]);

                                var Lis = section.find('li'),
                                    maxWidth = Lis.find('h4').width()
                                        - parseInt(Lis.find('.author').css('margin-right'))
                                        - parseInt(Lis.find('.page-view').css('max-width'));
                                Lis.find('.author').css('max-width', maxWidth);

                                that.preload[cateId] = '';
                                that.dropload.resetload();
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
                                        that.dropload.resetload();
                                    }
                                });
                                // 预加载
                                that.preloadTimer(cateId);
                            }

                        }


                    }
                });

            },
            refreshNode: function () {
                var that = this;
                $(document).on('tap', '.refresh-node', function () {
                    that.dropload.opts.loadUpFn(that.dropload);
                })
            },
            storePage: function () {
                $(document).on('click', '.list li a', function (e) {
                    e.preventDefault();
                    var _t = $(this),
                        Body = $('body'),
                        Nav = _$('nav'),
                        section = _$('section');
                    _t.hasClass('visited') || _t.addClass('visited');

                    section.find('.dropload-down').remove();
                    var obj = {
                        nav: Nav.html(),
                        navScrollLeft: Nav.scrollLeft(),
                        section: section.html(),
                        scrollTop: Body.scrollTop()
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
                    clearTimeout(that[timerKey]);
                }
                // 打开一个定时器
                that[cateId] = setTimeout(function () {
                    that.dropload.opts.loadDownFn(that.dropload, 'preload');
                }, 2000);
            },
            test: function () {

                var that = this,
                    Nav = _$('nav'),
                    section = _$('.list'),
                    channelLength = section.find('.channel').length,
                    loading = _$('.loading-big');

                // 测试数据
                loading.hide();

                section.find('ul').each(function (idx) {
                    var _html = '';
                    for (var i = 0; i < 20; i++) {
                        _html += '<li>' + idx + '</li>';
                    }
                    $(this).append(_html);
                });


                section.find('.channel').swipe({
                    swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                        // console.log(direction, distance, duration);
                    },
                    swipeStatus: function (event, phase, direction, distance) {
                        console.log(phase + " you have swiped " + distance + "px in direction:" + direction);

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
                                    that.startState = 'vertical'
                                } else {
                                    that.startState = 'horizontal'
                                }
                            }
                            // 改变数值
                            else {
                                //如果是竖直
                                if (that.startState == 'vertical') {

                                }
                                // 如果是水平
                                else if (that.startState == 'horizontal') {
                                    if (direction == 'left') {
                                        distance = -distance;
                                    }
                                    var mathResult = section.data('translate') + distance,
                                        cssResult = 'translateX(' + mathResult + 'px)';
                                    section.css('transform', cssResult).data('temp', mathResult);

                                }
                            }


                        }


                        if (phase == 'end') {
                            // 初始化方向
                            that.startState = '';

                            // 通过计算得出最终停留的频道
                            var current = Math.abs(section.data('temp')),
                                integer = Math.floor(current / that.screenWidth),
                                remainder = current % that.screenWidth,
                                finalMathResult = 0,
                                finalCssResult = '';


                            // 首屏 及 其他
                            if (current < that.screenWidth || remainder * 2 > that.screenWidth) {
                                integer += 1
                            }

                            // 最后一屏
                            if (integer > channelLength - 1) {
                                integer = channelLength - 1
                            }


                            //最终数值
                            finalMathResult = -integer * that.screenWidth;
                            finalCssResult = 'translateX(' + finalMathResult + 'px)';

                            // 保存滚动数值 设置滚动动画
                            section
                                .data('translate', finalMathResult)
                                .css('transition-duration', '500ms')
                                .css('transform', finalCssResult);

                            // 初始化样式
                            setTimeout(function () {
                                section.css('transition-duration', '0ms')
                            }, 600);

                            // nav联动
                            Nav.find('li').eq(integer).addClass('active').siblings('li').removeClass('active');


                        }


                    },
                    threshold: 10,
                    allowPageScroll: "auto"
                })
            }

        };

    Index.init()
});

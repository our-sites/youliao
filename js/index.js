jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Index');
            return arg ? ele.find(arg) : ele
        },
        Index = {
            init: function () {

                this.navSwipe();

                this.loadContent();

                this.refreshNode();

                this.storePage();

                // this.horizontalScroll();
                // this.test();
                this.letsGo();

                window.Common.footer(_$);
            },
            preload: {},
            width: _$().width(),
            navSwipe: function () {
                var that = this,
                    Nav = _$('nav'),
                    Ul = Nav.find('ul'),
                    Plus = Nav.find('.plus'),
                    Body = $('body'),
                    section = _$('section');

                // 取得ul的真实宽度
                var width = 0,
                    Li = Ul.find('li'),
                    Padding = Number(Li.css('padding-left').replace('px', '')) * 2,
                    Margin = Number(Li.css('margin-left').replace('px', ''));
                Li.each(function () {
                    width += $(this).width() + Padding + Margin
                });

                // 设置ul的宽度 使所有li在一行显示
                Ul.css('width', width + 15);

                // 初始化一些值
                Ul.find('li').each(function () {
                    var key = 'tabs' + $(this).data('id');
                    that[key] = false;
                });
                // 用于预加载 关闭定时器
                that.cateIds = [];
                Ul.find('li').each(function () {
                    that.cateIds.push($(this).data('id'))
                });

                // 点击 切换
                Ul.find('li').each(function (idx) {
                    var _t = $(this);
                    _t.on('click', function () {

                        var oldCateId = _t.siblings('.active').data('id'),
                            oldEl = '[data-id="' + oldCateId + '"]',
                            oldKey = 'tabs' + oldCateId;

                        var cateId = _t.data('id'),
                            el = '[data-id="' + cateId + '"]',
                            key = 'tabs' + cateId;



                        // 样式
                        _t.addClass('active').siblings('li').removeClass('active');

                        // 显示当前分类
                        // section.find(el).show().siblings('.channel').hide();
                        var x = 'translate3d(' + (-idx * that.width) +', 0px, 0px)';
                        section.css('transform',  + x);

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

                    });
                })


            },
            loadContent: function () {
                var that = this,
                    Nav = _$('nav'),
                    section = _$('section'),
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
                $(document).on('click', 'section li a', function (e) {
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
            horizontalScroll: function () {
                var that = this,
                    section = _$('section'),
                    ul = section.find('ul'),
                    left = false,
                    horizontal = false;
                //init
                $('head').append('<style type="text/css">#Index section .dropload-down,#Index section .dropload-up,#Index section ul' +
                    '{width: ' + that.width + 'px;}#Index section ul{height: ' + window.screen.height + 'px;}</style>');
                section.css('width', that.width * ul.length);
                ul.each(function (idx) {
                    $(this).attr('data-index', idx)
                });

                // event
                var startX = 0,
                    moveX = 0,
                    swipeX = 0;
                section.on('swipeleft', function () {
                    swipeX = moveX;
                    horizontal = true;
                    left = true;
                });

                section.on('swiperight', function () {
                    swipeX = moveX;
                    horizontal = true;
                    left = false;
                });


                section.on('touchstart', function (e) {
                    startX = e.touches[0].pageX;
                });

                section.on('touchmove', function (e) {
                    var ulIdx = $(e.target.closest('ul')).data('index');
                    moveX = e.touches[0].pageX;
                    if (horizontal) {
                        var ml = moveX - swipeX - ulIdx * that.width;
                        ml < 0 && section.css('margin-left', ml + 'px')
                    }
                });

                section.on('touchend', function (e) {
                    var marginLeft = section.css('margin-left');
                    marginLeft = parseInt(marginLeft);
                    marginLeft = Math.round(marginLeft / that.width);
                    section.stop().animate({
                        'margin-left': marginLeft * that.width + 'px'
                    }, 300);
                    _$('nav li').eq(Math.abs(marginLeft)).addClass('active').siblings('li').removeClass('active')
                });

                $(document).on('scroll', function () {
                    // console.log('scroll');
                    horizontal = false;
                });
            },
            test: function () {

                var that = this,
                    section = _$('section'),
                    ul = section.find('ul'),
                    left = false,
                    horizontal = false;
                //init
                $('head').append('<style type="text/css">#Index section .dropload-down,#Index section .dropload-up,#Index section ul' +
                    '{width: ' + that.width + 'px;}</style>');
                section.css('width', that.width * ul.length);
                ul.each(function (idx) {
                    $(this).attr('data-index', idx)
                });


                _$('section').swipe({
                    swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                        console.log(event, direction, distance, duration, fingerCount, fingerData);
                    },
                    threshold: 0,
                    fingers: 'all',
                    allowPageScroll: "auto"
                })
            },
            letsGo: function () {
                var that = this,
                    section = _$('section'),
                    channel = section.find('.channel'),
                    Nav = _$('nav'),
                    footer = _$('footer');
                // section.height($(window).height() - Nav.height() - footer.height());

            }
        };

    Index.init()
});

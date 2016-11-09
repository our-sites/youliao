jQuery(function ($) {

    var _$ = function (arg) {
            var ele = $('#Article');
            return arg ? ele.find(arg) : ele
        },
        Article = {
            init: function () {
                window.Common.footer(_$);
                this.initData();
                this.addComment();
                this.commentPraise();

            },
            initData: function () {
                var that = this,
                    data = window.jsonData,
                    toQueryParams = function () {
                        var search = this.replace(/^\s+/, '').replace(/\s+$/, '').match(/([^?#]*)(#.*)?$/); //提取location.search中'?'后面的部分
                        if (!search) {
                            return {};
                        }
                        var searchStr = search[1];
                        var searchHash = searchStr.split('&');

                        var ret = {};
                        for (var i = 0, len = searchHash.length; i < len; i++) { //这里可以调用each方法
                            var pair = searchHash[i];
                            if ((pair = pair.split('='))[0]) {
                                var key = decodeURIComponent(pair.shift());
                                var value = pair.length > 1 ? pair.join('=') : pair[0];
                                if (value != undefined) {
                                    value = decodeURIComponent(value);
                                }
                                if (key in ret) {
                                    if (ret[key].constructor != Array) {
                                        ret[key] = [ret[key]];
                                    }
                                    ret[key].push(value);
                                } else {
                                    ret[key] = value;
                                }
                            }
                        }
                        return ret;
                    };
                if (window.Common.verifyData(data)) {
                    data = data.data;

                    // 游客模式
                    data.isLogin || _$().hasClass('role-tourist') || _$().addClass('role-tourist');
                    //id
                    that.id = data.id;
                    //标题
                    _$('header h1').text(data.title);
                    //作者
                    _$('header .author').text(data.actname);
                    //发布时间
                    _$('header .date').text(new Date(data.public_time * 1000).toLocaleDateString().replace(/\//g, '.'));
                    //评分
                    _$('header .grade').text(data.score + '分');
                    //文章内容
                    var dataContent = $(data.content);
                    var wWidth = $(window).width();
                    // 格式化图片
                    if ($(data.content).find('img').length) {
                        dataContent = dataContent.find('img').each(function (idx) {
                            $(this).removeAttr('style').attr('src', $(this).data('src'));
                            if ($(this).data('w') >= wWidth) {
                                /*$(this).css({
                                 'width': 'auto!',
                                 'height': 'auto'
                                 });*/
                                // $(this).css('cssText','width: auto !important;height: auto !important;')
                            } else {
                                // $(this).css('width', $(this).data('w'));
                            }
                        }).parents('#js_content')
                    }
                    // 格式化视频
                    if (dataContent.find('.video_iframe').length) {
                        dataContent = dataContent.find('.video_iframe').each(function () {
                            var src = $(this).attr('src'),
                                dataSrc = $(this).data('src'),
                                width = _$('.article-content').width(),
                                height = Number($(this).attr('height')) / Number($(this).attr('width')) * width,
                                vid,
                                href;
                            if (src) {
                                vid = toQueryParams.call(src).vid;
                            } else if (dataSrc) {
                                vid = toQueryParams.call(dataSrc).vid;
                            }
                            href = 'http://v.qq.com/iframe/player.html?auto=0&vid=';

                            $(this).attr('src', href + vid).css({
                                'width': width,
                                'height': height
                            });
                        }).parents('#js_content');
                    }
                    // p标签必须换行
                    if (dataContent.find('p').length) {
                        dataContent = dataContent.find('p').each(function () {
                            $(this).css("cssText", "max-width: 100% !important;box-sizing: border-box !important;word-wrap: break-word !important;");
                        }).parents('#js_content');
                    }

                    // 处理音频
                    if (dataContent.find('mpvoice').length) {
                        dataContent = that.rebuildVoice(dataContent.find('mpvoice'), that, data.actname);
                    }

                    _$('.article-content').html(dataContent);

                    // 音频事件添加
                    $('.audio-box').each(function () {
                        that.controlAudio($(this));
                    })
                    // 关注有料 跳转链接
                    _$('.attention-btn').attr('href', data.youliao_follow_url);
                    // 关注内容来源公众号 跳转链接
                    _$('.article-source a.fr').attr('href', data.act_follow_url);
                    // 公众号logo
                    _$('.article-source .fl img').attr('src', data.actlogo);
                    // 公众号名字
                    _$('.article-source .fl span').text(data.actname);


                    //标签
                    $.getJSON(window.Common.domain + '/wx/article/articleTag?tagid=' + data.tagid + '&callback=?', function (resp) {
                        if (window.Common.verifyData(resp)) {
                            var tags = '';
                            resp = resp.data;
                            for (var x in resp) {
                                tags += '<span>#' + resp[x] + '</span>'
                            }
                            _$('.article-other .tags').html(tags);
                        }
                    });
                    // 阅读数和点赞数
                    $.getJSON(window.Common.domain + '/wx/article/watchinfo?id=' + data.id + '&callback=?', function (resp) {
                        if (window.Common.verifyData(resp)) {
                            _$('.article-other .page-view b').text(resp.data.readnum);
                            _$('.article-other .praise b').text(resp.data.likenum);
                        }
                    });

                    // 收藏
                    that.articleFavor(data.id, data.favored);

                    // 点赞
                    that.articlePraise(data.id, data.liked);

                    // 兴趣追踪
                    that.interestTrack('?tagid=' + data.tagid + '&id=' + data.id + '&callback=?');
                    //评论列表
                    that.commentList(data.id);
                    // 关闭底部提示
                    _$('.tourist-close').on('click', function () {
                        _$('.tourist').hide();
                    })
                }
            },

            remindLogin: function () {
                var time = 1000;
                window.Common.toastr({
                    content: '请先登录',
                    time: time
                });

                setTimeout(function () {
                    _$('.tourist').is(':visible') || _$('.tourist').show();
                }, time);


            },

            articleFavor: function (id, status) {
                var favorBtn = _$('header .favor');
                //初始化
                status ? favorBtn.removeClass('active').addClass('active') : favorBtn.removeClass('active');
                // 点击
                favorBtn.on('click', function () {
                    // 判断是否登录
                    if (window.jsonData.data.isLogin) {
                        var that = $(this),
                            // url = window.Common.domain + '/wx/collect/collect?id=' + id + '&callback=?';
                        url = window.Common.domain + '/wx/collect/collect?id=' + id + '&uid=1&callback=?';
                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            beforeSend: function () {
                                that.prop('disabled', true);
                                window.Common.toastr({
                                    content: "收藏中...",
                                    pos: 'bottom',
                                    delay: 'fixed'
                                })
                            },
                            success: function (resp) {
                                if (window.Common.verifyData(resp)) {
                                    that.prop('disabled', false);
                                    if (resp.data) {
                                        that.removeClass('active').addClass('active');
                                        window.Common.toastr({
                                            content: "收藏成功",
                                            pos: 'bottom',
                                            delay: '500'
                                        })
                                    } else {
                                        that.removeClass('active');
                                        window.Common.toastr({
                                            content: "取消收藏成功",
                                            pos: 'bottom',
                                            delay: '500'
                                        })
                                    }
                                }
                            },
                            error: function (xhr, type) {
                                console.log(xhr, type)
                            }
                        });
                    } else {
                        Article.remindLogin();
                    }


                })
            },

            articlePraise: function (id, status) {
                var praiseBtn = _$('.article-other .praise');
                //初始化
                status ? praiseBtn.removeClass('active').addClass('active') : praiseBtn.removeClass('active');
                // 点击
                praiseBtn.on('click', function () {
                    // 判断是否登录
                    if (window.jsonData.data.isLogin) {
                        var that = $(this),
                            url = window.Common.domain + '/wx/article/like?id=' + id + '&callback=?';

                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            beforeSend: function () {
                                that.prop('disabled', true);
                                window.Common.toastr({
                                    content: "点赞中...",
                                    pos: 'bottom',
                                    delay: 'fixed'
                                })
                            },
                            success: function (resp) {
                                if (window.Common.verifyData(resp)) {
                                    that.prop('disabled', false);
                                    if (resp.data) {
                                        that.removeClass('active').addClass('active');
                                        window.Common.toastr({
                                            content: "点赞成功",
                                            pos: 'bottom',
                                            delay: '500'
                                        })
                                    } else {
                                        that.removeClass('active');
                                        window.Common.toastr({
                                            content: "取消点赞成功",
                                            pos: 'bottom',
                                            delay: '500'
                                        })
                                    }
                                }
                            },
                            error: function (xhr, type) {
                                console.log(xhr, type)
                            }
                        });
                    } else {
                        Article.remindLogin();
                    }

                })
            },

            interestTrack: function (url) {
                //0s
                $.getJSON(window.Common.domain + '/wx/interest/read0' + url, function (resp) {
                    window.Common.verifyData(resp);
                });
                //40s
                setTimeout(function () {
                    $.getJSON(window.Common.domain + '/wx/interest/read40' + url, function (resp) {
                        window.Common.verifyData(resp);
                    })
                }, 40 * 1000);
                //120s
                setTimeout(function () {
                    $.getJSON(window.Common.domain + '/wx/interest/read120' + url, function (resp) {
                        window.Common.verifyData(resp);
                    })
                }, 120 * 1000);
            },

            commentList: function (id) {
                var url = window.Common.domain + '/wx/comment/articlelist?id=' + id + '&callback=?';
                $.getJSON(url, function (resp) {
                    if (window.Common.verifyData(resp)) {
                        resp = resp.data;
                        var html = '';
                        for (var y in resp) {
                            var data = resp[y],
                                like = data.islike ? data.likenum : '',
                                createTime = data.create_time && new Date(data.create_time * 1000).toLocaleString().replace(/\//g, '.'),
                                replayTime = data.reply_time && new Date(data.reply_time * 1000).toLocaleDateString().replace(/\//g, '.'),
                                isLike = data.islike ? 'reviewer-info-liked active' : 'reviewer-info-liked',
                                authorContent = (data.reply_content && replayTime) ? '<div class="author-comment">' +
                                '<h4>作者回复</h4><div class="author-comment-content">' + data.reply_content + '</div>' +
                                '<div class="author-comment-date">' + replayTime + '</div></div>' : '';

                            html += '<div class="article-comment-item clf"><img src="' + data.logo + '" alt="" ' +
                                'class="reviewer-avatar" width="32" height="32"><div class="article-comment-item-right">' +
                                '<div class="reviewer-info"><h4 class="clf"><span class="reviewer-info-name">' + data.nickname +
                                '</span><span class="' + isLike + '" data-id="' + data.cid + '">' + like + '</span></h4>' +
                                '<div class="reviewer-info-content">' + data.content + '</div><p class="reviewer-info-date">' +
                                createTime + '</p></div>' + authorContent + '</div></div>'
                        }
                        _$('.article-comment-list').html(html);
                    }
                })
            },

            addComment: function () {
                var that = this;
                window.Common.comment(_$('.article-comment-new'), window.jsonData.data.isLogin, Article.remindLogin);
                window.Common.comment(_$('header .commit'), window.jsonData.data.isLogin, Article.remindLogin);
                $(document).on('tap', '#commentBox .submit', function () {
                    // 判断是否登录
                    if (window.jsonData.data.isLogin) {
                        var commentBox = $('#commentBox'),
                            val = commentBox.find('textarea').val();
                        if (val) {
                            if (val.length < 512) {
                                var url = window.Common.domain + '/wx/comment/add?id=' + that.id + '&content=' + val + '&callback=?';
                                // var url = window.Common.domain + '/wx/comment/add?id=' + that.id + '&content=' + val + '&uid=1&callback=?';
                                $.getJSON(url, function (resp) {
                                    if (window.Common.verifyData(resp)) {
                                        resp = resp.data;
                                        var createTime = resp.create_time && new Date(resp.create_time * 1000).toLocaleString().replace(/\//g, '.'),
                                            html = '<div class="article-comment-item clf"><img src="' + resp.logo + '" alt="" class="reviewer-avatar" ' +
                                                'width="32" height="32"><div class="article-comment-item-right"><div class="reviewer-info"><h4 class="clf">' +
                                                '<span class="reviewer-info-name">' + resp.nickname + '</span><span class="reviewer-info-liked" data-id="' +
                                                resp.cid + '"></span></h4>' +
                                                '<div class="reviewer-info-content">' + resp.content + '</div><p class="reviewer-info-date">' +
                                                createTime + '</p></div></div></div>';
                                        _$('.article-comment-list').prepend(html);
                                        commentBox.remove();
                                        // 滑动到评论区域
                                        $('body').scrollTop($('.article-comment').offset().top);
                                    }
                                })
                            } else {
                                window.Common.toastr({
                                    content: '超出最大字符限制',
                                    pos: 'bottom'
                                })
                            }

                        } else {
                            window.Common.toastr({
                                content: '请输入你的评论',
                                pos: 'bottom'
                            })
                        }
                    } else {
                        Article.remindLogin();
                    }


                })
            },


            commentPraise: function () {
                // 点击
                $(document).on('click', '.article-comment-list .reviewer-info-liked', function () {
                    // 判断是否登录
                    if (window.jsonData.data.isLogin) {
                        var that = $(this),
                            id = that.data('id'),
                            url = window.Common.domain + '/wx/comment/like?cid=' + id + '&callback=?';
                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'json',
                            beforeSend: function () {
                                that.prop('disabled', true);
                                window.Common.toastr({
                                    content: "点赞中...",
                                    pos: 'bottom',
                                    delay: 'fixed'
                                })
                            },
                            success: function (resp) {
                                if (window.Common.verifyData(resp)) {
                                    that.prop('disabled', false);
                                    if (resp.data) {
                                        that.removeClass('active').addClass('active');
                                        if (that.text()) {
                                            that.text(Number(that.text()) + 1)
                                        } else {
                                            that.text(1)
                                        }
                                        window.Common.toastr({
                                            content: "点赞成功",
                                            pos: 'bottom',
                                            delay: '500'
                                        })
                                    } else {
                                        that.removeClass('active');
                                        if (Number(that.text()) > 1) {
                                            that.text(Number(that.text()) - 1)
                                        } else {
                                            that.text('')
                                        }
                                        window.Common.toastr({
                                            content: "取消点赞成功",
                                            pos: 'bottom',
                                            delay: '500'
                                        })
                                    }
                                }
                            },
                            error: function (xhr, type) {
                                console.log(xhr, type)
                            }
                        });
                    } else {
                        Article.remindLogin();
                    }
                })
            },


            rebuildVoice: function (mpvoices, that, author) {
                //  处理音频                    
                mpvoices.each(function () {
                    var mpvoice = $(this),
                        name = decodeURIComponent(mpvoice.attr('name')),
                        time = (function () {
                            var o = mpvoice.attr('play_length') / (60 * 1000),
                                p = parseInt(o),
                                q = Math.round((o - p) * 60);
                            q < 10 && (q = '0' + String(q));
                            return String(p) + ':' + q
                        })(),
                        id = mpvoice.attr('voice_encode_fileid'),
                        url = 'http://res.wx.qq.com/voice/getvoice?mediaid=' + id,
                        html = '<div class="audio-box clf"><audio preload="auto"><source src="' +
                            url +
                            '"></audio><div class="audio-start"><div class="audio-read"></div></div><span class="audio-time">' +
                            time +
                            '</span><div class="audio-info"><p>' +
                            name +
                            '</p><span>来自' +
                            author +
                            '</span></div><div class="progress-bar"></div></div>';
                    mpvoice.after(html);
                });

                return mpvoices.parents('#js_content');
            },

            controlAudio: function (box) {
                var audio = box.find('audio')[0],
                    btn = box.find('.audio-start'),
                    read = btn.find('.audio-read'),
                    progress = box.find('.progress-bar'),
                    timer;

                btn.on('tap', function () {
                    if (read.hasClass('ing')) {
                        read.removeClass('ing');
                        audio.pause();
                        clearInterval(timer);
                    } else {
                        read.addClass('ing');
                        audio.play();
                        clearInterval(timer);
                        timer = setInterval(function () {
                            var width = audio.currentTime * 100 / audio.duration;
                            progress.css('width', width + '%')
                        }, 100)
                    }
                })
            }

        };

    Article.init()
});

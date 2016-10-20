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
                    data = window.jsonData;
                if (window.Common.verifyData(data)) {
                    data = data.data;
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
                    _$('.article-content').html(data.content);
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
                            _$('.article-other .page-view').text(resp.data.readnum);
                            _$('.article-other .praise').text(resp.data.likenum);
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
                }
            },

            articleFavor: function (id, status) {
                var favorBtn = _$('header .favor');
                //初始化
                status ? favorBtn.removeClass('active').addClass('active') : favorBtn.removeClass('active');
                // 点击
                favorBtn.on('tap', function () {
                    var that = $(this),
                        url = window.Common.domain + '/wx/collect/collect?id=' + id + '&callback=?';
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
                })
            },

            articlePraise: function (id, status) {
                var praiseBtn = _$('.article-other .praise');
                //初始化
                status ? praiseBtn.removeClass('active').addClass('active') : praiseBtn.removeClass('active');
                // 点击
                praiseBtn.on('tap', function () {
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
                                isLike = data.islike ? 'reviewer-info-liked active' :　'reviewer-info-liked',
                                authorContent = (data.reply_content && replayTime) ? '<div class="author-comment">' +
                                '<h4>作者回复</h4><div class="author-comment-content">' + data.reply_time + '</div>' +
                                '<div class="author-comment-date">' + replayTime + '</div></div>' : '';

                            html += '<div class="article-comment-item clf"><img src="' + data.logo + '" alt="" ' +
                                'class="reviewer-avatar" width="32" height="32"><div class="article-comment-item-right">' +
                                '<div class="reviewer-info"><h4 class="clf"><span class="reviewer-info-name">' + data.nickname +
                                '</span><span class="' + isLike +'" data-id="' + data.cid + '">' + like + '</span></h4>' +
                                '<div class="reviewer-info-content">' + data.content + '</div><p class="reviewer-info-date">' +
                                createTime + '</p></div>' + authorContent + '</div></div>'
                        }
                        _$('.article-comment-list').html(html);
                    }
                })
            },

            addComment: function () {
                var that = this;
                window.Common.comment(_$('.article-comment-new'));
                $(document).on('tap', '#commentBox .submit', function () {
                    var commentBox = $('#commentBox'),
                        val = commentBox.find('textarea').val();
                    if (val) {
                        if (val.length < 512) {
                            var url = window.Common.domain + '/wx/comment/add?id=' + that.id + '&content=' + val + '&callback=?';
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


                })
            },


            commentPraise: function () {
                // 点击
                $(document).on('tap', '.article-comment-list .reviewer-info-liked', function () {
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
                                    if(that.text()){
                                        that.text(Number(that.text()) + 1)
                                    }else{
                                        that.text(1)
                                    }
                                    window.Common.toastr({
                                        content: "点赞成功",
                                        pos: 'bottom',
                                        delay: '500'
                                    })
                                } else {
                                    that.removeClass('active');
                                    if(Number(that.text()) > 1){
                                        that.text(Number(that.text()) - 1)
                                    }else{
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
                })
            }

        };

    Article.init()
});
var index = $('#Index'),
    library = $('#Library'),
    indexSess = sessionStorage.getItem('index'),
    librarySess = sessionStorage.getItem('library');
// 默认 首页和文库页面都是自动加载
window.library.autoLoad = true;


//  首页
if (index.length) {
    // 初始化结构
    var Nav = index.find('nav'),
        footer = index.find('footer'),
        loading = index.find('.loading-big'),
        section = index.find('.list'),
        html = '';
    Nav.find('li').each(function (idx) {
        var id = $(this).data('id');
        html += '<div class="channel" data-id="' + id + '" data-index="' + idx + '"><div class="channel-scroll"><ul></ul></div></div>';
    });
    // 初始化 section 结构，并设置其高度为 窗口高度-nav - footer
    section.append(html).css('height', $(window).height() - Nav.height() - footer.height());
    if (indexSess) {
        indexSess = JSON.parse(indexSess);
        // 隐藏loading
        loading.hide();
        // 初始化nav 内容及滚动位置
        Nav.html(indexSess.nav).scrollLeft(indexSess.navScrollLeft);
        // 初始化section 水平位置
        section.attr('style', indexSess.sectionTranslate).data('translate', indexSess.sectionDataTranslate);
        // 初始化 频道内容 及滚动位置
        var el = '[data-id="' + indexSess.channelId + '"]';
        section.find(el).html(indexSess.channel).find('.channel-scroll').scrollTop(indexSess.channelScrollTop);
        // 清除缓存
        sessionStorage.clear('index');
        // 取消自动加载
        window.index.autoLoad = true;
    }
}
else if (library.length && librarySess) {
// 我的文库
    librarySess = JSON.parse(librarySess);
    // 隐藏loading
    library.find('.loading-big').hide();
    // 初始化内容
    library.find('section').show().html(librarySess.section);
    // 初始化滚动位置
    $('body').scrollTop(librarySess.scrollTop);
    // 初始化当前页码
    window.libraryPageNum = librarySess.pageNum;
    // 清除缓存
    sessionStorage.clear('library');
    // 取消自动加载
    window.library.autoLoad = false;
}

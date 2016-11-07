var index = $('#Index'),
	library = $('#Library'),
	indexSess = sessionStorage.getItem('index'),
	librarySess = sessionStorage.getItem('library');
// 默认 首页和文库页面都是自动加载
	window.index.autoLoad = true;
	window.library.autoLoad = true;


//  首页
if (index.length && indexSess) {
    indexSess = JSON.parse(indexSess);
    // 隐藏loading
    index.find('.loading-big').hide();
    // 初始化nav 内容及滚动位置
    index.find('nav').html(indexSess.nav).scrollLeft(indexSess.navScrollLeft);
    // 初始化内容
    index.find('section').show().html(indexSess.section);
    // 初始化滚动位置
    $('body').scrollTop(indexSess.scrollTop);
    // 清除缓存
    sessionStorage.clear('index');
    // 取消自动加载
    window.index.autoLoad = false;
}else if (library.length && librarySess) {
// 我的文库 
	librarySess = JSON.parse(librarySess);
    // 隐藏loading
    library.find('.loading-big').hide();
    // 初始化内容
    library.find('section').show().html(librarySess.section);
    // 初始化滚动位置
    $('body').scrollTop(librarySess.scrollTop);
    // 清除缓存
    sessionStorage.clear('library');
    // 取消自动加载
    window.library.autoLoad = false;
}

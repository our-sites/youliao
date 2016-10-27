if (sessionStorage.getItem('list')) {
    var index = $('#Index'),
        list = JSON.parse(sessionStorage.getItem('list'));
    index.find('.loading-big').hide();
    index.find('nav').html(list.nav).scrollLeft(list.navScrollLeft);
    index.find('section').show().html(list.section);
    $('body').scrollTop(list.scrollTop);

    sessionStorage.clear('list');
}
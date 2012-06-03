var proxyUrl = "proxy.php";
var base = "?url=http://boston.craigslist.org/bia/";
var rows = 0;
var cols = 0;
var id   = 0;

Craigstest = {};
Craigstest.queue  = [];
Craigstest.running= false;
Craigstest.currentPage = 0;

Craigstest.broadcast = function(evt) {
    var a = []; for(var i=0; i<arguments.length; i++) a.push(arguments[i]);
    var args = a.slice(1);
    $(document).trigger(evt, args);
    //console.log('Broadcast: '+evt);
}

Craigstest.listen = function(evts, callback, scope) {
    if(evts instanceof Array)
        evts = evts.join(" ");
    if(callback instanceof Function) {
        if(scope) {
            $(document).bind(evts, $.proxy(callback, scope));
        } else {
            $(document).bind(evts, callback);
        }
    }
    return true;
}

$(document).ready(function(){
    pageWidth = $(window).innerWidth();
    pageHeight = $(window).innerHeight();
    cellWidth = $('#list div.first').outerWidth() + 5; // padding
    cellHeight = $('#list div.first').outerHeight() + 5;

    // How many rows and columns?
    cols = Math.round(pageWidth / cellWidth);
    rows = Math.round(pageHeight/ cellHeight); 

    fillQueue();

    $(window).scroll(function() {
       if($(window).scrollTop() + $(window).height() == $(document).height()) {
            // 100 Results per page.  Look out.
            fillQueue();
       }
    });

});

function fillQueue(){
    var page = Craigstest.currentPage;
    var args = (page > 0) ? base + "index" + page * 100 + ".html" : base;

    $('#list .image.moar').remove();

    $.ajax({
        url: proxyUrl + args,
        type: "GET",
        dataType: "html",
        success: parseHTML 
    })

    Craigstest.currentPage++;
}

function parseHTML(html){
    pages = [];
    console.log(html);
    $(html).find('p.row a').each(function(){
        url = $(this).attr('href');
        if (url != "/bik/") pages.push({'url': url});
    }); 
    parsePages(pages, 0);
}

function parsePages(pages, i){
    if (i < 100){
        args = "?url=" + pages[i].url;
        $.ajax({
            url: proxyUrl + args,
            type: "GET",
            dataType: "html",
            success: function(html){
                links = getLinks(html, pages[i].url);
                queueLinks(links);
                parsePages(pages, i+1);
            }
        });
    }
}

function getLinks(html, url){
    links = [];
    $(html).find('img').each(function(){
        var src = $(this).attr('src');
        if (src.split('/')[3] == "thumb") return;
        links.push({
            'id': id,
            'src': $(this).attr('src'),
            'url': url
        });
        id++;
    });
    return links;
}

function queueLinks(links){
    for (var i in links){
        link = links[i];
        Craigstest.queue.push(link);
    }
    if (Craigstest.queue.length >= cols)
        addImage();
}

Craigstest.listen('image:loaded', function(evt, image){
    image.animate({'opacity': 1});
    if (Craigstest.queue.length >= cols)
        addImage();
    else
        Craigstest.running = false;
}, this);

function addImage(){
    Craigstest.running = true;
    
    img = Craigstest.queue.shift();

    link = $('<a href="' + img.url + '"></a>')
        .click(function(evt){
            //evt.preventDefault();
        });

    image = $('<img id="img-' + img.id + '" src="' + img.src +'" />')
        .css({'opacity': 0})
        .load(function(evt){
            Craigstest.broadcast('image:loaded', image); 
        }).error(function(evt){
            Craigstest.broadcast('image:loaded', image); 
        });

    container = $('<div class="image"></div>');
    $('#list').append(container.append(link.append(image)));
}

var proxyUrl = "proxy.php";
var base = "?url=http://boston.craigslist.org/bia/";
var currentPage = 0;
var rows = 0;
var cols = 0;

Craigstest = {};
Craigstest.queue  = [];
Craigstest.images = [];
Craigstest.running= false;

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

    loadPage(currentPage);

    $(window).scroll(function() {
       if($(window).scrollTop() + $(window).height() == $(document).height()) {
            // 100 Results per page.  Look out.
            loadPage(currentPage);
       }
    });

});

function loadPage(pageNum){
    var args = (pageNum > 0) ? base + "index" + pageNum * 100 + ".html" : base;

    $('#list .image.moar').remove();

    $.ajax({
        url: proxyUrl + args,
        type: "GET",
        dataType: "html",
        success: parseHTML 
    })

    currentPage++;
}

function parseHTML(html){
    pages = [];
    $(html).find('p.row a').each(function(){
        url = $(this).attr('href');
        pages.push({'url': url});
    }); 
    parsePages(pages, 0);
}

function parsePages(pages, i){
    if (i < 10){
        args = "?url=" + pages[i].url;
        $.ajax({
            url: proxyUrl + args,
            type: "GET",
            dataType: "html",
            success: function(html){
                links = getLinks(html);
                queueLinks(links);
                parsePages(pages, i+1);
            }
        });
    }
}

function getLinks(html, url){
    links = [];
    $(html).find('img').each(function(){
        links.push({
            'id': 0,
            'src': $(this).attr('src'),
            'url': "null"
        });
    });
    return links;
}

function queueLinks(links){
    // queues links and sends them to the parser, one row at a time
    for (var i in links){
        link = links[i];
        Craigstest.queue.push(link);
    }
    Craigstest.broadcast('queue:added', Craigstest.queue); 
}
    
Craigstest.listen('queue:added', function(evt, queue){
    // If we have enough to fill out a row, let's rock.
    var images = [];
    while (Craigstest.queue.length > cols){
        console.log(Craigstest.queue.length);
        for (var i; i<cols; i++)
            Craigstest.images.push(Craigstest.queue.shift());
    }

}, this);

Craigstest.listen('image:added', function(evt, images){
    console.log(images);
}, this);

function addImages(){
    if (Craigstest.running) return;
    
    if (Craigstest.images.length > i){
        console.log(Craigstest.images.length);
        Craigstest.running = true;
        imgSrc = images[i].src;

        link = $('<a href="' + images[i].url + '"></a>')
            .click(function(evt){
                //evt.preventDefault();
            });

        image = $('<img id="img-' + i + '" src="' + imgSrc +'" />')
            .css({'opacity': 0})
            .load(function(evt){
                $('#img-' + i)
                    .animate({'opacity': 1})
                Craigstest.broadcast('image:added', images); 
                addImages();
            }).error(function(evt){
                //$(evt.targetElement).remove();
                addImages();
            });

        container = $('<div class="image"></div>');
        $('#list').append(container.append(link.append(image)));
    } else {
        Craigstest.running = false;
    }
}

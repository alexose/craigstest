var proxyUrl = "proxy.php";
var base = "?url=http://boston.craigslist.org/bia/";
var currentPage = 0;
var rows = 0;
var cols = 0;

Craigstest = {};
Craigstest.queue = [];

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

    if (Craigstest.queue.length > cols){
        // If we have enough to fill out a row, let's rock.
        var images = [];
        for (var i; i<cols; i++)
            images.push(Craigstest.queue.shift());
        addImages(images, 0);
    }

}
    
Craigstest.listen('image:added', function(evt, images){
    console.log(images);
}, this);

function addImages(images, i){
    // Takes an array of image srcs and puts them in the DOM
    // We chain the loading process
    
    if (images.length > i){
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
                addImages(images, i+1);
            }).error(function(evt){
                //$(evt.targetElement).remove();
                addImages(images, i+1);
            });

        container = $('<div class="image"></div>');
        $('#list').append(container.append(link.append(image)));
    }
}

var proxyUrl = "proxy.php";
var currentPage = 0;
var rows = 0;
var cols = 0;
var queue = [];

$(document).ready(function(){
    pageWidth = $(window).innerWidth();
    pageHeight = $(window).innerHeight();
    cellWidth = $('#list div.first').outerWidth() + 5; // padding
    cellHeight = $('#list div.first').outerHeight() + 5;

    // How many rows and columns?
    rows = Math.round(pageWidth / cellWidth);
    cols = Math.round(pageHeight/ cellHeight); 

    loadPage(currentPage);

    $(window).scroll(function() {
       if($(window).scrollTop() + $(window).height() == $(document).height()) {
            // 100 Results per page
            loadPage(currentPage);
       }
    });

});

function loadPage(pageNum){
    var args = (pageNum > 0) ? "?page=" + pageNum * 100 : "";

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
        arr = url.split('/');
        if (arr[5]){
            id = arr[5].split('.')[0];
            pages.push({
                'id': id,
            });
        }
    }); 
    parsePages(pages, 0);
}

function parsePages(pages, i){
    if (i < 10){
        args = '?id=' + pages[i].id;
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
    console.log(html);
    $(html).find('img').each(function(){
        links.push({
            'id': 0,
            'img': $(this).attr('src'),
            'url': "null"
        });
    });
}

function queueLinks(links){
    // queues links and sends them to the parser, one row at a time
    queue.push(links);

    var toParse = [];
    while(queue > rows){
        for (var i; i<rows.length; i++){
            toParse.push(queue.shift);
        }
    }

    parseLinks(toParse, 0);
}

function parseLinks(links, i){
    // Takes an array of image srcs and puts them in the DOM

    if (links.length > i){
        imgSrc = links[i].img;

        link = $('<a href="' + links[i].url + '"></a>')
            .click(function(evt){
                //evt.preventDefault();
            });

        image = $('<img id="img-' + i + '" src="' + imgSrc +'" />')
            .css({'opacity': 0})
            .load(function(evt){
                $('#img-' + i)
                    .animate({'opacity': 1}, 150)
                parseLinks(links, i+1); 
            }).error(function(evt){
                parseLinks(links, i+1);
            });

        container = $('<div class="image"></div>');
        $('#list').append(container.append(link.append(image)));
    } else {
        links = [];
        var moar = $('<div class="image moar"><a href="javascript:void(0)">Moar</a></div>')
            .click(function(evt){
                evt.preventDefault()
                currentPage++;
                loadPage(currentPage);
            });
        $('#list').append(moar);
    }
}

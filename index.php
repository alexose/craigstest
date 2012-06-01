<?php

// enable errors
error_reporting(E_ALL);
ini_set('display_errors', '1');
include_once('./indexer.class');

// defaults
$pageURL = "http://boston.craigslist.org/search/bik?minAsk=150&srchType=A&s=";
$xpath = "/html/body[@class='toc']/blockquote/p/span[@class='p']/ancestor::p/a/@href";

for ($i=1; $i<3; $i++){
    
    // get results!
    $url = $pageURL . ($i * 100);
    $indexer = new Indexer;
    $links = $indexer->getPages($url, $xpath);

    foreach ($links as $link){
        $subxpath = "/html/body/div/table/tr/td/img/@src";
        $subindexer = new Indexer;
        $dickpics = $subindexer->getPages($link, $subxpath);
        foreach ($dickpics as $dickpic){
            print '<a href="' . $link . '"><img src="' . $dickpic. '"></img></a>';
        }
    }


}
?>

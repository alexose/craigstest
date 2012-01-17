<?php

// enable errors
error_reporting(E_ALL);
ini_set('display_errors', '1');
include_once('./indexer.class');

// defaults
$pageURL = "http://www.firstrow.tv/sport/basketball.html";
$xpath = "/html/body/div[@id='accordion']/div/a/@href";

// get results!
$indexer = new Indexer;
$links = $indexer->getPages($pageURL, $xpath);

foreach ($links as $link){
    print '<a href="http://alexose.com/sportz' . $link . '">' . $link . '</a><br/>';
}

?>

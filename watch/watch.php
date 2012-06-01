<?php

// enable errors
error_reporting(E_ALL);
ini_set('display_errors', '1');

// process url into usable query
$inputArray = explode("/", $_SERVER['REQUEST_URI']);
$string = "";
foreach ($inputArray as $i=>$elem){
    if ($i < 2)
        continue;
    else
        $string .= "/" . $elem;
}

include_once('../indexer.class');

// defaults
$pageURL = "http://www.firstrow.tv";
$xpath = "//iframe[@id='player']/@src";

$query = $pageURL . $string;

// get results!
$indexer = new Indexer;



print $query . "    ";
print $xpath;
$links = $indexer->getPages($query, $xpath);

foreach ($links as $link){
    print '<a href="http://alexose.com/sportz' . $link . '">' . $link . '</a><br/>';
}

?>

<?php

// enable errors
error_reporting(E_ALL);
ini_set('display_errors', '1');

$inputArray = explode("/", $_SERVER['REQUEST_URI']);
$string = "";
foreach ($inputArray as $i=>$elem){
    if ($i < 2)
        continue;
    else
        $string .= "/" . $elem;
}

print $string;

include_once('../indexer.class');

// defaults
$pageURL = "http://www.firstrow.tv";
$xpath = "/html/body/div[@id='accordion']/div/a/@href";

// get results!
$indexer = new Indexer;
$links = $indexer->getPages($pageURL, $xpath);


?>

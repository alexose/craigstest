<?php

// enable errors
error_reporting(E_ALL);
ini_set('display_errors', '1');

class Indexer {

    public function __construct(){
    }

    public function getURL($url){
        print $url;
        $ch = curl_init();
        $timeout = 5;
        curl_setopt($ch,CURLOPT_URL,$url);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }

    public function getPages($url, $xpath){
    
        $html = self::getURL($url);
        
        $doc = new DOMDocument();
        @$doc->loadHTML($html);

        $xpathvar = new Domxpath($doc);

        $results = $xpathvar->query($xpath);
        $links = array();
        foreach($results as $result){
                $links[] = $result->textContent;
        }
        return $links;
    }

    public function render($pages){
    }
}

// defaults
$pageURL = "http://www.firstrow.tv/sport/basketball.html";
$xpath = "/html/body/div[@id='accordion']/div/a/@href";

$indexer = new Indexer;
$links = $indexer->getPages($pageURL, $xpath);

foreach ($links as $link){
    print $link . "<br/>";
}

?>

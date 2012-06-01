<?php
header('Content-type: application/xml');

$daurl = isset($_GET['page']) ? 'http://boston.craigslist.org/bia/index' . $_GET['page'] . '.html' : 'http://boston.craigslist.org/bia/index.rss';

$handle = fopen($daurl, "r");

if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
?>

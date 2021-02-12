<?php
$url = $_REQUEST['file'];
$file = fopen($url, 'r') or die('unable to open file!');
$result = fread($file,filesize($url));
fclose($file);
echo $result;
?>

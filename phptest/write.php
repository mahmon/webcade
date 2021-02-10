<?php
$data = $_REQUEST['data'];
$file = fopen('scores.txt', 'w') or die('unable to open file!');
fwrite($file, $data);
fclose($file);
echo $data;
?>

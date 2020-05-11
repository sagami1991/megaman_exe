<?php
	$name = $_GET['name'];
	$day = $_GET['day'];
	$time = $_GET['time'];
	$hp = $_GET['hp'];

	$fp = fopen("log.txt", "a");
	fwrite($fp, "\r\n".$name.",".$day.",".$time.",".$hp);
	fclose($fp);
	echo json_encode(null);
?>
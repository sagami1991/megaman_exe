<?php
	$array = array();
	$fp = fopen("log.txt", "r");
	while ($line = fgets($fp)) {
  		array_push( $array,explode( ',',htmlspecialchars($line) ) );
	}
	fclose($fp);
	echo json_encode($array);
?>
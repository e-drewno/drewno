<?php

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

// Set initial response
$response = [
  'value' => 0,
  'error' => 'Nothing happened',
  'data' => null,
];

if ($contentType === "application/json") {

  // Receive the RAW post data.
  $content = trim(file_get_contents("php://input"));

  // $decoded can be used the same as you would use $_POST in $.ajax
  $decoded = json_decode($content, true);
  
  if(! is_array($decoded)) {
    // NOTE: Sometimes for some reason I have to add the next line as well
    /* $decoded = json_decode($decoded, true); */

    // Do something with received data and include it in reponse
    /* perhaps database manipulation here */
    $response['data'] = $decoded;

    // Success
    $response['value'] = 1;
    $response['error'] = null;
  } else {
    // The JSON is invalid.
    $response['error'] = 'Received JSON is improperly formatted';
  }
} else {
  // Content-Type is incorrect
  $response['error'] =  'Content-Type is not set as "application/json"';
}

// echo response for fetch API
echo json_encode($response);
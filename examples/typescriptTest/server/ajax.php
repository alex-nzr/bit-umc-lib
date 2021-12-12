<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if (is_file(realpath(__DIR__ . '/../../../vendor/autoload.php')))
{
    require_once(__DIR__ . '/../../../vendor/autoload.php');
}
elseif(is_file(realpath(__DIR__ . '/../../../../../../vendor/autoload.php'))){
    require_once(__DIR__ . '/../../../../../../vendor/autoload.php');
}

use AlexNzr\BitUmcIntegration\RequestController;
use AlexNzr\BitUmcIntegration\Utils;

$data = file_get_contents('php://input');
print_r(RequestController::sendRequest($data));
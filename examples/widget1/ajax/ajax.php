<?php
require_once(__DIR__ . '/../../../vendor/autoload.php');

use AlexNzr\BitUmcIntegration\RequestController;
use AlexNzr\BitUmcIntegration\Utils;

$data = file_get_contents('php://input');
print_r(RequestController::sendRequest($data));
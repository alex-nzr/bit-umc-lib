<?php
namespace AlexNzr\BitUmcIntegration;

use AlexNzr\BitUmcIntegration\RequestService;

class RequestController{

    protected function __construct(){}

    public static function sendRequest(array $data)
    {

        if (!empty($data['methodName']))
        {
            $method = trim(strip_tags(htmlspecialchars($_POST['methodName'])));

            switch ($method) {
                case 'GetListClients':
                    $response = RequestService::getListClients();
                    break;
                case 'GetListClinics':
                    $response = RequestService::getListClinics();
                    break;
                case 'GetListEmployees':
                    $response = RequestService::getListEmployees();
                    break;
                case 'GetSchedule':
                    $response = RequestService::getSchedule($data);
                    break;
                case 'CreateOrder':
                    $response = RequestService::createOrder($data);
                    break;
                default:
                    $response = json_encode(['error' => 'Unknown api method - '.$method]);
                    break;
            }

            return $response;
        }
        else
        {
            return json_encode(['error' => 'Api method is empty']);
        }
    }
}

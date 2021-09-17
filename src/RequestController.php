<?php
namespace AlexNzr\BitUmcIntegration;

class RequestController{

    protected function __construct(){}

    /** checks the name of action and calls the relevant service
     * @param string $jsonData
     * @return string
     */
    public static function sendRequest(string $jsonData): string
    {
        try {
            $data = json_decode($jsonData, true);
            $data = Utils::cleanRequestData($data);
            if (is_array($data) && !empty($data['action']))
            {
                $action = $data['action'];

                switch ($action) {
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
                        $response = RequestService::getSchedule();
                        break;
                    case 'GetListOrders':
                        $response = RequestService::getListOrders($data);
                        break;
                    case 'CreateOrder':
                        $response = RequestService::createOrder($data);
                        break;
                    case 'CreateOrderUnauthorized':
                        $response = RequestService::createOrder($data, true);
                        break;
                    case "CancelOrder":
                        $response = RequestService::cancelOrder($data);
                        break;
                    default:
                        $response = Utils::addError('Unknown action - '.$action);
                        break;
                }

                return $response;
            }
            else
            {
                return Utils::addError('Action is empty');
            }
        }
        catch(\Exception $e)
        {
            return Utils::addError($e->getMessage());
        }
    }
}

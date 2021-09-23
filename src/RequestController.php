<?php
namespace AlexNzr\BitUmcIntegration;

class RequestController{

    protected function __construct(){}

    /** checks the name of action and calls demo or production service
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
                return Variables::DEMO_MODE === "Y" ? self::getDemoData($action) : self::sendRealRequest($action, $data);
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

    /** calls relevant service to make request
     * @param string $action
     * @param array $data
     * @return string
     */
    protected static function sendRealRequest(string $action, array $data): string
    {
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

    /** returns relevant demo data
     * @param string $action
     * @return string
     */
    protected static function getDemoData(string $action): string
    {
        switch ($action) {
            case 'GetListClients':
                $response = RequestServiceDemo::getListClients();
                break;
            case 'GetListClinics':
                $response = RequestServiceDemo::getListClinics();
                break;
            case 'GetListEmployees':
                $response = RequestServiceDemo::getListEmployees();
                break;
            case 'GetSchedule':
                $response = RequestServiceDemo::getSchedule();
                break;
            case 'GetListOrders':
                $response = RequestServiceDemo::getListOrders();
                break;
            case 'CreateOrderUnauthorized':
            case 'CreateOrder':
                $response = RequestServiceDemo::createOrder();
                break;
            case "CancelOrder":
                $response = RequestServiceDemo::cancelOrder();
                break;
            default:
                $response = Utils::addError('Unknown action - '.$action);
                break;
        }
        return $response;
    }
}

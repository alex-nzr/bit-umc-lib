<?php
namespace AlexNzr\BitUmcIntegration;

class RequestService{
	
	private static string $baseurl = Variables::PROTOCOL . Variables::COLON . Variables::D_SEP .
                                     Variables::BASE_ADDR . Variables::SEP .
                                     Variables::BASE_NAME . Variables::SEP .
                                     Variables::HTTP_SERVICE_PREFIX . Variables::SEP .
                                     Variables::HTTP_SERVICE_NAME . Variables::SEP .
                                     Variables::HTTP_SERVICE_API_VERSION . Variables::SEP;

	protected function __construct(){}

    /** get list of clients in json
     * @return string
     */
    public static function getListClients(): string
    {
        return self::post("GetListClients");
    }

    /** get list of clinics in json
     * @return string
     */
    public static function getListClinics(): string
    {
        return self::post("GetListClinics");
    }

    /** get list of employees in json
     * @return string
     */
    public static function getListEmployees(): string
    {
        return self::post("GetListEmployees");
    }

    /** get doctor's or cabinet's schedule in json
     * @return string
     */
    public static function getSchedule(): string
    {
        $period = Utils::getDateInterval(Variables::SCHEDULE_PERIOD_IN_DAYS);
        return self::post('GetSchedule', $period);
    }

    /** make request to creating order
     * @param array $params
     * @return string
     */
    public static function createOrder(array $params): string
    {
        if (Utils::validateOrderParams($params))
        {
            $params['orderDate'] = Utils::formatDateToOrder($params['orderDate']);
            $params['timeBegin'] = Utils::formatDateToOrder($params['timeBegin'], true);
            $params['timeEnd'] = Utils::formatDateToOrder($params['timeEnd'], true);
            return self::post('CreateOrder', $params);
        }
        return Utils::addError('Not enough params to make appointment');
    }

    /** make request to 1C database
     * @param string $method
     * @param array $params
     * @return string
     */
	protected static function post(string $method, array $params = []): string
    {
		$requestUrl = self::$baseurl . $method;

        if($curl = curl_init())
        {
            $authToken = base64_encode(Variables::AUTH_LOGIN.Variables::COLON.Variables::AUTH_PASSWORD);
            $headers = array(
                "Accept: application/json",
                "Authorization: Basic " . $authToken,
                "Content-Type: application/json;charset=utf-8",
            );

            $postData = json_encode($params);

            try
            {
                curl_setopt($curl, CURLOPT_URL, $requestUrl);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
                curl_setopt($curl, CURLOPT_POST, true);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
                curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
                $response = curl_exec($curl);
                curl_close($curl);

                if (self::isJSON($response)) {
                    return $response;
                }
                else{
                    return Utils::addError("Unexpected response - " . $response);
                }
            }
            catch (\Exception $e)
            {
                return Utils::addError($e->getMessage());
            }
        }else{
            return Utils::addError('Curl init error');
        }
	}

    /** checking the validity of the json
     * @param $string
     * @return bool
     */
	private static function isJSON($string): bool
    {
	    return is_string($string) && (is_object(json_decode($string)) || is_array(json_decode($string, true)));
	}
}

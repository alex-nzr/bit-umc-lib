<?
namespace AlexNzr\BitUmcIntegration;

class RequestService{
	
	private static string $baseurl = Variables::PROTOCOL .
                                     Variables::AUTHDATA .
                                     Variables::BASE_IP .
                                     Variables::BASE_NAME .
                                     Variables::HTTP_SERVICE_PREFIX .
                                     Variables::HTTP_SERVICE_NAME .
                                     Variables::HTTP_SERVICE_VERSION;
	
	protected function __construct(){}

    public static function getListClients(): string
    {
        return self::post("GetListClients");
    }

    public static function getListClinics(): string
    {
        return self::post("GetListClinics");
    }

    public static function getListEmployees(): string
    {
        return self::post("GetListEmployees");
    }

    public static function getSchedule($params): string
    {
        if (isset($params['startDate'], $params['finishDate']))
        {
            $params = urlencode(json_encode($params));
            return self::post('GetSchedule', $params);
        }

        return json_encode(array('error' => 'Missing params to load schedule'));
    }

    public static function createOrder($params): string
    {
        if (isset($_POST['doctorUID'],$_POST['surname'],$_POST['name'],$_POST['middleName'],$_POST['orderDate'],$_POST['timeBegin'],$_POST['timeEnd'],$_POST['phone'],$_POST['clinicGUID'])){
            $arParams['clinicGUID'] = strip_tags(htmlspecialchars($_POST['clinicGUID']));
            $arParams['doctorUID']  = strip_tags(htmlspecialchars($_POST['doctorUID']));
            $arParams['surname']    = urlencode(strip_tags(htmlspecialchars($_POST['surname'])));
            $arParams['name']       = urlencode(strip_tags(htmlspecialchars($_POST['name'])));
            $arParams['middleName'] = urlencode(strip_tags(htmlspecialchars($_POST['middleName'])));
            $arParams['orderDate']  = strip_tags(htmlspecialchars($_POST['orderDate']));
            $arParams['timeBegin']  = strip_tags(htmlspecialchars($_POST['timeBegin']));
            $arParams['timeEnd']    = strip_tags(htmlspecialchars($_POST['timeEnd']));
            $arParams['phone']      = strip_tags(htmlspecialchars($_POST['phone']));
            $arParams['email']    = urlencode(strip_tags(htmlspecialchars($_POST['email'])));
            $arParams['comment']    = urlencode(strip_tags(htmlspecialchars($_POST['comment'])));

            $params = urlencode(json_encode($params));
            RequestService::post($method, $params);
        }
    }

	protected static function post(string $method, string $params = 'no_data'): string
    {
		$requestUrl = self::$baseurl . $method . '/';

        if($curl = curl_init()) {
            curl_setopt($curl, CURLOPT_URL, $requestUrl . $params);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, null);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-type:application/json;charset=utf-8'));
            $response = curl_exec($curl);
            curl_close($curl);

            if (self::isJSON($response)) {
                return $response;
            }
            else{
                return json_encode(array('error' => $response));
            }
        }else{
            return json_encode(array('error' => 'Curl init error'));
        }
	}

	private static function isJSON($string): bool
    {
	    return is_string($string) && (is_object(json_decode($string)) || is_array(json_decode($string, true)));
	}
}

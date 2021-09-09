<?
namespace Emc\BitUmcAppointment;

class Request{
	
	private static string $baseurl = Variables::PROTOCOL .
                                     Variables::AUTHDATA .
                                     Variables::BASE_IP .
                                     Variables::BASE_NAME .
                                     Variables::HTTP_SERVICE_PREFIX .
                                     Variables::HTTP_SERVICE_NAME .
                                     Variables::HTTP_SERVICE_VERSION;
	
	protected function __construct(){}

	public static function post_request($requestName, $params = '{"no_params":"true"}'){
		$requestUrl = self::$baseurl . $requestName . '/';

		return self::send($requestUrl, $params);
	}

	private static function send($requestUrl, $params){
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
